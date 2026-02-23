import { z } from "zod";

export const getDashboardStatsSchema = z.object({
  // Tüm istatistikleri belirli bir tarih aralığında getirmek istenirse
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const getRevenueChartDataSchema = z.object({
  // period: week, month, year
  period: z.enum(["week", "month", "year"]).default("month"),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export const getRecentActivitySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const getOverdueInvoicesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// Type Exports
export type GetDashboardStatsInput = z.infer<typeof getDashboardStatsSchema>;
export type GetRevenueChartDataInput = z.infer<
  typeof getRevenueChartDataSchema
>;
export type GetRecentActivityInput = z.infer<typeof getRecentActivitySchema>;
export type GetOverdueInvoicesInput = z.infer<typeof getOverdueInvoicesSchema>;
