import { AppError } from "../utils/appError";
import { prisma } from "../utils/prisma";
import {
  CreateInvoiceInput,
  MarkInvoiceAsPaidInput,
  UpdateInvoiceInput,
} from "../validators/invoiceSchema";

export class InvoiceService {
  static async createInvoice(userId: string, data: CreateInvoiceInput) {
    return await prisma.$transaction(
      async (tx) => {
        if (data.dueDate < data.issueDate) {
          throw new AppError("Due date cannot be before issue date", 400);
        }
        const invoiceCount = await tx.invoice.count({
          where: { user_id: userId },
        });
        const invoiceNumber = `INV-${invoiceCount + 1}`;
        let subtotal = 0;
        const invoiceItems: any[] = [];
        if (data.timeEntryIds?.length) {
          const timeEntries = await tx.timeEntry.findMany({
            where: {
              id: { in: data.timeEntryIds },
              user_id: userId,
              deleted_at: null,
              invoiced: false,
              billable: true,
              ended_at: { not: null },
            },
          });
          if (timeEntries.length !== data.timeEntryIds.length) {
            throw new AppError("Invalid or already invoiced time entries", 400);
          }
          for (const entry of timeEntries) {
            const hours = entry.duration_minutes! / 60;
            const rate = Number(entry.hourly_rate ?? 0);
            const amount = hours * rate;
            subtotal += amount;
            invoiceItems.push({
              description: entry.description ?? "Time entry",
              quantity: hours,
              rate,
              amount,
            });
          }
        }
        const taxAmount = (subtotal * (data.tax ?? 0)) / 100;
        const discountAmount = (subtotal * (data.discount ?? 0)) / 100;

        const total = subtotal + taxAmount - discountAmount;
        if (total <= 0) {
          throw new AppError("Invoice total must be greater than zero", 400);
        }
        const invoice = await tx.invoice.create({
          data: {
            user_id: userId,
            client_id: data.clientId,
            invoice_number: invoiceNumber,
            issue_date: data.issueDate,
            due_date: data.dueDate,
            subtotal,
            tax: taxAmount,
            discount: discountAmount,
            total,
            currency: data.currency ?? "USD",
            notes: data.notes,
            terms: data.terms,
            invoice_items: {
              create: invoiceItems,
            },
          },
          include: {
            invoice_items: true,
          },
        });
        if (data.timeEntryIds?.length) {
          await tx.timeEntry.updateMany({
            where: {
              id: { in: data.timeEntryIds },
            },
            data: {
              invoiced: true,
              invoice_id: invoice.id,
            },
          });
        }
        return invoice;
      },
      {
        isolationLevel: "Serializable",
      },
    );
  }

  static async getInvoiceStats(userId: string, start?: Date, end?: Date) {
    const whereDateFilter =
      start && end ? `AND issue_date BETWEEN $2 AND $3` : "";
    const params: any[] = [userId];
    if (start && end) {
      params.push(start);
      params.push(end);
    }
    const result = await prisma.$queryRawUnsafe<any[]>(
      `
         SELECT
      COALESCE(SUM(total), 0) AS total_invoiced,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0) AS total_paid,
      COALESCE(SUM(CASE WHEN status = 'sent' THEN total ELSE 0 END), 0) AS total_pending,
      COALESCE(SUM(CASE WHEN status = 'overdue' THEN total ELSE 0 END), 0) AS total_overdue,
      COALESCE(SUM(CASE WHEN status = 'draft' THEN total ELSE 0 END), 0) AS total_draft
    FROM invoices
    WHERE user_id = $1
      AND deleted_at IS NULL
      ${whereDateFilter}
      `,
      ...params,
    );
    return {
      total_invoiced: Number(result[0].total_invoiced),
      total_paid: Number(result[0].total_paid),
      total_pending: Number(result[0].total_pending),
      total_overdue: Number(result[0].total_overdue),
      total_draft: Number(result[0].total_draft),
    };
  }

  static async getInvoiceById(userId: string, invoiceId: string) {
    // TODO: Fetch invoice with items and client details
    // TODO: Ensure user owns the invoice
    return { message: "Get invoice by ID (TODO)" };
  }

  static async updateInvoice(
    userId: string,
    invoiceId: string,
    data: UpdateInvoiceInput,
  ) {
    // TODO: Fetch existing invoice
    // TODO: Ensure user owns invoice
    // TODO: Update fields (recalculate totals if items change)
    return { message: "Update invoice (TODO)" };
  }

  static async deleteInvoice(userId: string, invoiceId: string) {
    // TODO: Fetch invoice
    // TODO: Check if status allows deletion (e.g. only draft)
    // TODO: If linked to time entries, unmark them as invoiced
    // TODO: Soft delete or hard delete based on requirements
    return { message: "Delete invoice (TODO)" };
  }

  static async generateInvoicePdf(userId: string, invoiceId: string) {
    // TODO: Check invoice existence
    // TODO: Trigger PDF generation (Puppeteer/Queue)
    // TODO: Upload to S3/Storage and save URL
    return { message: "Generate PDF (TODO)" };
  }

  static async downloadInvoicePdf(userId: string, invoiceId: string) {
    // TODO: Check invoice existence
    // TODO: Return signed URL or file stream
    return { message: "Download PDF (TODO)" };
  }

  static async sendInvoiceEmail(userId: string, invoiceId: string) {
    // TODO: Check invoice existence
    // TODO: Generate PDF if not exists
    // TODO: Send email to client
    // TODO: Update status to 'sent' if draft
    return { message: "Send email (TODO)" };
  }

  static async markInvoiceAsPaid(
    userId: string,
    invoiceId: string,
    data: MarkInvoiceAsPaidInput,
  ) {
    // TODO: Check invoice existence
    // TODO: Create Payment record
    // TODO: Update invoice status to 'paid'
    // TODO: Update 'paid_at' field
    return { message: "Mark as paid (TODO)" };
  }
}
