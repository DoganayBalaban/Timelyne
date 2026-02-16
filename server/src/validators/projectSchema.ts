import { z } from "zod";

// --- Params ---

export const projectIdParamSchema = z.object({
    id: z.string().uuid("Geçerli bir proje ID'si giriniz"),
});

// --- Project CRUD ---

export const createProjectSchema = z.object({
    client_id: z.string().uuid().optional(),
    name: z.string().min(1, "Proje adı zorunludur").max(255),
    description: z.string().optional(),
    status: z.enum(["active", "completed", "on_hold", "cancelled"]).default("active"),
    budget: z.number().positive("Bütçe pozitif olmalıdır").optional(),
    hourly_rate: z.number().positive("Saatlik ücret pozitif olmalıdır").optional(),
    start_date: z.string().datetime().optional(),
    deadline: z.string().datetime().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli bir hex renk kodu giriniz").optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const getProjectsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    status: z.enum(["active", "completed", "on_hold", "cancelled"]).optional(),
    client_id: z.string().uuid().optional(),
    sort: z.enum(["name", "created_at", "deadline", "budget", "status"]).default("created_at"),
    order: z.enum(["asc", "desc"]).default("desc"),
});

// --- Attachment ---

export const addAttachmentSchema = z.object({
    projectId: z.string().uuid("Geçerli bir proje ID'si giriniz"),
    userId: z.string().uuid("Geçerli bir kullanıcı ID'si giriniz"),
    filename: z.string().min(1, "Dosya adı zorunludur").max(255),
    file_url: z.string().url("Geçerli bir URL giriniz"),
    file_size: z.number().int().positive("Dosya boyutu pozitif olmalıdır").optional(),
    mime_type: z.string().max(100).optional(),
});

// --- Inferred Types ---

export type ProjectIdParam = z.infer<typeof projectIdParamSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type GetProjectsQueryInput = z.infer<typeof getProjectsQuerySchema>;
export type AddAttachmentInput = z.infer<typeof addAttachmentSchema>;
