import {
  CreateInvoiceInput,
  MarkInvoiceAsPaidInput,
  UpdateInvoiceInput,
} from "../validators/invoiceSchema";

export class InvoiceService {
  static async createInvoice(userId: string, data: CreateInvoiceInput) {
    // TODO: Validate client ownership
    // TODO: Calculate subtotal from items or time entries
    // TODO: Apply tax and discount
    // TODO: Create invoice and invoice items in transaction
    // TODO: If time entries used, mark them as invoiced and link to invoice
    return { message: "Invoice created (TODO)" };
  }

  static async getInvoiceStats(userId: string) {
    // TODO: Aggregate invoices by status (paid, overdue, draft, etc.)
    // TODO: Calculate total amounts for each status
    return { message: "Invoice stats (TODO)" };
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
