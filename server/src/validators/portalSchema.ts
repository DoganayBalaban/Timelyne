import { z } from "zod";

export const verifyPortalTokenSchema = z.object({
  token: z.string().min(1),
});

export type VerifyPortalTokenInput = z.infer<typeof verifyPortalTokenSchema>;
