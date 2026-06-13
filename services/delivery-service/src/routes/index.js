import { Router } from "express";
import { deliveryRoute } from "./deliveryRoute.js";

const router = Router();

router.use("/api", deliveryRoute);

export const API = router;
