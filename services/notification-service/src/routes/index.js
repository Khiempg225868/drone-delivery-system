import { Router } from "express";
import { notificationRoute } from "./notificationRoute.js";

const router = Router();

router.use("/api/location", notificationRoute);

export const API = router;
