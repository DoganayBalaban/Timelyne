import express, { Router } from "express";
import { handleInvoicePaymentWebhook } from "../controllers/webhookController";

const router = Router();

/**
 * IMPORTANT: These routes use express.raw() to preserve the raw request body
 * required for Stripe webhook signature verification.
 * They MUST be mounted in index.ts BEFORE express.json().
 */
router.post(
  "/stripe/invoices",
  express.raw({ type: "application/json" }),
  handleInvoicePaymentWebhook,
);

export default router;
