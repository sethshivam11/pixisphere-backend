import mongoose, { ObjectId, Schema } from "mongoose";

export interface UserI extends Document {
  _id: ObjectId;
  role: "client" | "partner" | "admin";
  fullName: string;
  city: ObjectId | null;
  email: string;
  password: string;
  isVerified: boolean;
  status: {
    current: "verified" | "rejected" | "pending";
    comment: "";
  };
  code: string;
  aadhar: string;
  codeExpiry: Date;
  createdAt: Date;
}

const UserSchema: Schema<UserI> = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["client", "partner", "admin"],
    default: "client",
  },
  city: {
    type: Schema.Types.ObjectId,
    ref: "location",
  },
  code: {
    type: String,
    maxLength: 6,
    default: "",
  },
  codeExpiry: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
  status: {
    current: {
      type: String,
      enum: ["verified", "rejected", "pending"],
      default: "pending",
    },
    comment: {
      type: String,
      default: "",
    },
  },
  aadhar: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const User = mongoose.model<UserI>("user", UserSchema);

export default User;
