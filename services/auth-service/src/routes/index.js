import { Router } from "express";
import { accountRoute } from "./accountRoute.js";

const router = Router();

router.use("/api/account", accountRoute);

export const API = router;
