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
    const cacheKey = `dashboard:revenue:${userId}`;

    // 1️⃣ Cache check (AP approach)
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const startDate = dayjs().subtract(11, "month").startOf("month").toDate();

    // 2️⃣ Son 12 ayın paid invoice toplamı (Daha performanslı tek SQL query)
    const revenueRaw = await prisma.$queryRaw<
      { month: Date; revenue: number }[]
    >`
      SELECT 
        DATE_TRUNC('month', issue_date) as month,
        SUM(total) as revenue
      FROM invoices
      WHERE user_id = ${userId}
      AND status = 'paid'
      AND deleted_at IS NULL
      AND issue_date >= ${startDate}::date
      GROUP BY DATE_TRUNC('month', issue_date)
      ORDER BY month ASC
    `;

    const monthlyMap = new Map<string, number>();

    for (const row of revenueRaw) {
      const monthKey = dayjs(row.month).format("YYYY-MM");
      monthlyMap.set(monthKey, Number(row.revenue || 0));
    }

    // 3️⃣ Eksik ayları 0 ile doldur
    const result = [];

    for (let i = 0; i < 12; i++) {
      const currentMonth = dayjs()
        .subtract(11 - i, "month")
        .startOf("month");
      const key = currentMonth.format("YYYY-MM");

      result.push({
        month: key,
        revenue: monthlyMap.get(key) || 0,
      });
    }

    // 4️⃣ Cache set (1 saat)
    await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

    return result;
  }

  /**
   * Son yapılan işlemleri listeler.
   */
  static async getRecentActivity(
    userId: string,
    query: GetRecentActivityInput,
  ): Promise<any[]> {
    const cacheKey = `dashboard:recent-activity:${userId}`;

    // 1️⃣ Cache check (5 min) - AP Approach
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2️⃣ Get the last 20 audit logs
    const limit = query.limit || 20;

    const logs = await prisma.auditLog.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: "desc",
      },
      take: limit,
    });

    // 3️⃣ Normalize for the frontend
    const formatted = logs.map((log) => ({
      id: log.id,
      type: `${log.entity_type}_${log.action}`,
      entityId: log.entity_id,
      metadata: log.new_values,
      createdAt: log.created_at,
    }));

    // 4️⃣ Cache set (300 seconds = 5 minutes)
    await redis.set(cacheKey, JSON.stringify(formatted), "EX", 300);

    return formatted;
  }

  /**
   * Vadesi geçmiş faturaları uyarı olarak döndürür.
   */
  static async getOverdueInvoices(
    userId: string,
    query: GetOverdueInvoicesInput,
  ): Promise<any> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const cacheKey = `dashboard:overdue:${userId}:p${page}:l${limit}`;

    // 1️⃣ Cache check (5 min) - AP Approach
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const now = new Date();
    const skip = (page - 1) * limit;

    // 2️⃣ Fetch invoices and total count
    const [invoices, totalCount] = await prisma.$transaction([
      prisma.invoice.findMany({
        where: {
          user_id: userId,
          deleted_at: null,
          status: {
            not: "paid",
          },
          due_date: {
            lt: now,
          },
        },
        include: {
          client: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          due_date: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.invoice.count({
        where: {
          user_id: userId,
          deleted_at: null,
          status: {
            not: "paid",
          },
          due_date: {
            lt: now,
          },
        },
      }),
    ]);

    // 3️⃣ Total risk amount calculation
    const totalAmountRaw = await prisma.invoice.aggregate({
      where: {
        user_id: userId,
        deleted_at: null,
        status: {
          not: "paid",
        },
        due_date: {
          lt: now,
        },
      },
      _sum: {
        total: true,
      },
    });

    const totalAmount = Number(totalAmountRaw._sum.total || 0);

    // 4️⃣ Formatting and Risk Logic
    const formatted = invoices.map((inv) => {
      const daysOverdue = dayjs().diff(dayjs(inv.due_date), "day");
      let riskLevel = "medium";
      if (daysOverdue > 30) riskLevel = "critical";
      else if (daysOverdue > 14) riskLevel = "high";

      return {
        id: inv.id,
        invoiceNumber: inv.invoice_number,
        clientName: inv.client?.name || "Unknown",
        dueDate: inv.due_date,
        daysOverdue,
        riskLevel,
        amount: Number(inv.total),
      };
    });

    const response = {
      totalOverdue: totalCount,
      totalAmount,
      page,
      limit,
      data: formatted,
    };

    // 5️⃣ Cache set (300 seconds = 5 minutes)
    await redis.set(cacheKey, JSON.stringify(response), "EX", 300);

    return response;
  }
}
