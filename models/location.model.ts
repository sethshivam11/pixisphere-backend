import mongoose, { Document, ObjectId, Schema } from "mongoose";

export interface LocationI extends Document {
  _id: ObjectId;
  city: string;
  region: string;
  country: string;
}

const LocationSchema: Schema<LocationI> = new Schema({
  city: {
    type: String,
    required: true,
    unique: true,
  },
});

const Location = mongoose.model<LocationI>("Location", LocationSchema);

export default Location;
