import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { sendError } from "../utils/responseHandler";

export const requireRole = (requiredRole: "customer" | "provider") => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    if (req.user.role !== requiredRole) {
      sendError(res, 403, "Forbidden: Insufficient permissions");
      return;
    }

    next();
  };
};
