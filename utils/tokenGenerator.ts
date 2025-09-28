import { ObjectId } from "mongoose";
import jwt from "jsonwebtoken";

const generateToken = (data: {
  _id: ObjectId;
  fullName: string;
  email: string;
  isVerified: boolean;
  status: {
    current: "verified" | "rejected" | "pending";
    comment: string;
  };
  role: "client" | "partner" | "admin";
  city: string | null;
  createdAt: string;
}) => {
  const token = jwt.sign(data, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
  return token;
};

export default generateToken;
