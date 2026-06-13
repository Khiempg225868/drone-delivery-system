import mongoose from "mongoose";
import { env } from "./environments.js";

async function connectDB() {
  try {
    await mongoose.connect(env.MONGO_URI, {
      dbName: env.DATABASE_NAME,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

export default connectDB;
