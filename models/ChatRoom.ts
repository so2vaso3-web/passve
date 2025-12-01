import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatRoom extends Document {
  ticket: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCountBuyer: number;
  unreadCountSeller: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatRoomSchema = new Schema<IChatRoom>(
  {
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: String,
    },
    lastMessageAt: {
      type: Date,
    },
    unreadCountBuyer: {
      type: Number,
      default: 0,
    },
    unreadCountSeller: {
      type: Number,
      default: 0,
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

// Index để tìm room nhanh
ChatRoomSchema.index({ ticket: 1, buyer: 1, seller: 1 });
ChatRoomSchema.index({ buyer: 1, updatedAt: -1 });
ChatRoomSchema.index({ seller: 1, updatedAt: -1 });
// Index để tìm room giữa buyer và seller (không cần ticket)
ChatRoomSchema.index({ buyer: 1, seller: 1, isActive: 1 });
ChatRoomSchema.index({ seller: 1, buyer: 1, isActive: 1 });

const ChatRoom: Model<IChatRoom> =
  mongoose.models.ChatRoom || mongoose.model<IChatRoom>("ChatRoom", ChatRoomSchema);

export default ChatRoom;

