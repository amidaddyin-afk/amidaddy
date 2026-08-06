import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((value) => value.toLowerCase());
export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(128);

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: emailSchema,
  password: passwordSchema,
  captchaToken: z.string().optional(),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
  captchaToken: z.string().optional(),
});

export const resetSchema = z.object({
  email: emailSchema,
  captchaToken: z.string().optional(),
});
export const updatePasswordSchema = z.object({ password: passwordSchema });
