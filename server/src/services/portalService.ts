import crypto from "crypto";
import { env } from "../config/env";
import { AppError } from "../utils/appError";
import { sendEmail } from "../utils/email";
import { buildMagicLinkEmailTemplate } from "../utils/emailTemplates";
import { prisma } from "../utils/prisma";

export class PortalService {
  // Enable portal for a client
  static async enablePortal(userId: string, clientId: string) {
    const client = await prisma.client.findFirst({
      where: { id: clientId, user_id: userId, deleted_at: null },
    });
    if (!client) throw new AppError("Client not found", 404);

    return prisma.client.update({
      where: { id: clientId },
      data: {
        portal_enabled: true,
        portal_token: client.portal_token ?? crypto.randomUUID(),
      },
    });
  }

  // Disable portal for a client
  static async disablePortal(userId: string, clientId: string) {
    const client = await prisma.client.findFirst({
      where: { id: clientId, user_id: userId, deleted_at: null },
    });
    if (!client) throw new AppError("Client not found", 404);

    // Revoke all sessions
    await prisma.portalSession.deleteMany({ where: { client_id: clientId } });

    return prisma.client.update({
      where: { id: clientId },
      data: { portal_enabled: false },
    });
  }

  // Send magic link email to client
  static async sendMagicLink(userId: string, clientId: string) {
    const client = await prisma.client.findFirst({
      where: { id: clientId, user_id: userId, deleted_at: null, portal_enabled: true },
      include: { user: { select: { first_name: true, last_name: true, email: true } } },
    });
    if (!client) throw new AppError("Client not found or portal not enabled", 404);
    if (!client.email) throw new AppError("Client has no email address", 400);

    // Create new 15-minute session
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.portalSession.create({
      data: { client_id: clientId, token, expires_at: expiresAt },
    });

    const freelancerName =
      [client.user.first_name, client.user.last_name].filter(Boolean).join(" ") ||
      "Your freelancer";
    const magicLink = `${env.FRONTEND_URL}/portal/verify?token=${token}`;

    const html = buildMagicLinkEmailTemplate({
      clientName: client.name,
      magicLink,
      freelancerName,
    });

    await sendEmail({
      to: client.email,
      subject: `${freelancerName} has shared your invoices with you`,
      html,
    });

    return { sent: true };
  }

  // Verify magic link token → return new long-lived session token
  static async verifyMagicLink(token: string): Promise<{ sessionToken: string; clientId: string }> {
    const session = await prisma.portalSession.findUnique({ where: { token } });

    if (!session) throw new AppError("Invalid or expired link", 401);
    if (session.expires_at < new Date()) {
      await prisma.portalSession.delete({ where: { id: session.id } });
      throw new AppError("Link has expired. Please request a new one.", 401);
    }

    // Delete the magic link session (one-time use)
    await prisma.portalSession.delete({ where: { id: session.id } });

    // Create a 7-day session
    const sessionToken = crypto.randomUUID();
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.portalSession.create({
      data: { client_id: session.client_id, token: sessionToken, expires_at: sessionExpiry },
    });

    return { sessionToken, clientId: session.client_id };
  }

  // Validate session cookie → return client
  static async validateSession(sessionToken: string) {
    const session = await prisma.portalSession.findUnique({
      where: { token: sessionToken },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            portal_enabled: true,
          },
        },
      },
    });

    if (!session || session.expires_at < new Date()) {
      if (session) await prisma.portalSession.delete({ where: { id: session.id } });
      throw new AppError("Session expired. Please request a new magic link.", 401);
    }

    if (!session.client.portal_enabled) {
      throw new AppError("Portal access has been revoked.", 403);
    }

    return session.client;
  }

  // Get client invoices for portal
  static async getPortalInvoices(clientId: string) {
    return prisma.invoice.findMany({
      where: {
        client_id: clientId,
        deleted_at: null,
        status: { in: ["sent", "paid", "overdue"] }, // don't show drafts
      },
      select: {
        id: true,
        invoice_number: true,
        issue_date: true,
        due_date: true,
        subtotal: true,
        tax: true,
        discount: true,
        total: true,
        currency: true,
        status: true,
        pdf_url: true,
        paid_at: true,
      },
      orderBy: { issue_date: "desc" },
    });
  }

  // Get single invoice for portal
  static async getPortalInvoice(clientId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, client_id: clientId, deleted_at: null },
      include: {
        invoice_items: true,
        payments: { orderBy: { paid_at: "desc" } },
      },
    });
    if (!invoice) throw new AppError("Invoice not found", 404);
    return invoice;
  }

  // Logout - delete session
  static async logout(sessionToken: string) {
    await prisma.portalSession.deleteMany({ where: { token: sessionToken } });
  }
}
