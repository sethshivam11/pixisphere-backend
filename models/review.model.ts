import mongoose, { ObjectId, Schema } from "mongoose";

export interface ReviewI extends Document {
  _id: ObjectId;
  user: ObjectId;
  profile: ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema: Schema<ReviewI> = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  profile: {
    type: Schema.Types.ObjectId,
    ref: "user",
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
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model<ReviewI>("review", ReviewSchema);

export default Review;
