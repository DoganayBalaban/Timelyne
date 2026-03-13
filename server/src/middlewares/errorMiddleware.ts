import { NextFunction, Request, Response } from "express";
import { ZodError, ZodIssue } from "zod";
import { Sentry } from "../config/sentry";
import { env } from "../config/env";
import logger from "../utils/logger";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors: Record<string, string> | null = null;

  // 1. Zod Hatalarını Yakala ve Biçimlendir
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Doğrulama hatası";
    // Zod hatalarını düzleştiriyoruz: { email: "Geçersiz email", password: "Çok kısa" }
    errors = err.issues.reduce((acc: Record<string, string>, curr: ZodIssue) => {
      const path = curr.path.join(".");
      acc[path] = curr.message;
      return acc;
    }, {});
    
    logger.warn(`Validation Error: ${JSON.stringify(errors)}`);
  }

  // 2. Loglama
  let sentryEventId: string | undefined;
  if (statusCode >= 500) {
    logger.error("💥 Server Error:", err);
    sentryEventId = Sentry.captureException(err);
  }

  // 3. Standart Response Formatı
  res.status(statusCode).json({
    status: "error",
    message,
    ...(errors && { errors }), // Sadece validation hatası varsa bu alanı ekle
    ...(sentryEventId && { sentry_event_id: sentryEventId }),
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};