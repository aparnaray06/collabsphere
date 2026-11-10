import mongoose from "mongoose";

async function connectDB() {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI is missing from server/.env");
  }

  await mongoose.connect(mongoURI);

  console.log("MongoDB connected successfully");
}

export default connectDB;