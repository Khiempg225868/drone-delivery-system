import jwt from "jsonwebtoken";
import { env } from "./environments.js";

export const generateToken = (user) => {
  const payload = {
    email: user.Email,
    phone: user.Phone,
    role: user.Role,
  };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRATION,
  });
};
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw error;
  }
};
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error("Error decoding token");
  }
};
export const getTokenFromHeaders = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error("Authorization header not found");
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new Error("Token not found");
  }
  return token;
};