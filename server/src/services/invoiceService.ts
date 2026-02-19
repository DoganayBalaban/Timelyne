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
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        user_id: userId,
        deleted_at: null,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        invoice_items: true,
        time_entries: {
          where: {
            deleted_at: null,
          },
          select: {
            id: true,
            description: true,
            duration_minutes: true,
            hourly_rate: true,
            started_at: true,
            ended_at: true,
          },
        },
        payments: true,
      },
    });
    if (!invoice) {
      throw new AppError("Fatura bulunamadı", 404);
    }
    return invoice;
  }

  static async updateInvoice(
    userId: string,
    invoiceId: string,
    data: UpdateInvoiceInput,
  ) {
    return await prisma.$transaction(
      async (tx) => {
        const invoice = await tx.invoice.findFirst({
          where: {
            id: invoiceId,
            user_id: userId,
            deleted_at: null,
          },
          include: { invoice_items: true },
        });
        if (!invoice) {
          throw new AppError("Invoice not found", 404);
        }
        if (invoice.status === "paid" || invoice.status === "cancelled") {
          throw new AppError("Cannot modify finalized invoice", 400);
        }
        if (data.status) {
          const validTransactions: Record<string, string[]> = {
            draft: ["sent", "cancelled"],
            sent: ["paid", "overdue"],
            overdue: ["paid"],
          };
          const allowed = validTransactions[invoice.status] || [];
          if (!allowed.includes(data.status)) {
            throw new AppError("Invalid status transition", 400);
          }
        }
        let subtotal = Number(invoice.subtotal);
        if (data.invoice_items) {
          if (invoice.status !== "draft") {
            throw new AppError(
              "Items can only be modified in draft status",
              400,
            );
          }
          await tx.invoiceItem.deleteMany({
            where: {
              invoice_id: invoiceId,
            },
          });
          subtotal = 0;
          const newItems = data.invoice_items.map((item) => {
            const amount = item.quantity * item.rate;
            subtotal += amount;

            return {
              invoice_id: invoiceId,
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount,
            };
          });
          await tx.invoiceItem.createMany({
            data: newItems,
          });
        }
        const tax = Number(invoice.tax);
        const discount = Number(invoice.discount);

        const total = subtotal + tax - discount;

        if (total <= 0) {
          throw new AppError("Invoice total must be greater than zero", 400);
        }
        const updated = await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            issue_date: data.issue_date,
            due_date: data.due_date,
            notes: data.notes,
            terms: data.terms,
            status: data.status,
            subtotal,
            total,
          },
          include: {
            invoice_items: true,
          },
        });
        return updated;
      },
      {
        isolationLevel: "Serializable",
      },
    );
  }

  static async deleteInvoice(userId: string, invoiceId: string) {
    return await prisma.$transaction(
      async (tx) => {
        const invoice = await tx.invoice.findFirst({
          where: {
            id: invoiceId,
            user_id: userId,
            deleted_at: null,
          },
        });
        if (!invoice) {
          throw new AppError("Invoice not found", 404);
        }

        if (invoice.status !== "draft") {
          throw new AppError("Only draft invoices can be deleted", 400);
        }
        await tx.timeEntry.updateMany({
          where: { invoice_id: invoiceId },
          data: {
            invoiced: false,
            invoice_id: null,
          },
        });
        await tx.invoice.update({
          where: {
            id: invoiceId,
          },
          data: {
            deleted_at: new Date(),
          },
        });
        return true;
      },
      {
        isolationLevel: "Serializable",
      },
    );
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
    await prisma.$transaction(
      async (tx) => {
        const invoice = await tx.invoice.findFirst({
          where: {
            id: invoiceId,
            user_id: userId,
            deleted_at: null,
          },
          include: {
            payments: true,
            client: true,
          },
        });
        if (!invoice) {
          throw new Error("Invoice not found");
        }

        if (invoice.status === "draft") {
          throw new Error("Draft invoice cannot receive payment");
        }

        if (invoice.status === "cancelled") {
          throw new Error("Cancelled invoice cannot receive payment");
        }
        const totalPaidSoFar = invoice.payments.reduce(
          (sum, p) => sum + Number(p.amount),
          0,
        );
        const remainingAmount = Number(invoice.total) - totalPaidSoFar;
        if (data.amount! <= 0) {
          throw new Error("Invalid payment amount");
        }

        if (data.amount! > remainingAmount) {
          throw new Error("Payment exceeds remaining balance");
        }
        await tx.payment.create({
          data: {
            invoice_id: invoiceId,
            amount: data.amount!,
            payment_method: data.paymentMethod,
            reference_number: data.referenceNumber,
            paid_at: new Date(),
          },
        });
        const newTotalPaid = totalPaidSoFar + data.amount!;
        let newStatus = invoice.status;
        if (newTotalPaid >= Number(invoice.total)) {
          newStatus = "paid";
        } else {
          newStatus = "sent"; // partial payment
        }
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            status: newStatus,
            paid_at: newStatus === "paid" ? new Date() : invoice.paid_at,
          },
        });
        await tx.client.update({
          where: { id: invoice.client_id },
          data: {
            total_paid: {
              increment: data.amount,
            },
          },
        });
        return {
          invoiceId,
          paid_amount: data.amount,
          remaining_balance: Number(invoice.total) - newTotalPaid,
          status: newStatus,
        };
      },
      {
        isolationLevel: "Serializable",
      },
    );
  }
}
