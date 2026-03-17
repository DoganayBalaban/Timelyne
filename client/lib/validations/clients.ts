import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  company: z.string().max(255).optional().or(z.literal("")),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  hourly_rate: z
    .number()
    .positive("Hourly rate must be positive")
    .optional()
    .or(z.nan()),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientFormData = z.infer<typeof createClientSchema>;
export type UpdateClientFormData = z.infer<typeof updateClientSchema>;
