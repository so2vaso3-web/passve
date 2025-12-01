import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb-client";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  // Tạm thời dùng JWT session thay vì database session (không cần MongoDB)
  session: {
    strategy: "jwt",
  },
  // adapter: MongoDBAdapter(clientPromise), // Tạm comment để test không cần MongoDB
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const db = await connectDB();
          if (!db) {
            console.error("Database not connected for credentials auth");
            return null;
          }

          // Dynamic import bcryptjs để tránh lỗi build
          const bcrypt = (await import("bcryptjs")).default;
          
          const user = await User.findOne({ email: credentials.email.toLowerCase() })
            .select("+password") // Include password field
            .maxTimeMS(5000);

          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }

          if (!user.password) {
            console.log("User has no password (maybe signed up with Google):", credentials.email);
            return null;
          }

          // Check if user is active
          if (user.isActive === false) {
            throw new Error("Tài khoản của bạn đã bị khóa");
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            console.log("Invalid password for:", credentials.email);
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (error: any) {
          console.error("Credentials auth error:", error);
          if (error.message?.includes("khóa")) {
            throw error;
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Với JWT strategy, dùng token thay vì user
      if (session.user && token) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role || "user";
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Lưu thông tin user vào token
      if (user) {
        token.id = user.id;
        token.role = "user"; // Mặc định là user
        // Nếu có MongoDB, lấy role từ database
        try {
          await connectDB();
          const isAdmin = user.email === "admpcv3@gmail.com";
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            // Update role nếu là admin email
            if (isAdmin && dbUser.role !== "admin") {
              await User.findByIdAndUpdate(dbUser._id, { role: "admin" });
              token.role = "admin";
            } else {
              token.role = dbUser.role;
            }
          } else if (user.email) {
            // Set admin cho email admpcv3@gmail.com
            // Tạo user mới nếu chưa có
            try {
              await User.create({
                name: user.name,
                email: user.email,
                image: user.image,
                role: isAdmin ? "admin" : "user",
              });
              token.role = isAdmin ? "admin" : "user";
            } catch (error) {
              // Ignore nếu MongoDB không chạy
              console.log("MongoDB not available, using JWT only");
              // Vẫn set role cho JWT
              token.role = isAdmin ? "admin" : "user";
            }
          }
        } catch (error) {
          // Ignore nếu MongoDB không chạy
          console.log("MongoDB not available, using JWT only");
          // Set admin cho email admpcv3@gmail.com ngay cả khi không có DB
          if (user.email === "admpcv3@gmail.com") {
            token.role = "admin";
          }
        }
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      // Luôn cho phép đăng nhập
      return true;
    },
  },
  pages: {
    signIn: "/api/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

