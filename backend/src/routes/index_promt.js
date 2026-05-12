const express = require('express');
const droneController = require('../controllers/droneController');
const deliveryController = require('../controllers/deliveryController');
import {Router} from 'express';
const router = Router();

// Drone Routes
router.get('/drones', droneController.getAllDrones);
router.get('/drones/:id', droneController.getDroneById);
router.post('/drones', droneController.createDrone);
router.put('/drones/:id', droneController.updateDrone);
router.delete('/drones/:id', droneController.deleteDrone);

// Delivery Routes
router.get('/deliveries', deliveryController.getAllDeliveries);
router.get('/deliveries/:id', deliveryController.getDeliveryById);
router.post('/deliveries', deliveryController.createDelivery);
router.put('/deliveries/:id', deliveryController.updateDelivery);
router.delete('/deliveries/:id', deliveryController.deleteDelivery);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

export default router;
