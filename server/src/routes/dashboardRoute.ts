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

/**
 * @openapi
 * /api/dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard summary statistics
 *     responses:
 *       200:
 *         description: Stats including revenue, active projects, unbilled hours, and outstanding invoices
 */
router.get(
  "/stats",
  protect,
  redisRateLimit({ windowMs: 60 * 1000, maxRequests: 30 }),
  getDashboardStats,
);

/**
 * @openapi
 * /api/dashboard/revenue:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get revenue chart data
 *     parameters:
 *       - in: query
 *         name: period
 *         schema: { type: string, enum: [7d, 30d, 90d, 12m], default: 30d }
 *     responses:
 *       200:
 *         description: Revenue data points for charting
 */
router.get(
  "/revenue",
  protect,
  redisRateLimit({ windowMs: 60 * 1000, maxRequests: 30 }),
  getRevenueChartData,
);

/**
 * @openapi
 * /api/dashboard/recent-activity:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get recent activity feed
 *     responses:
 *       200:
 *         description: Recent activity events
 */
router.get(
  "/recent-activity",
  protect,
  redisRateLimit({ windowMs: 60 * 1000, maxRequests: 30 }),
  getRecentActivity,
);

/**
 * @openapi
 * /api/dashboard/overdue-invoices:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get overdue invoices
 *     responses:
 *       200:
 *         description: List of overdue invoices
 */
router.get(
  "/overdue-invoices",
  protect,
  redisRateLimit({ windowMs: 60 * 1000, maxRequests: 30 }),
  getOverdueInvoices,
);

export default router;
