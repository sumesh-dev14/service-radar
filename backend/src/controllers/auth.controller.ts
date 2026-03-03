import { Response } from "express";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import { AuthRequest, JWTPayload } from "../types";
import { sendSuccess, sendError } from "../utils/responseHandler";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("CRITICAL: JWT_SECRET environment variable is not defined. Please set it in .env file.");
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const generateToken = (user: IUser): string => {
  const payload: JWTPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return (jwt.sign as any)(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const register = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      sendError(res, 400, "Missing required fields");
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendError(res, 409, "User already exists");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Generate token
    const token = generateToken(user);

    // Set HttpOnly cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendSuccess(res, 201, "User registered successfully", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    sendError(res, 500, "Registration failed");
  }
};

export const login = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      sendError(res, 400, "Email and password are required");
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      sendError(res, 401, "Invalid credentials");
      return;
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      sendError(res, 401, "Invalid credentials");
      return;
    }

    // Generate token
    const token = generateToken(user);

    // Set HttpOnly cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendSuccess(res, 200, "Login successful", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    sendError(res, 500, "Login failed");
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Clear HttpOnly cookie
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    sendSuccess(res, 200, "Logged out successfully", null);
  } catch (error) {
    console.error("Logout error:", error);
    sendError(res, 500, "Logout failed");
  }
};

export const me = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    sendSuccess(res, 200, "User fetched successfully", {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    sendError(res, 500, "Failed to fetch user");
  }
};
