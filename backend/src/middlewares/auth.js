import { verifyToken } from "../config/jwt.js";
import { getTokenFromHeaders } from "../config/jwt.js";

export const authMiddleware = (req, res, next) => {
  const token = getTokenFromHeaders(req);
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
export const authRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};