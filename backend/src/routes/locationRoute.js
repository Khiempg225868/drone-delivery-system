import { Router } from "express";
import { houseController } from "../controllers/houseController.js";
import { orderController } from "../controllers/orderController.js";

const router = Router();

// House endpoints
router.post("/houses/generate", houseController.generateHouses);
router.get("/houses", houseController.getAllHouses);
router.get("/houses/zone/:zone", houseController.getHousesByZone);
router.post("/houses/batch", houseController.addBatchHouses);
router.post("/houses/search-owner", houseController.searchByOwner);
router.post("/houses/search-customer", houseController.searchCustomerHouses);
router.post("/houses/:houseId/register-owner", houseController.registerOwner);
router.post("/notify-arrival", houseController.notifyArrival);

// Notification endpoints
router.get("/notifications", houseController.getNotificationHistory);
router.get("/notifications/stats", houseController.getNotificationStats);

// Order endpoints
router.post("/orders/toggle", orderController.toggleOrder);
router.get("/orders", orderController.getPendingOrders);
router.delete("/orders/:orderId", orderController.removeOrder);
router.post("/orders/optimize", orderController.optimizeRoute);
router.delete("/orders/clear", orderController.clearOrders);

export const locationRoute = router;