const Drone = require('../models/Drone');

// Get all drones
exports.getAllDrones = async (req, res) => {
  try {
    const drones = await Drone.find();
    res.json(drones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get drone by ID
exports.getDroneById = async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id);
    if (!drone) return res.status(404).json({ message: 'Drone not found' });
    res.json(drone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new drone
exports.createDrone = async (req, res) => {
  const drone = new Drone(req.body);
  try {
    const newDrone = await drone.save();
    res.status(201).json(newDrone);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update drone
exports.updateDrone = async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id);
    if (!drone) return res.status(404).json({ message: 'Drone not found' });
    
    Object.assign(drone, req.body);
    drone.updatedAt = Date.now();
    const updatedDrone = await drone.save();
    res.json(updatedDrone);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete drone
exports.deleteDrone = async (req, res) => {
  try {
    const drone = await Drone.findByIdAndDelete(req.params.id);
    if (!drone) return res.status(404).json({ message: 'Drone not found' });
    res.json({ message: 'Drone deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
