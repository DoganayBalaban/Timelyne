import api from "./client";

// ─── Response Types ─────────────────────────────────────────────────────────

export interface DashboardStats {
  monthlyRevenue: number;
  totalHours: number;
  billableHours: number;
  activeProjects: number;
  pendingAmount: number;
  overdueInvoices: number;
  growthPercentage: number;
}

export interface RevenueChartItem {
  month: string; // "YYYY-MM"
  revenue: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  dueDate: string;
  daysOverdue: number;
  riskLevel: "critical" | "high" | "medium";
  amount: number;
}

export interface OverdueInvoicesResponse {
  totalOverdue: number;
  totalAmount: number;
  page: number;
  limit: number;
  data: OverdueInvoice[];
}

// ─── API Functions ──────────────────────────────────────────────────────────

export const dashboardApi = {
  getStats: (): Promise<{ message: string; data: DashboardStats }> =>
    api.get("/dashboard/stats").then((r) => r.data),

  getRevenue: (): Promise<{ message: string; data: RevenueChartItem[] }> =>
    api.get("/dashboard/revenue").then((r) => r.data),

  getRecentActivity: (
    limit = 10,
  ): Promise<{ message: string; data: ActivityItem[] }> =>
    api
      .get("/dashboard/recent-activity", { params: { limit } })
      .then((r) => r.data),

  getOverdueInvoices: (
    page = 1,
    limit = 10,
  ): Promise<{ message: string; data: OverdueInvoicesResponse }> =>
    api
      .get("/dashboard/overdue-invoices", { params: { page, limit } })
      .then((r) => r.data),
};

export default dashboardApi;
