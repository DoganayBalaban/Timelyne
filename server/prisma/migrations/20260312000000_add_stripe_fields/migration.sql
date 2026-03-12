-- AlterTable: Add Stripe subscription fields to users
ALTER TABLE "users"
  ADD COLUMN "stripe_customer_id" VARCHAR(100),
  ADD COLUMN "stripe_subscription_id" VARCHAR(100),
  ADD COLUMN "stripe_subscription_status" VARCHAR(30);

-- CreateIndex: Unique constraints for Stripe IDs
CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");
CREATE UNIQUE INDEX "users_stripe_subscription_id_key" ON "users"("stripe_subscription_id");

-- AlterTable: Add Stripe payment link fields to invoices
ALTER TABLE "invoices"
  ADD COLUMN "stripe_payment_link_id" VARCHAR(100),
  ADD COLUMN "stripe_payment_link_url" TEXT,
  ADD COLUMN "stripe_payment_intent_id" VARCHAR(100);

-- AlterTable: Add Stripe payment intent ID to payments
ALTER TABLE "payments"
  ADD COLUMN "stripe_payment_intent_id" VARCHAR(100);
