import logger from "../utils/logger";
import { prisma } from "../utils/prisma";
export const connectDatabase = async () => {
  try {
    logger.info("🔍 Prisma database bağlantısı kontrol ediliyor...");
    await prisma.$connect();
    logger.info("✅ Prisma database bağlantısı başarılı!");

    // Basit bir health check query
    const userCount = await prisma.user.count();
    logger.info(
      `📊 Database hazır - Users tablosunda ${userCount} kayıt bulundu`
    );
  } catch (error: any) {
    logger.error("❌ Prisma database bağlantı hatası:", error.message);
    if (error.code === "P1001") {
      logger.error(
        "💡 Database'e bağlanılamıyor. DATABASE_URL'i kontrol edin."
      );
    } else if (error.code === "P1003") {
      logger.error(
        "💡 Database bulunamadı. Database'in oluşturulduğundan emin olun."
      );
    } else if (error.code === "42P01") {
      logger.error(
        "💡 Tablo bulunamadı. Migration çalıştırmanız gerekebilir: npx prisma migrate dev"
      );
    }
    process.exit(1);
  }
};
