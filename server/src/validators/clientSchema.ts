import { z } from "zod";

export const createClientSchema = z.object({
    name: z.string().min(1, "İsim zorunludur").max(255),
    company: z.string().max(255).optional(),
    email: z.string().email("Geçerli bir e-posta adresi giriniz").optional(),
    phone: z.string().max(50).optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
    hourly_rate: z.number().positive("Saatlik ücret pozitif olmalıdır").optional(),
});

export const getClientByIdSchema = z.object({
    id: z.string().min(1, "ID zorunludur").max(255),
});

export const getClientsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    sort: z.enum(["name", "company", "created_at", "hourly_rate"]).default("created_at"),
    order: z.enum(["asc", "desc"]).default("desc"),
});

export const updateClientSchema = createClientSchema.partial();

export type GetClientByIdInput = z.infer<typeof getClientByIdSchema>;
export type GetClientsQueryInput = z.infer<typeof getClientsQuerySchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;