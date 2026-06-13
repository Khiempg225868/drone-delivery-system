import mongoose from "mongoose";
import { randomUUID } from "crypto";

const houseSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    houseId: {
      type: Number,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    zone: {
      type: String,
      default: "vinhomes",
    },
    owner: {
      name: String,
      phone: String,
      email: String,
    },
    hasOwner: {
      type: Boolean,
      default: false,
    },
    hasOrder: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "inactive"],
      default: "available",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const House = mongoose.model("House", houseSchema);

export default House;
