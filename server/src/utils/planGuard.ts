import { getPlanLimits, isUnlimited } from "../config/planLimits";
import { AppError } from "./appError";
import { prisma } from "./prisma";

async function getUserPlan(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  return user?.plan ?? "free";
}

/**
 * Throws 403 if the user has reached their client limit.
 */
export async function assertCanCreateClient(userId: string): Promise<void> {
  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan);
  if (isUnlimited(limits.clients)) return;

  const count = await prisma.client.count({
    where: { user_id: userId, deleted_at: null },
  });

  if (count >= limits.clients) {
    throw new AppError(
      `Your ${plan} plan allows up to ${limits.clients} clients. Upgrade to add more.`,
      403,
    );
  }
}

/**
 * Throws 403 if the user has reached their active project limit.
 */
export async function assertCanCreateProject(userId: string): Promise<void> {
  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan);
  if (isUnlimited(limits.activeProjects)) return;

  const count = await prisma.project.count({
    where: { user_id: userId, deleted_at: null, status: "active" },
  });

  if (count >= limits.activeProjects) {
    throw new AppError(
      `Your ${plan} plan allows up to ${limits.activeProjects} active projects. Upgrade to add more.`,
      403,
    );
  }
}

/**
 * Throws 403 if the user has reached their invoice limit.
 * Free plan: total cap. Starter plan: monthly cap.
 */
export async function assertCanCreateInvoice(userId: string): Promise<void> {
  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan);

  // Pro/Agency: unlimited
  if (isUnlimited(limits.invoicesPerMonth) && isUnlimited(limits.invoicesTotalCap)) return;

  if (plan === "free") {
    // Total cap
    const count = await prisma.invoice.count({
      where: { user_id: userId, deleted_at: null },
    });
    if (!isUnlimited(limits.invoicesTotalCap) && count >= limits.invoicesTotalCap) {
      throw new AppError(
        `Free plan allows up to ${limits.invoicesTotalCap} invoices total. Upgrade to create more.`,
        403,
      );
    }
    return;
  }

  if (plan === "starter") {
    // Monthly cap
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const count = await prisma.invoice.count({
      where: {
        user_id: userId,
        deleted_at: null,
        created_at: { gte: firstOfMonth },
      },
    });
    if (!isUnlimited(limits.invoicesPerMonth) && count >= limits.invoicesPerMonth) {
      throw new AppError(
        `Starter plan allows up to ${limits.invoicesPerMonth} invoices per month. Upgrade for unlimited.`,
        403,
      );
    }
  }
}

/**
 * Throws 403 if the user's plan does not include expense tracking.
 */
export async function assertCanUseExpenseTracking(userId: string): Promise<void> {
  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan);
  if (!limits.expenseTracking) {
    throw new AppError(
      `Expense tracking is not available on the ${plan} plan. Upgrade to Pro or Agency.`,
      403,
    );
  }
}

/**
 * Throws 403 if the user's plan does not include the client portal.
 */
export async function assertCanUseClientPortal(userId: string): Promise<void> {
  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan);
  if (!limits.clientPortal) {
    throw new AppError(
      `Client portal is not available on the ${plan} plan. Upgrade to Starter or higher.`,
      403,
    );
  }
}
