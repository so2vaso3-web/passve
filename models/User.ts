import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  username?: string; // Username unique, chỉ chứa a-z, 0-9, không có ký tự đặc biệt
  email: string;
  password?: string; // Password hash (chỉ dùng cho email/password login)
  phone?: string;
  image?: string;
  role: "user" | "admin";
  wallet: number; // Số dư ví (VNĐ) - deprecated, dùng Wallet model
  rating: number; // Điểm đánh giá trung bình (0-5)
  totalReviews: number;
  bankAccounts: IBankAccount[];
  isActive: boolean; // Admin có thể khóa user
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true, // Cho phép null/undefined nhưng unique nếu có giá trị
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+$/, // Chỉ cho phép chữ thường và số
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: false, // Không trả về password khi query mặc định
    },
    phone: {
      type: String,
      sparse: true,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    wallet: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    bankAccounts: {
      type: [
        {
          bankName: {
            type: String,
            required: true,
          },
          accountNumber: {
            type: String,
            required: true,
          },
          accountHolder: {
            type: String,
            required: true,
          },
          branch: {
            type: String,
          },
          isDefault: {
            type: Boolean,
            default: false,
          },
        },
      ],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

