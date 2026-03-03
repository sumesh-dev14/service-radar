import { Request } from "express";
import { IUser } from "../models/User";

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: "customer" | "provider";
}

// Re-export frontend-ready models from models.ts
export * from "./models";
