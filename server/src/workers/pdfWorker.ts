import { Job, Worker } from "bullmq";
import { bullMqConnection } from "../queues/pdfQueue";
import logger from "../utils/logger";
import { buildInvoicePdf } from "../utils/pdfBuilder";
import { prisma } from "../utils/prisma";
import { uploadPdfToS3 } from "../utils/storageUpload";

interface PdfJobData {
  invoiceId: string;
}

const processPdfJob = async (job: Job<PdfJobData>) => {
  const { invoiceId } = job.data;

  logger.info(
    `[pdfWorker] Processing PDF job ${job.id} for invoice ${invoiceId}`,
  );

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: {
        select: {
          name: true,
          company: true,
          email: true,
          address: true,
        },
      },
      invoice_items: {
        select: {
          description: true,
          quantity: true,
          rate: true,
          amount: true,
        },
      },
      time_entries: {
        where: { deleted_at: null },
        select: {
          id: true,
          description: true,
          duration_minutes: true,
          hourly_rate: true,
        },
      },
      payments: {
        select: {
          amount: true,
          paid_at: true,
          payment_method: true,
        },
      },
    },
  });

  if (!invoice) {
    // Non-retryable: invoice was deleted while job was queued
    logger.error(`[pdfWorker] Invoice ${invoiceId} not found — discarding job`);
    throw new Error(`Invoice ${invoiceId} not found`);
  }

  // Build the PDF buffer
  const pdfBuffer = await buildInvoicePdf(invoice);

  // Store as private S3 object (key only, never a public URL)
  const fileKey = `invoices/${invoice.invoice_number}.pdf`;
  await uploadPdfToS3(fileKey, pdfBuffer);

  // Update invoice with key + status
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      pdf_url: fileKey,
      pdf_status: "generated",
      pdf_generated_at: new Date(),
    },
  });

  logger.info(
    `[pdfWorker] PDF generated for invoice ${invoice.invoice_number} → ${fileKey}`,
  );
};

// ─── Worker Registration ───────────────────────────────────────────────────

const pdfWorker = new Worker<PdfJobData>("pdfQueue", processPdfJob, {
  connection: bullMqConnection,
  concurrency: 5, // process up to 5 PDFs in parallel
});

pdfWorker.on("completed", (job) => {
  logger.info(`[pdfWorker] Job ${job.id} completed`);
});

pdfWorker.on("failed", async (job, err) => {
  logger.error(`[pdfWorker] Job ${job?.id} failed: ${err.message}`);

  // After all retries exhausted, mark the invoice as failed so the client
  // can surface a meaningful error rather than showing "processing" forever.
  if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
    try {
      await prisma.invoice.update({
        where: { id: job.data.invoiceId },
        data: { pdf_status: "failed" },
      });
      logger.warn(
        `[pdfWorker] Marked invoice ${job.data.invoiceId} pdf_status=failed after ${job.attemptsMade} attempts`,
      );
    } catch (updateErr) {
      logger.error(
        "[pdfWorker] Could not update pdf_status to failed:",
        updateErr,
      );
    }
  }
});

export default pdfWorker;
