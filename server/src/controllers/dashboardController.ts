import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { DashboardService } from "../services/dashboardService";
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
import {
  getDashboardStatsSchema,
  getOverdueInvoicesSchema,
  getRecentActivitySchema,
  getRevenueChartDataSchema,
} from "../validators/dashboardSchema";

export const getDashboardStats = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) throw new AppError("Unauthorized", 401);

    const validatedQuery = getDashboardStatsSchema.safeParse(req.query);
    if (!validatedQuery.success) {
      throw new AppError(validatedQuery.error.issues[0].message, 400);
    }

    const data = await DashboardService.getDashboardStats(
      req.user.id,
      validatedQuery.data,
    );
    res.json({ message: "Dashboard stats fetched successfully", data });
  },
);

export const getRevenueChartData = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) throw new AppError("Unauthorized", 401);

    const validatedQuery = getRevenueChartDataSchema.safeParse(req.query);
    if (!validatedQuery.success) {
      throw new AppError(validatedQuery.error.issues[0].message, 400);
    }

    const data = await DashboardService.getRevenueChartData(
      req.user.id,
      validatedQuery.data,
    );
    res.json({ message: "Revenue chart data fetched successfully", data });
  },
);

export const getRecentActivity = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) throw new AppError("Unauthorized", 401);

    const validatedQuery = getRecentActivitySchema.safeParse(req.query);
    if (!validatedQuery.success) {
      throw new AppError(validatedQuery.error.issues[0].message, 400);
    }

    const data = await DashboardService.getRecentActivity(
      req.user.id,
      validatedQuery.data,
    );
    res.json({ message: "Recent activity fetched successfully", data });
  },
);

export const getOverdueInvoices = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) throw new AppError("Unauthorized", 401);

    const validatedQuery = getOverdueInvoicesSchema.safeParse(req.query);
    if (!validatedQuery.success) {
      throw new AppError(validatedQuery.error.issues[0].message, 400);
    }

    const data = await DashboardService.getOverdueInvoices(
      req.user.id,
      validatedQuery.data,
    );
    res.json({ message: "Overdue invoices fetched successfully", data });
  },
);
