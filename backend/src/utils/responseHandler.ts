import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
}

/**
 * Send a standardized success response
 */
export const sendSuccess = <T = any>(
  res: Response,
  statusCode: number,
  message: string,
  data: T = null as any
): void => {
  res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data: data || null,
  } as ApiResponse<T>);
};

/**
 * Send a standardized error response
 */
export const sendError = (
  res: Response,
  statusCode: number,
  message: string
): void => {
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    data: null,
  } as ApiResponse);
};
