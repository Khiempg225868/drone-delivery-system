const mongoose = require('mongoose');

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

module.exports = mongoose.model('Delivery', deliverySchema);
