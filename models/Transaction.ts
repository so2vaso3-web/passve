import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  type: "deposit" | "withdraw" | "sale" | "purchase" | "escrow_hold" | "escrow_release" | "refund";
  amount: number;
  status: "pending" | "completed" | "rejected" | "cancelled";
  method?: "momo" | "vnpay" | "zalopay" | "bank_transfer" | "bank_withdraw" | "sepay";
  description: string;
  ticket?: mongoose.Types.ObjectId; // Liên kết với vé nếu có
  bankAccount?: mongoose.Types.ObjectId; // Liên kết với tài khoản ngân hàng nếu rút tiền
  adminNote?: string; // Ghi chú của admin
  sepayTransactionId?: string; // SePay transaction ID
  sepayPaymentUrl?: string; // SePay payment URL
  completedAt?: Date; // Thời gian hoàn thành
  errorMessage?: string; // Thông báo lỗi nếu có
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdraw", "sale", "purchase", "escrow_hold", "escrow_release", "refund"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected", "cancelled"],
      default: "pending",
    },
    method: {
      type: String,
      enum: ["momo", "vnpay", "zalopay", "bank_transfer", "bank_withdraw", "sepay"],
    },
    description: {
      type: String,
      required: true,
    },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
    },
    bankAccount: {
      type: Schema.Types.ObjectId,
      ref: "User.bankAccounts",
    },
    adminNote: {
      type: String,
    },
    sepayTransactionId: {
      type: String,
    },
    sepayPaymentUrl: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ status: 1, type: 1 });

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
