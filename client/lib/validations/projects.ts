import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(255, "Project name is too long"),
  description: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "completed", "on_hold", "cancelled"]),
  client_id: z.string().uuid().optional().or(z.literal("")),
  budget: z
    .number()
    .positive("Budget must be positive")
    .optional()
    .or(z.nan()),
  hourly_rate: z
    .number()
    .positive("Hourly rate must be positive")
    .optional()
    .or(z.nan()),
  start_date: z.string().optional().or(z.literal("")),
  deadline: z.string().optional().or(z.literal("")),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Please enter a valid hex color code")
    .optional()
    .or(z.literal("")),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;
