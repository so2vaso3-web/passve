import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
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
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.role = dbUser.role;
          } else if (user.email) {
            // Tạo user mới nếu chưa có
            try {
              await User.create({
                name: user.name,
                email: user.email,
                image: user.image,
                role: "user",
              });
            } catch (error) {
              // Ignore nếu MongoDB không chạy
              console.log("MongoDB not available, using JWT only");
            }
          }
        } catch (error) {
          // Ignore nếu MongoDB không chạy
          console.log("MongoDB not available, using JWT only");
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

