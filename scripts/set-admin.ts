import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local
config({ path: resolve(__dirname, "../.env.local") });

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

async function setAdmin() {
  try {
    const db = await connectDB();
    if (!db) {
      console.error("❌ Không thể kết nối MongoDB!");
      console.log("💡 Kiểm tra MONGODB_URI trong .env.local");
      process.exit(1);
    }

    // Lấy email từ command line argument hoặc prompt
    const email = process.argv[2];

    if (!email) {
      console.error("❌ Vui lòng cung cấp email!");
      console.log("Cách dùng: npm run set-admin your-email@gmail.com");
      process.exit(1);
    }

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: "admin" },
      { new: true }
    );

    if (!user) {
      console.error(`❌ Không tìm thấy user với email: ${email}`);
      console.log("💡 Hãy đăng nhập bằng Google trước, sau đó chạy lại script này!");
      process.exit(1);
    }

    console.log(`✅ Đã set role admin cho: ${user.name} (${user.email})`);
    console.log("🔄 Bây giờ bạn có thể truy cập /admin");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }
}

setAdmin();

