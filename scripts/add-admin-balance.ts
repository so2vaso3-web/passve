import dotenv from "dotenv";
import { resolve } from "path";
import mongoose from "mongoose";

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

// Import models after env is loaded
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
}, { collection: "users" });

const WalletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  balance: { type: Number, default: 0 },
  escrow: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
}, { collection: "wallets", timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Wallet = mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);

async function addAdminBalance() {
  try {
    console.log("🔍 Đang kết nối MongoDB...");
    await mongoose.connect(MONGODB_URI!);
    console.log("✅ Đã kết nối MongoDB");

  const adminEmail = "admpcv3@gmail.com";
  const amountToAdd = 100000000; // 100 triệu VNĐ

  console.log(`🔍 Đang tìm admin: ${adminEmail}`);
  const admin = await User.findOne({ email: adminEmail.toLowerCase() });

  if (!admin) {
    console.error(`❌ Không tìm thấy admin với email: ${adminEmail}`);
    process.exit(1);
  }
  console.log(`✅ Tìm thấy admin: ${admin.name}`);

  console.log("💰 Đang tìm hoặc tạo wallet...");
  let wallet = await Wallet.findOne({ user: admin._id });
  if (!wallet) {
    wallet = await Wallet.create({
      user: admin._id,
      balance: 0,
      escrow: 0,
      totalEarned: 0,
    });
    console.log("✅ Đã tạo wallet mới cho admin");
  } else {
    console.log(`📊 Số dư hiện tại: ${wallet.balance.toLocaleString("vi-VN")} đ`);
  }

  console.log(`💵 Đang cộng ${amountToAdd.toLocaleString("vi-VN")} đ vào ví...`);
  wallet.balance += amountToAdd;
  await wallet.save();

    console.log("\n✅ Đã cộng tiền thành công!");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`💰 Số dư mới: ${wallet.balance.toLocaleString("vi-VN")} đ`);
    console.log(`💵 Đã cộng: ${amountToAdd.toLocaleString("vi-VN")} đ`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Lỗi:", error.message);
    process.exit(1);
  }
}

addAdminBalance();


import mongoose from "mongoose";

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

// Import models after env is loaded
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
}, { collection: "users" });

const WalletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  balance: { type: Number, default: 0 },
  escrow: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
}, { collection: "wallets", timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Wallet = mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);

async function addAdminBalance() {
  try {
    console.log("🔍 Đang kết nối MongoDB...");
    await mongoose.connect(MONGODB_URI!);
    console.log("✅ Đã kết nối MongoDB");

  const adminEmail = "admpcv3@gmail.com";
  const amountToAdd = 100000000; // 100 triệu VNĐ

  console.log(`🔍 Đang tìm admin: ${adminEmail}`);
  const admin = await User.findOne({ email: adminEmail.toLowerCase() });

  if (!admin) {
    console.error(`❌ Không tìm thấy admin với email: ${adminEmail}`);
    process.exit(1);
  }
  console.log(`✅ Tìm thấy admin: ${admin.name}`);

  console.log("💰 Đang tìm hoặc tạo wallet...");
  let wallet = await Wallet.findOne({ user: admin._id });
  if (!wallet) {
    wallet = await Wallet.create({
      user: admin._id,
      balance: 0,
      escrow: 0,
      totalEarned: 0,
    });
    console.log("✅ Đã tạo wallet mới cho admin");
  } else {
    console.log(`📊 Số dư hiện tại: ${wallet.balance.toLocaleString("vi-VN")} đ`);
  }

  console.log(`💵 Đang cộng ${amountToAdd.toLocaleString("vi-VN")} đ vào ví...`);
  wallet.balance += amountToAdd;
  await wallet.save();

    console.log("\n✅ Đã cộng tiền thành công!");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`💰 Số dư mới: ${wallet.balance.toLocaleString("vi-VN")} đ`);
    console.log(`💵 Đã cộng: ${amountToAdd.toLocaleString("vi-VN")} đ`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Lỗi:", error.message);
    process.exit(1);
  }
}

addAdminBalance();

