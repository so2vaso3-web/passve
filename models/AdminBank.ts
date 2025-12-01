import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdminBank extends Document {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrCode?: string;
  logo?: string; // URL QR code cho Momo/ZaloPay
  type: "bank" | "momo" | "zalopay" | "vnpay";
  isActive: boolean;
  displayOrder: number; // Thứ tự hiển thị
  createdAt: Date;
  updatedAt: Date;
}

const AdminBankSchema = new Schema<IAdminBank>(
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
    qrCode: {
      type: String,
    },
    type: {
      type: String,
      enum: ["bank", "momo", "zalopay", "vnpay"],
      required: true,
      default: "bank",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

AdminBankSchema.index({ type: 1, isActive: 1, displayOrder: 1 });

const AdminBank: Model<IAdminBank> =
  mongoose.models.AdminBank || mongoose.model<IAdminBank>("AdminBank", AdminBankSchema);

export default AdminBank;

