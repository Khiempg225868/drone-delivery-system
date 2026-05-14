import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  deliveryId: {
    type: String,
    required: true,
    unique: true,
  },
  droneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drone',
  },
  sender: {
    name: String,
    phone: String,
    address: String,
  },
  receiver: {
    name: String,
    phone: String,
    email: String,
    address: String,
    latitude: Number,
    longitude: Number,
  },
  package: {
    weight: Number,
    description: String,
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_transit', 'delivered', 'failed', 'cancelled'],
    default: 'pending',
  },
  customerConfirmed: {
    type: Boolean,
    default: false,
  },
  customerConfirmedAt: Date,
  customerRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  customerFeedback: String,
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Delivery = mongoose.model('Delivery', deliverySchema);
export default Delivery;
