import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { redis } from "../config/redis";
import logger from "../utils/logger";
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

    // 1. Token Alımı
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Oturum açmanız gerekiyor." });
    }

    // 2. JWT Doğrulama (Hızlı, RAM üzerinde yapılır)
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string };

    // --- REDIS CACHE KATMANI BAŞLANGICI ---
    const cacheKey = `user:session:${decoded.userId}`;
    
    // Redis'ten kullanıcıyı çekmeyi dene
    const cachedUser = await redis.get(cacheKey);

    if (cachedUser) {
      req.user = JSON.parse(cachedUser);
      return next(); // Veritabanına hiç gitmeden devam et! 🚀
    }
    // --- REDIS CACHE KATMANI SONU ---

    // 3. Veritabanı Kontrolü (Sadece cache'de yoksa çalışır)
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

    // 4. Redis'e Kaydet (Bir sonraki istekte DB'ye gitmesin)
    // TTL süresini JWT sürenle paralel tutabilirsin (Örn: 15 dakika)
    await redis.set(cacheKey, JSON.stringify(user), "EX", 900); 

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