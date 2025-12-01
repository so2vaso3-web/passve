import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBankLogo extends Document {
  bankName: string; // Tên ngân hàng (VD: "Vietcombank")
  shortName: string; // Tên viết tắt (VD: "VCB")
  code: string; // Mã ngân hàng (VD: "VCB")
  logo: string; // URL logo ngân hàng (admin upload)
  isActive: boolean; // Có hiển thị trong dropdown không
  displayOrder: number; // Thứ tự hiển thị
  createdAt: Date;
  updatedAt: Date;
}

const BankLogoSchema = new Schema<IBankLogo>(
  {
    bankName: {
      type: String,
      required: true,
      unique: true, // Mỗi ngân hàng chỉ có 1 logo
    },
    shortName: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    logo: {
      type: String,
      required: true, // Logo bắt buộc phải có
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

BankLogoSchema.index({ isActive: 1, displayOrder: 1, bankName: 1 });

const BankLogo: Model<IBankLogo> =
  mongoose.models.BankLogo || mongoose.model<IBankLogo>("BankLogo", BankLogoSchema);

export default BankLogo;

