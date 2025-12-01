import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITicket extends Document {
  seller: mongoose.Types.ObjectId;
  title: string;
  movieId?: number; // ID từ TMDb
  movieTitle: string;
  moviePoster?: string;
  cinema: string; // Tên rạp
  city: string; // Thành phố
  showDate: Date; // Ngày chiếu
  showTime: string; // Giờ chiếu (VD: "14:00")
  seats: string; // Số ghế cụ thể (VD: "G12 G13" hoặc "VIP 05")
  quantity: number; // Số lượng vé
  originalPrice: number; // Giá gốc
  sellingPrice: number; // Giá bán lại
  images: string[]; // URLs ảnh vé từ Cloudinary (ảnh chính, hiển thị công khai)
  qrImage?: string; // URL ảnh mã QR (ẩn, chỉ hiển thị khi người mua đã mua)
  reason?: string; // Lý do bán
  description?: string;
  ticketCode?: string; // Mã vé (nếu có sẵn, người mua sẽ nhận ngay)
  status: "pending" | "approved" | "sold" | "cancelled" | "rejected" | "expired" | "on_hold";
  onHoldBy?: mongoose.Types.ObjectId; // Người đang giữ vé
  onHoldAt?: Date; // Thời gian giữ vé
  category: "movie" | "concert" | "event";
  buyer?: mongoose.Types.ObjectId;
  soldAt?: Date;
  expireAt: Date; // Tự động = showDate + showTime + 3 giờ (dùng cho TTL Index)
  isExpired: boolean; // Tính tự động
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    movieId: {
      type: Number,
    },
    movieTitle: {
      type: String,
      required: true,
    },
    moviePoster: {
      type: String,
    },
    cinema: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    showDate: {
      type: Date,
      required: true,
    },
    showTime: {
      type: String,
      required: true,
    },
    seats: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
      validate: {
        validator: function(v: number) {
          return v >= 50000; // Giá bán lại phải >= 50k
        },
        message: "Giá bán lại phải lớn hơn hoặc bằng 50,000 VNĐ",
      },
    },
    reason: {
      type: String,
    },
    images: {
      type: [String],
      required: true,
    },
    qrImage: {
      type: String,
      // Optional: Ảnh mã QR, chỉ hiển thị khi người mua đã mua
    },
    description: {
      type: String,
    },
    ticketCode: {
      type: String,
      // Optional: Nếu có mã vé, người mua sẽ nhận ngay sau khi mua
    },
    status: {
      type: String,
      enum: ["pending", "approved", "sold", "cancelled", "rejected", "expired", "on_hold"],
      default: "pending",
    },
    onHoldBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    onHoldAt: {
      type: Date,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    expireAt: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      enum: ["movie", "concert", "event"],
      default: "movie",
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    soldAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm nhanh
TicketSchema.index({ status: 1, createdAt: -1 });
TicketSchema.index({ city: 1, category: 1 });
TicketSchema.index({ seller: 1 });
// TTL Index - tự động xóa document sau khi expireAt
TicketSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema);

export default Ticket;

