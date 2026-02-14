import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(1, "İsim zorunludur").max(255, "İsim çok uzun"),
  company: z.string().max(255).optional().or(z.literal("")),
  email: z
    .string()
    .email("Geçerli bir e-posta adresi giriniz")
    .optional()
    .or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  hourly_rate: z
    .number()
    .positive("Saatlik ücret pozitif olmalıdır")
    .optional()
    .or(z.nan()),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientFormData = z.infer<typeof createClientSchema>;
export type UpdateClientFormData = z.infer<typeof updateClientSchema>;
