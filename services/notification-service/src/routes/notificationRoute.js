import { Router } from "express";
import { notificationController } from "../controllers/notificationController.js";

const router = Router();

router.post("/notify-arrival", notificationController.notifyArrival);
router.get("/notifications", notificationController.getNotificationHistory);
router.get("/notifications/stats", notificationController.getNotificationStats);

export const notificationRoute = router;
