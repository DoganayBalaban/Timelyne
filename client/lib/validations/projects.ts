import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Proje adı zorunludur").max(255, "Proje adı çok uzun"),
  description: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "completed", "on_hold", "cancelled"]),
  client_id: z.string().uuid().optional().or(z.literal("")),
  budget: z
    .number()
    .positive("Bütçe pozitif olmalıdır")
    .optional()
    .or(z.nan()),
  hourly_rate: z
    .number()
    .positive("Saatlik ücret pozitif olmalıdır")
    .optional()
    .or(z.nan()),
  start_date: z.string().optional().or(z.literal("")),
  deadline: z.string().optional().or(z.literal("")),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli bir hex renk kodu giriniz")
    .optional()
    .or(z.literal("")),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;
