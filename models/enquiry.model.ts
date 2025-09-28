import mongoose, { ObjectId, Schema } from "mongoose";

export interface EnquiryI extends Document {
  _id: ObjectId;
  category: ObjectId | null;
  client: ObjectId;
  date: Date;
  budget: number;
  city: ObjectId | null;
  status: "new" | "responded" | "booked" | "closed";
  message: string;
  referenceImage: string;
  assignedPartners: ObjectId[];
  createdAt: Date;
}

const EnquirySchema: Schema<EnquiryI> = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: "category",
    default: null
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  city: {
    type: Schema.Types.ObjectId,
    ref: "location",
    default: null,
  },
  status: {
    type: String,
    enum: ["new", "responded", "booked", "closed"],
    default: "new",
  },
  message: {
    type: String,
    required: true,
  },
  referenceImage: {
    type: String,
    default: "",
  },
  assignedPartners: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Enquiry = mongoose.model<EnquiryI>("enquiry", EnquirySchema);

export default Enquiry;
