import { verifyToken, getTokenFromHeaders } from "../config/jwt.js";

export const authMiddleware = (req, res, next) => {
  try {
    const token = getTokenFromHeaders(req);
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
