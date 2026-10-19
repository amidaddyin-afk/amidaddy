import { z } from "zod";

export const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Choose a star rating.")
    .max(5, "Choose a star rating."),
  title: z
    .string()
    .trim()
    .max(100, "Keep the headline under 100 characters.")
    .optional()
    .transform((value) => value || null),
  body: z
    .string()
    .trim()
    .min(10, "Tell us a little more — at least 10 characters.")
    .max(2000, "Keep the review under 2,000 characters."),
});

/** "Raghvendra Verma" -> "Raghvendra V." Reviews are public, so never show a
 * full surname or anything derived from the email address. */
export function publicAuthorName(fullName: string | null | undefined) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Amidaddy customer";
  const first = parts[0].slice(0, 40);
  return parts.length > 1
    ? `${first} ${parts[parts.length - 1][0].toUpperCase()}.`
    : first;
}
