import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { resolve } from "path";

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function changePassword() {
  try {
    console.log("🔍 Đang kết nối MongoDB...");
    await mongoose.connect(MONGODB_URI!);
    console.log("✅ Đã kết nối MongoDB");

    const email = "admpcv3@gmail.com";
    const newPassword = "123123@";

    console.log(`\n🔐 Đang tìm user: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`❌ Không tìm thấy user với email: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Tìm thấy user: ${user.name || email}`);
    console.log(`\n🔐 Đang hash mật khẩu mới...`);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log(`💾 Đang cập nhật mật khẩu...`);
    user.password = hashedPassword;
    await user.save();

    console.log(`\n✅ Đã đổi mật khẩu thành công!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Mật khẩu mới: ${newPassword}`);
    console.log(`\n⚠️  Lưu ý: Hãy đổi mật khẩu này sau khi đăng nhập!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Lỗi:", error.message);
    process.exit(1);
  }
}

changePassword();