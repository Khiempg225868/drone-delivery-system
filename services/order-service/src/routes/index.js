import { Router } from "express";
import { locationRoute } from "./locationRoute.js";

const router = Router();

router.use("/api/location", locationRoute);

export const API = router;
