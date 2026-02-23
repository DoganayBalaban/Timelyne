import { z } from "zod";

// ── Invoice Item sub-schema ────────────────────────────────────────────────

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Açıklama gereklidir"),
  quantity: z.number().min(0.01, "Miktar en az 0.01 olmalıdır"),
  rate: z.number().min(0, "Birim fiyat 0'dan küçük olamaz"),
});

// ── Create Invoice ─────────────────────────────────────────────────────────

export const createInvoiceSchema = z
  .object({
    clientId: z.string().min(1, "Müşteri seçimi zorunludur"),
    issueDate: z.string().min(1, "Düzenleme tarihi zorunludur"),
    dueDate: z.string().min(1, "Vade tarihi zorunludur"),
    items: z.array(invoiceItemSchema).optional(),
    timeEntryIds: z.array(z.string()).optional(),
    tax: z.number().min(0).default(0),
    discount: z.number().min(0).default(0),
    currency: z.string().default("USD"),
    notes: z.string().optional().or(z.literal("")),
    terms: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) =>
      (data.items && data.items.length > 0) ||
      (data.timeEntryIds && data.timeEntryIds.length > 0),
    {
      message: "En az bir kalem veya zaman kaydı eklemelisiniz",
      path: ["items"],
    },
  );

// ── Update Invoice ─────────────────────────────────────────────────────────

export const updateInvoiceSchema = z.object({
  issue_date: z.string().optional(),
  due_date: z.string().optional(),
  notes: z.string().optional().or(z.literal("")),
  terms: z.string().optional().or(z.literal("")),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
  invoice_items: z.array(invoiceItemSchema).optional(),
});

// ── Mark as Paid ───────────────────────────────────────────────────────────

export const markAsPaidSchema = z.object({
  paidAt: z.string().optional(),
  amount: z.number().positive("Ödeme tutarı pozitif olmalıdır").optional(),
  paymentMethod: z.string().optional().or(z.literal("")),
  referenceNumber: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

// ── Inferred Types ─────────────────────────────────────────────────────────

export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;
export type CreateInvoiceInputData = z.input<typeof createInvoiceSchema>;
export type UpdateInvoiceFormData = z.infer<typeof updateInvoiceSchema>;
export type MarkAsPaidFormData = z.infer<typeof markAsPaidSchema>;
