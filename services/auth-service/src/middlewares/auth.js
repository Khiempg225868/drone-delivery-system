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

export const authRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
