import mongoose, { Document, Schema } from "mongoose";

export interface CategoryI extends Document {
  _id: string;
  name: string;
  description: string;
}

const CategorySchema: Schema<CategoryI> = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    default: "",
  },
});

const Category = mongoose.model<CategoryI>("category", CategorySchema);

export default Category;
