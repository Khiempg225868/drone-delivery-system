import mongoose from "mongoose";
import { env } from "./environments.js";
const Mongo_URI = env.MONGO_URI;
const dbname = env.DATABASE_NAME;
async function connectDB() {
  try {
    await mongoose.connect(Mongo_URI, {
      dbName: dbname,
    });
    console.log(`MogoDB connected successfully `);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}
export default connectDB;