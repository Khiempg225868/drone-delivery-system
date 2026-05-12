import { Router } from "express";
import { accountRoute } from "./accountRoute.js";
import { locationRoute } from "./locationRoute.js";
const router = Router();

router.use("/api/account", accountRoute);
router.use("/api/location", locationRoute);
export const API = router;