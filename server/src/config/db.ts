import { prisma } from "../utils/prisma";

export const connectDatabase = async () => {
  try {
    console.log("🔍 Prisma database bağlantısı kontrol ediliyor...");
    await prisma.$connect();
    console.log("✅ Prisma database bağlantısı başarılı!");

    // Basit bir health check query
    const userCount = await prisma.user.count();
    console.log(
      `📊 Database hazır - Users tablosunda ${userCount} kayıt bulundu`
    );
  } catch (error: any) {
    console.error("❌ Prisma database bağlantı hatası:", error.message);
    if (error.code === "P1001") {
      console.error(
        "💡 Database'e bağlanılamıyor. DATABASE_URL'i kontrol edin."
      );
    } else if (error.code === "P1003") {
      console.error(
        "💡 Database bulunamadı. Database'in oluşturulduğundan emin olun."
      );
    } else if (error.code === "42P01") {
      console.error(
        "💡 Tablo bulunamadı. Migration çalıştırmanız gerekebilir: npx prisma migrate dev"
      );
    }
    process.exit(1);
  }
};
