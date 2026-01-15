import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import logger from "../utils/logger"; // Winston logger'ı ekledik
import { prisma } from "../utils/prisma";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email_verified: boolean;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // 1. Token'ı Cookie veya Header'dan al
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Oturum açmanız gerekiyor." });
    }

    // 2. Token Doğrulama
    // Not: Access token ve Refresh token için farklı secretlar kullanman güvenliği artırır
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      userId: string;
    };

    // 3. Veritabanı Kontrolü (User aktif mi?)
    // İpucu: Bu sorguyu çok sık yapıyorsan Redis ile cache'leyebilirsin.
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        deleted_at: null,
      },
      select: { id: true, email_verified: true },
    });

    if (!user) {
      logger.warn(`Geçersiz token denemesi: Kullanıcı bulunamadı. ID: ${decoded.userId}`);
      return res.status(401).json({ message: "Kullanıcı artık aktif değil." });
    }

    // 4. User bilgisini request'e ekle
    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token süresi doldu.", code: "TOKEN_EXPIRED" });
    }
    
    logger.error("Protect Middleware Hatası:", error);
    return res.status(401).json({ message: "Yetkisiz erişim." });
  }
};