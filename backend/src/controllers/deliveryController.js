const Delivery = require('../models/Delivery');

// Get all deliveries
exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find().populate('droneId');
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get delivery by ID
exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id).populate('droneId');
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new delivery
exports.createDelivery = async (req, res) => {
  const delivery = new Delivery(req.body);
  try {
    const newDelivery = await delivery.save();
    res.status(201).json(newDelivery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update delivery
exports.updateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    
    Object.assign(delivery, req.body);
    delivery.updatedAt = Date.now();
    const updatedDelivery = await delivery.save();
    res.json(updatedDelivery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete delivery
exports.deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    res.json({ message: 'Delivery deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
