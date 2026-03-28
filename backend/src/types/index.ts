import { Request } from "express";


export interface AuthRequest extends Request {
  user?: any;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: "customer" | "provider";
}

// Re-export frontend-ready models from models.ts
export * from "./models";
