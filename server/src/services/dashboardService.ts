import dayjs from "dayjs";
import { redis } from "../config/redis";
import { prisma } from "../utils/prisma";
import {
  GetDashboardStatsInput,
  GetOverdueInvoicesInput,
  GetRecentActivityInput,
  GetRevenueChartDataInput,
} from "../validators/dashboardSchema";

export class DashboardService {
  static async getDashboardStats(
    userId: string,
    query: GetDashboardStatsInput,
  ): Promise<any> {
    const cacheKey = `dashboard:stats:${userId}`;

    // 1️⃣ Cache check (AP approach)
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const now = dayjs();
    const startOfMonth = now.startOf("month").toDate();
    const endOfMonth = now.endOf("month").toDate();
    const startOfPrevMonth = now.subtract(1, "month").startOf("month").toDate();
    const endOfPrevMonth = now.subtract(1, "month").endOf("month").toDate();

    // 2️⃣ Monthly stats fallback
    // The "monthlyStats" materialized view is not present in the Prisma Schema
    // To prevent the "Property 'monthlyStats' does not exist" TS error, we dynamically aggregate standard entities,
    // or you can enable raw query here if the view exists in pure PostgreSQL:
    // const rawStats = await prisma.$queryRaw<any[]>`SELECT * FROM monthly_stats WHERE user_id = ${userId}::uuid AND month = ${startOfMonth}::date`;
    // const mStats = rawStats[0];

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        user_id: userId,
        started_at: { gte: startOfMonth, lte: endOfMonth },
        deleted_at: null,
      },
    });

    const totalMinutes = timeEntries.reduce(
      (sum, t) => sum + (t.duration_minutes || 0),
      0,
    );
    const billableMinutes = timeEntries
      .filter((t) => t.billable)
      .reduce((sum, t) => sum + (t.duration_minutes || 0), 0);

    const activeProjectsCount = await prisma.project.count({
      where: {
        user_id: userId,
        status: "active",
        deleted_at: null,
      },
    });

    // 3️⃣ This month's paid revenue
    const currentMonthRevenue = await prisma.invoice.aggregate({
      where: {
        user_id: userId,
        status: "paid",
        deleted_at: null,
        issue_date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        total: true,
      },
    });

    // 4️⃣ Previous month's revenue (for growth)
    const previousMonthRevenue = await prisma.invoice.aggregate({
      where: {
        user_id: userId,
        status: "paid",
        deleted_at: null,
        issue_date: {
          gte: startOfPrevMonth,
          lte: endOfPrevMonth,
        },
      },
      _sum: {
        total: true,
      },
    });

    const currentRevenue = Number(currentMonthRevenue._sum.total || 0);
    const previousRevenue = Number(previousMonthRevenue._sum.total || 0);

    const growthPercentage =
      previousRevenue === 0
        ? 100
        : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    // 5️⃣ Pending amount (sent + overdue)
    const pending = await prisma.invoice.aggregate({
      where: {
        user_id: userId,
        status: { in: ["sent", "overdue"] },
        deleted_at: null,
      },
      _sum: {
        total: true,
      },
    });

    // 6️⃣ Overdue invoices count
    const overdueCount = await prisma.invoice.count({
      where: {
        user_id: userId,
        status: "overdue",
        deleted_at: null,
      },
    });

    const result = {
      monthlyRevenue: currentRevenue,
      totalHours: totalMinutes / 60,
      billableHours: billableMinutes / 60,
      activeProjects: activeProjectsCount,
      pendingAmount: Number(pending._sum.total || 0),
      overdueInvoices: overdueCount,
      growthPercentage: Number(growthPercentage.toFixed(2)),
    };

    // 7️⃣ Cache set (1 hour)
    await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

    return result;
  }

  /**
   * Gelir grafiği için veriyi sağlar.
   */
  static async getRevenueChartData(
    userId: string,
    query: GetRevenueChartDataInput,
  ): Promise<any> {
    // TODO: implement
    return [];
  }

  /**
   * Son yapılan işlemleri listeler.
   */
  static async getRecentActivity(
    userId: string,
    query: GetRecentActivityInput,
  ): Promise<any[]> {
    // TODO: implement
    return [];
  }

  /**
   * Vadesi geçmiş faturaları uyarı olarak döndürür.
   */
  static async getOverdueInvoices(
    userId: string,
    query: GetOverdueInvoicesInput,
  ): Promise<any[]> {
    // TODO: implement
    return [];
  }
}
