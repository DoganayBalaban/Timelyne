import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import logger from "../utils/logger";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;

  // 1. Loglama (Winston kullanıyoruz)
  if (err.statusCode >= 500) {
    logger.error("💥 Beklenmedik Hata:", err);
  } else {
    logger.warn(`⚠️ Operasyonel Hata: ${err.message} [${err.statusCode}]`);
  }

  // 2. Response Formatı
  const response = {
    status: "error",
    message: err.message || "Internal Server Error",
    ...(env.NODE_ENV === "development" && { stack: err.stack }), // Geliştirmede stack trace ekle
  };

  res.status(err.statusCode).json(response);
};