import mongoose from "mongoose";
import { randomUUID } from "crypto";

const orderSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    houseId: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      default: 0,
    },
    lng: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "in_transit", "delivered", "cancelled"],
      default: "pending",
    },
    package: {
      weight: Number,
      description: String,
    },
    sequence: {
      type: Number,
      default: null,
    },
    totalDistanceKm: {
      type: Number,
      default: null,
    },
    algorithmName: {
      type: String,
      default: null,
    },
    algorithmTimeMs: {
      type: Number,
      default: null,
    },
    optimizedAt: {
      type: Date,
      default: null,
    },
    droneId: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
