import express from "express";
import {
  getDashboardStats,
  getOverdueInvoices,
  getRecentActivity,
  getRevenueChartData,
} from "../controllers/dashboardController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

import { redisRateLimit } from "../middlewares/redisRateLimit";

router.get(
  "/stats",
  protect,
  redisRateLimit({ windowMs: 60 * 1000, maxRequests: 30 }),
  getDashboardStats,
);
router.get(
  "/revenue",
  protect,
  redisRateLimit({ windowMs: 60 * 1000, maxRequests: 30 }),
  getRevenueChartData,
);
router.get(
  "/recent-activity",
  protect,
  redisRateLimit({ windowMs: 60 * 1000, maxRequests: 30 }),
  getRecentActivity,
);
router.get("/overdue-invoices", protect, getOverdueInvoices);

export default router;
