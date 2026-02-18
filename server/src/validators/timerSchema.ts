import { z } from "zod";

// --- Params ---

export const timeEntryIdParamSchema = z.object({
    id: z.string().uuid("Geçerli bir zaman kaydı ID'si giriniz"),
});

// --- Timer Operations ---

export const startTimeEntrySchema = z.object({
    projectId: z.string().uuid("Geçerli bir proje ID'si giriniz"),
    taskId: z.string().uuid("Geçerli bir görev ID'si giriniz").optional(),
    description: z.string().max(500, "Açıklama çok uzun").optional(),
    billable: z.boolean().default(true),
});

export const manualTimeEntrySchema = z.object({
    projectId: z.string().uuid("Geçerli bir proje ID'si giriniz"),
    taskId: z.string().uuid("Geçerli bir görev ID'si giriniz").optional(),
    description: z.string().max(500, "Açıklama çok uzun").optional(),
    started_at: z.string().datetime("Geçerli bir başlangıç zamanı giriniz"),
    ended_at: z.string().datetime("Geçerli bir bitiş zamanı giriniz"),
    billable: z.boolean().default(true),
}).refine((data) => new Date(data.ended_at) > new Date(data.started_at), {
    message: "Bitiş zamanı başlangıç zamanından sonra olmalıdır",
    path: ["ended_at"],
});

export const updateTimeEntrySchema = manualTimeEntrySchema.partial();

export const getTimeReportQuerySchema = z.object({
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
    project_id: z.string().uuid().optional(),
    client_id: z.string().uuid().optional(),
    billable: z.coerce.boolean().optional(),
    invoiced: z.coerce.boolean().optional(),
    sort: z.enum(["started_at", "duration_minutes", "project_id"]).default("started_at"),
    order: z.enum(["asc", "desc"]).default("desc"),
});

// --- Inferred Types ---

export type TimeEntryIdParam = z.infer<typeof timeEntryIdParamSchema>;
export type StartTimeEntryInput = z.infer<typeof startTimeEntrySchema>;
export type ManualTimeEntryInput = z.infer<typeof manualTimeEntrySchema>;
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>;
export type GetTimeReportQueryInput = z.infer<typeof getTimeReportQuerySchema>;
