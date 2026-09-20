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

/** Unchecked checkboxes are absent from FormData, so a missing value is a
 * refusal of marketing consent, which is exactly the DPDP default. */
export const marketingOptInSchema = z
  .literal("yes")
  .optional()
  .transform((value) => value === "yes");

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: emailSchema,
  password: passwordSchema,
  marketingOptIn: marketingOptInSchema,
  "cf-turnstile-response": z.string().max(2048).optional(),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
  "cf-turnstile-response": z.string().max(2048).optional(),
});

export const resetSchema = z.object({
  email: emailSchema,
  "cf-turnstile-response": z.string().max(2048).optional(),
});
export const updatePasswordSchema = z.object({ password: passwordSchema });

export const verifyOtpSchema = z.object({
  email: emailSchema,
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export const resendOtpSchema = z.object({ email: emailSchema });
