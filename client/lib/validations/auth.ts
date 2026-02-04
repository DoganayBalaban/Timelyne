import { z } from "zod";

// Register schema - matches backend validation
export const registerSchema = z.object({
  email: z
    .string()
    .email("Geçerli bir e-posta adresi girin")
    .max(255, "E-posta çok uzun"),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .max(255, "Şifre çok uzun")
    .regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir")
    .regex(/[a-z]/, "Şifre en az bir küçük harf içermelidir")
    .regex(/[0-9]/, "Şifre en az bir rakam içermelidir")
    .regex(/[^A-Za-z0-9]/, "Şifre en az bir özel karakter içermelidir"),
  firstName: z.string().min(1, "İsim zorunlu").max(100, "İsim çok uzun"),
  lastName: z.string().min(1, "Soyisim zorunlu").max(100, "Soyisim çok uzun"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(1, "Şifre zorunlu"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Reset password schema
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .max(255, "Şifre çok uzun")
    .regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir")
    .regex(/[a-z]/, "Şifre en az bir küçük harf içermelidir")
    .regex(/[0-9]/, "Şifre en az bir rakam içermelidir")
    .regex(/[^A-Za-z0-9]/, "Şifre en az bir özel karakter içermelidir"),
  confirmPassword: z.string().min(1, "Şifre tekrarı zorunlu"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
