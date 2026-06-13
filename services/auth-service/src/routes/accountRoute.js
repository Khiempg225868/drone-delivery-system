import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { accountController } from "../controllers/accountController.js";
import { authMiddleware, authRoles } from "../middlewares/auth.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(StatusCodes.OK).json({
    message: "Welcome to the Account API",
  });
});

router.post("/login", accountController.loginAccount);
router.post("/create", accountController.createAccount);
router.post("/change-password", authMiddleware, accountController.changePassword);
router.delete("/:id", authMiddleware, authRoles("leader", "admin"), accountController.removeAccount);
router.put("/:id", authMiddleware, authRoles("leader", "admin"), accountController.updateAccount);
router.post("/forget-password", accountController.forgetPassword);
router.get("/get-all", authMiddleware, authRoles("leader", "admin"), accountController.getAllAccounts);

export const accountRoute = router;
