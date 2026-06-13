import { Router } from "express";
import deliveryController from "../controllers/deliveryController.js";
import droneController from "../controllers/droneController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

router.get("/drones", droneController.getAllDrones);
router.get("/drones/:id", droneController.getDroneById);
router.post("/drones", droneController.createDrone);
router.put("/drones/:id", droneController.updateDrone);
router.delete("/drones/:id", droneController.deleteDrone);

router.get("/deliveries", deliveryController.getAllDeliveries);
router.get("/deliveries/my", authMiddleware, deliveryController.getMyDeliveries);
router.get("/deliveries/:id", deliveryController.getDeliveryById);
router.post("/deliveries", deliveryController.createDelivery);
router.put("/deliveries/:id", deliveryController.updateDelivery);
router.delete("/deliveries/:id", deliveryController.deleteDelivery);
router.post("/deliveries/:id/confirm", authMiddleware, deliveryController.confirmDelivery);

export const deliveryRoute = router;
