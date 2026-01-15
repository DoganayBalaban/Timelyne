import { NextFunction, Response } from "express";
import { AppError } from "../utils/appError";
import { AuthRequest } from "./authMiddleware";

export const isVerified = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.email_verified) {
    return next(new AppError("Lütfen devam etmek için e-posta adresinizi doğrulayın.", 403));
  }
  next();
};
