import express from "express";
import {
  getDashboardStats,
  getOverdueInvoices,
  getRecentActivity,
  getRevenueChartData,
} from "../controllers/dashboardController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// Not: İleri aşamada Redis önbellekleme middleware'i buraya eklenebilir.
// Örnek kullanım: router.get("/stats", protect, cacheMiddleware, getDashboardStats);

router.get("/stats", protect, getDashboardStats);
router.get("/revenue", protect, getRevenueChartData);
router.get("/recent-activity", protect, getRecentActivity);
router.get("/overdue-invoices", protect, getOverdueInvoices);

export default router;
