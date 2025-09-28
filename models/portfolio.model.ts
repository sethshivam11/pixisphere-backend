import mongoose from "mongoose";
import { ObjectId, Schema } from "mongoose";

export interface PortfolioI extends Document {
  _id: ObjectId;
  user: ObjectId;
  media: {
    index: number;
    url: string;
    description: string;
  }[];
}

const PortfolioSchema: Schema<PortfolioI> = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  media: [
    {
      index: { type: Number, required: true },
      url: { type: String, required: true },
      description: { type: String, default: "" },
    },
  ],
});

const Portfolio = mongoose.model<PortfolioI>("portfolio", PortfolioSchema);

export default Portfolio;
