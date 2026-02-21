import { z } from "zod";

// --- Params ---
export const invoiceIdParamSchema = z.object({
  id: z.uuid("Geçerli bir fatura ID'si giriniz"),
});

// --- Sub Schemas ---
const invoiceItemSchema = z.object({
  description: z.string().min(1, "Açıklama gereklidir"),
  quantity: z.number().min(0.01, "Miktar en az 0.01 olmalıdır"),
  rate: z.number().min(0, "Birim fiyat 0 olamaz"),
});

// --- Invoice Operations ---

export const createInvoiceSchema = z
  .object({
    clientId: z.uuid("Geçerli bir müşteri ID'si seçiniz"),
    issueDate: z.coerce.date(),
    dueDate: z.coerce.date(),
    invoiceNumber: z.string().min(1, "Fatura numarası gereklidir").optional(), // Opsiyonel: Backend otomatik üretebilir
    items: z
      .array(invoiceItemSchema)
      .min(1, "En az bir kalem eklemelisiniz")
      .optional(),
    timeEntryIds: z.array(z.uuid()).optional(), // Zaman kayıtlarından oluşturuluyorsa
    tax: z.number().min(0).default(0),
    discount: z.number().min(0).default(0),
    currency: z.string().default("USD"),
    notes: z.string().optional(),
    terms: z.string().optional(),
  })
  .refine(
    (data) =>
      (data.items && data.items.length > 0) ||
      (data.timeEntryIds && data.timeEntryIds.length > 0),
    {
      message:
        "Fatura oluşturmak için en az bir kalem veya zaman kaydı seçmelisiniz",
      path: ["items"],
    },
  );

// Base schema for update to avoid partial check issues if we refine it later
// Base schema for update
const baseInvoiceUpdateSchema = z.object({
  clientId: z.uuid("Geçerli bir müşteri ID'si seçiniz"),
  issue_date: z.coerce.date(),
  due_date: z.coerce.date(),
  invoiceNumber: z.string(),
  invoice_items: z.array(invoiceItemSchema),
  tax: z.number().min(0),
  discount: z.number().min(0),
  currency: z.string(),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  notes: z.string(),
  terms: z.string(),
});

export const updateInvoiceSchema = baseInvoiceUpdateSchema.partial();

export const markInvoiceAsPaidSchema = z.object({
  paidAt: z.coerce.date().default(() => new Date()),
  amount: z.number().positive("Ödenen tutar pozitif olmalı").optional(), // Kısmi ödeme için opsiyonel
  paymentMethod: z.string().optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const getInvoiceStatsQuerySchema = z.object({
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional(),
});

export const getInvoicesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
  clientId: z.string().uuid().optional(),
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional(),
  sortBy: z
    .enum(["issue_date", "due_date", "total", "created_at"])
    .default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// --- Inferred Types ---
export type InvoiceIdParam = z.infer<typeof invoiceIdParamSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type MarkInvoiceAsPaidInput = z.infer<typeof markInvoiceAsPaidSchema>;
export type GetInvoiceStatsQueryInput = z.infer<
  typeof getInvoiceStatsQuerySchema
>;
export type GetInvoicesQueryInput = z.infer<typeof getInvoicesQuerySchema>;
