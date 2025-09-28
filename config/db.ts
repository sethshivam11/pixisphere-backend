import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const { connection } = await mongoose.connect(
      process.env.MONGODB_URI as string
    );
    if (connection) {
      console.log("Connected to MongoDB", connection.host);
    }
    return connection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDb;
