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
  images: string[]; // URLs ảnh vé từ Cloudinary (ảnh chính, hiển thị công khai) - chỉ 1 ảnh
  qrImage?: string[]; // URLs ảnh mã QR (ẩn, chỉ hiển thị khi người mua đã mua) - tối đa 5 ảnh, bắt buộc
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
      validate: {
        validator: function(v: string[]) {
          return v && v.length === 1; // Chỉ 1 ảnh vé
        },
        message: "Chỉ được upload 1 ảnh vé",
      },
    },
    qrImage: {
      type: [String],
      required: true, // Bắt buộc phải có ít nhất 1 ảnh QR
      validate: {
        validator: function(v: any) {
          if (!v) return false;
          const arr = Array.isArray(v) ? v : (typeof v === 'string' ? [v] : []);
          return arr.length > 0 && arr.length <= 5; // Tối đa 5 ảnh
        },
        message: "Phải có ít nhất 1 ảnh mã QR và tối đa 5 ảnh",
      },
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
    autoDeleteAt: {
      type: Date,
      // Tự động xóa vé đã mua sau 10 ngày kể từ ngày mua
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook để đảm bảo qrImage luôn là array
TicketSchema.pre('save', function(next) {
  if (this.qrImage) {
    if (!Array.isArray(this.qrImage)) {
      // Nếu là string, thử parse JSON hoặc convert thành array
      if (typeof this.qrImage === 'string') {
        try {
          const parsed = JSON.parse(this.qrImage);
          this.qrImage = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          this.qrImage = [this.qrImage];
        }
      } else {
        this.qrImage = [this.qrImage];
      }
    }
    // Đảm bảo tất cả phần tử là string
    this.qrImage = this.qrImage.map((item: any) => String(item)).filter((item: string) => item.trim().length > 0);
  }
  next();
});

// Index để tìm kiếm nhanh
TicketSchema.index({ status: 1, createdAt: -1 });
TicketSchema.index({ city: 1, category: 1 });
TicketSchema.index({ seller: 1 });
// TTL Index - tự động xóa document sau khi expireAt
TicketSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
// TTL Index - tự động xóa vé đã mua sau 10 ngày
TicketSchema.index({ autoDeleteAt: 1 }, { expireAfterSeconds: 0 });

// Xóa model cũ nếu có để tránh cache schema cũ
if (mongoose.models.Ticket) {
  delete mongoose.models.Ticket;
}

const Ticket: Model<ITicket> = mongoose.model<ITicket>("Ticket", TicketSchema);

export default Ticket;

