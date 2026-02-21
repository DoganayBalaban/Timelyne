import { Job, Worker } from "bullmq";
import { bullMqConnection } from "../queues/pdfQueue";
import { sendEmail } from "../utils/email";
import { buildInvoiceEmailTemplate } from "../utils/emailTemplates";
import logger from "../utils/logger";
import { prisma } from "../utils/prisma";
import { getSignedDownloadUrl } from "../utils/storageUpload";

interface EmailJobData {
  invoiceId: string;
}

const processEmailJob = async (job: Job<EmailJobData>) => {
  const { invoiceId } = job.data;

  logger.info(
    `[emailWorker] Processing email job ${job.id} for invoice ${invoiceId}`,
  );

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new Error(`Invoice ${invoiceId} not found`);
  }

  if (!invoice.pdf_url) {
    throw new Error(`Invoice ${invoiceId} has no PDF — cannot send email`);
  }

  // Validate client has an email address
  if (!invoice.client.email) {
    throw new Error(
      `Client has no email address — cannot send invoice ${invoice.invoice_number}`,
    );
  }

  // Generate a 10-minute signed download URL (short expiry per security spec)
  const downloadUrl = await getSignedDownloadUrl(invoice.pdf_url, 600);

  const html = buildInvoiceEmailTemplate({
    invoiceNumber: invoice.invoice_number,
    clientName: invoice.client.name,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    subtotal: Number(invoice.subtotal),
    tax: Number(invoice.tax),
    discount: Number(invoice.discount),
    total: Number(invoice.total),
    currency: invoice.currency,
    downloadUrl,
    notes: invoice.notes,
  });

  await sendEmail({
    to: invoice.client.email,
    subject: `Invoice #${invoice.invoice_number} from Timelyne`,
    html,
  });

  // Transition status: only advance draft→sent is prevented upstream.
  // sent / overdue / paid stay as-is after a resend.
  const newStatus = invoice.status === "draft" ? "sent" : invoice.status;

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: newStatus,
      sent_at: invoice.sent_at ?? new Date(), // only set on first send
    },
  });

  logger.info(
    `[emailWorker] Invoice ${invoice.invoice_number} emailed to ${invoice.client.email}`,
  );
};

// ─── Worker Registration ───────────────────────────────────────────────────

const emailWorker = new Worker<EmailJobData>("emailQueue", processEmailJob, {
  connection: bullMqConnection,
  concurrency: 10,
});

emailWorker.on("completed", (job) => {
  logger.info(`[emailWorker] Job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
  logger.error(`[emailWorker] Job ${job?.id} failed: ${err.message}`);
});

export default emailWorker;
