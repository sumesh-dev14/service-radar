import { Request, Response } from "express";
import { Category } from "../models/Category";
import { sendSuccess, sendError } from "../utils/responseHandler";

export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name || !description) {
      sendError(res, 400, "Name and description are required");
      return;
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      sendError(res, 409, "Category already exists");
      return;
    }

    // Create category
    const category = await Category.create({
      name,
      description,
    });

    sendSuccess(res, 201, "Category created successfully", category);
  } catch (error) {
    console.error("Create category error:", error);
    sendError(res, 500, "Failed to create category");
  }
};

export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    sendSuccess(res, 200, "Categories fetched successfully", {
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    sendError(res, 500, "Failed to fetch categories");
  }
};