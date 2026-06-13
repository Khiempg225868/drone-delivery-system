import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  houseId: {
    type: String,
    required: true,
  },
  houseName: {
    type: String,
    required: true,
  },
  ownerName: String,
  ownerPhone: String,
  ownerEmail: String,
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["SMS", "EMAIL", "PUSH", "IN_APP"],
    default: "IN_APP",
  },
  status: {
    type: String,
    enum: ["PENDING", "SENT", "FAILED"],
    default: "PENDING",
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  failureReason: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Notification", notificationSchema);
