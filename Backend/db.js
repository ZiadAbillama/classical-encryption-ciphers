// db.js
import mongoose from "mongoose";
import "dotenv/config";

export async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/cryptolab";
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log("Mongo connected");
}
