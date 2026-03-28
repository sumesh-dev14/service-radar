import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest, JWTPayload } from "../types";
import { sendError } from "../utils/responseHandler";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("CRITICAL: JWT_SECRET environment variable is not defined. Please set it in .env file.");
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from HttpOnly cookie
    const token =
    (req.cookies as any)?.authToken ||
    req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    sendError(res, 401, "Missing authentication token");
    return;
  }
    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Fetch user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      sendError(res, 401, "User not found");
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, 401, "Token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      sendError(res, 401, "Invalid token");
    } else {
      console.error("Auth middleware error:", error);
      sendError(res, 401, "Unauthorized");
    }
  }
};
