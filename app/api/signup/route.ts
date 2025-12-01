import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, username, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Username validation (nếu có)
    if (username) {
      const usernameRegex = /^[a-z0-9]+$/;
      if (!usernameRegex.test(username.toLowerCase())) {
        return NextResponse.json(
          { error: "Tên người dùng chỉ được chứa chữ cái thường và số (a-z, 0-9)" },
          { status: 400 }
        );
      }
      if (username.length < 3) {
        return NextResponse.json(
          { error: "Tên người dùng phải có ít nhất 3 ký tự" },
          { status: 400 }
        );
      }
      if (username.length > 20) {
        return NextResponse.json(
          { error: "Tên người dùng không được quá 20 ký tự" },
          { status: 400 }
        );
      }

      // Check if username already exists
      const existingUsername = await User.findOne({ username: username.toLowerCase() }).maxTimeMS(5000);
      if (existingUsername) {
        return NextResponse.json(
          { error: "Tên người dùng này đã được sử dụng. Vui lòng chọn tên khác." },
          { status: 400 }
        );
      }
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    if (!db) {
      console.error("❌ Database connection failed in signup route");
      return NextResponse.json(
        { error: "Không thể kết nối đến cơ sở dữ liệu. Vui lòng kiểm tra cấu hình MongoDB trong .env.local" },
        { status: 503 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() }).maxTimeMS(5000);
    if (existingUser) {
      return NextResponse.json(
        { error: "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác." },
        { status: 400 }
      );
    }

    // Dynamic import bcryptjs để tránh lỗi build
    let bcrypt: any;
    try {
      bcrypt = (await import("bcryptjs")).default;
    } catch (importError) {
      console.error("Failed to import bcryptjs:", importError);
      return NextResponse.json(
        { error: "Lỗi hệ thống. Vui lòng thử lại sau." },
        { status: 500 }
      );
    }
    
    // Hash password
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError: any) {
      console.error("Password hash error:", hashError);
      return NextResponse.json(
        { error: "Lỗi khi mã hóa mật khẩu. Vui lòng thử lại." },
        { status: 500 }
      );
    }

    // Set admin cho email admpcv3@gmail.com
    const isAdmin = email.toLowerCase() === "admpcv3@gmail.com";

    // Create user
    let user;
    try {
      user = await User.create({
        name: name.trim(),
        username: username ? username.toLowerCase().trim() : undefined,
        email: email.toLowerCase().trim(),
        password: hashedPassword, // Lưu password đã hash
        role: isAdmin ? "admin" : "user",
        isActive: true,
      });
    } catch (createError: any) {
      console.error("User creation error:", createError);
      if (createError.code === 11000) {
        return NextResponse.json(
          { error: "Email này đã được sử dụng" },
          { status: 400 }
        );
      }
      throw createError;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Đăng ký thành công",
        user: {
          id: user._id.toString(),
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Sign up error:", error);
    
    // Handle duplicate email error
    if (error.code === 11000 || error.message?.includes("duplicate")) {
      return NextResponse.json(
        { error: "Email này đã được sử dụng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Có lỗi xảy ra khi đăng ký" },
      { status: 500 }
    );
  }
}

