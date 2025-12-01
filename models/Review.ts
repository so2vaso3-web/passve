import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  reviewer: mongoose.Types.ObjectId; // Người đánh giá
  reviewed: mongoose.Types.ObjectId; // Người được đánh giá
  transaction: mongoose.Types.ObjectId;
  rating: number; // 1-5 sao
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewed: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transaction: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ reviewed: 1, createdAt: -1 });

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;



