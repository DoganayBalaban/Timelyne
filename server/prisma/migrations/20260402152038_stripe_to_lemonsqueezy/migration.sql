/*
  Warnings:

  - You are about to drop the column `stripe_payment_intent_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_payment_link_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_payment_link_url` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_payment_intent_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_customer_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_subscription_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_subscription_status` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lemon_customer_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lemon_subscription_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_stripe_customer_id_key";

-- DropIndex
DROP INDEX "users_stripe_subscription_id_key";

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "stripe_payment_intent_id",
DROP COLUMN "stripe_payment_link_id",
DROP COLUMN "stripe_payment_link_url",
ADD COLUMN     "lemon_checkout_id" VARCHAR(200),
ADD COLUMN     "lemon_checkout_url" TEXT,
ADD COLUMN     "lemon_order_id" VARCHAR(100);

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "stripe_payment_intent_id",
ADD COLUMN     "lemon_order_id" VARCHAR(100);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "stripe_customer_id",
DROP COLUMN "stripe_subscription_id",
DROP COLUMN "stripe_subscription_status",
ADD COLUMN     "lemon_customer_id" VARCHAR(100),
ADD COLUMN     "lemon_subscription_id" VARCHAR(100),
ADD COLUMN     "lemon_subscription_status" VARCHAR(30);

-- CreateIndex
CREATE UNIQUE INDEX "users_lemon_customer_id_key" ON "users"("lemon_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_lemon_subscription_id_key" ON "users"("lemon_subscription_id");
