import { Request, Response } from "express";
import Stripe from "stripe";
import { env } from "../config/env";
import { stripe } from "../config/stripe";
import { InvoiceService } from "../services/invoiceService";
import { catchAsync } from "../utils/catchAsync";
import logger from "../utils/logger";

export const handleInvoicePaymentWebhook = catchAsync(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        env.STRIPE_INVOICE_WEBHOOK_SECRET,
      );
    } catch (err) {
      logger.error("[webhook] Invoice signature verification failed", err);
      return res.status(400).json({ error: "Webhook signature verification failed" });
    }

    logger.info(`[webhook] Invoice event received: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.invoiceId) {
        await InvoiceService.handleStripeInvoicePaid(session);
        logger.info(
          `[webhook] Invoice ${session.metadata.invoiceId} marked as paid`,
        );
      }
    }

    return res.json({ received: true });
  },
);
