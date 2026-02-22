import { Router } from "express";
import {
  createInvoice,
  deleteInvoice,
  downloadInvoicePdf,
  generateInvoicePdf,
  getInvoiceById,
  getInvoices,
  getInvoiceStats,
  markInvoiceAsPaid,
  sendInvoiceEmail,
  updateInvoice,
} from "../controllers/invoiceController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

// Routes
router.get("/", protect, getInvoices);
router.post("/", protect, createInvoice);
router.get("/stats", protect, getInvoiceStats);
router.get("/:id", protect, getInvoiceById);
router.patch("/:id", protect, updateInvoice);
router.delete("/:id", protect, deleteInvoice);

// Actions
router.post("/:id/pdf", protect, generateInvoicePdf);
router.get("/:id/download", protect, downloadInvoicePdf);
router.post("/:id/send", protect, sendInvoiceEmail);
router.post("/:id/mark-paid", protect, markInvoiceAsPaid);

export default router;
