import { z } from "zod";

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(120);

export const productInputSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    slug,
    sku: z.string().trim().min(2).max(80),
    barcode: z.string().trim().max(80).optional().nullable(),
    description: z.string().trim().min(10).max(5000),
    gstRate: z.coerce.number().min(0).max(100).default(18),
    fragranceFamily: z.enum(["Woody", "Floral", "Fresh", "Amber", "Mixed"]),
    concentration: z.string().trim().min(2).max(80).default("Eau de Parfum"),
    genderPositioning: z.string().trim().min(2).max(80).default("Unisex"),
    collection: z.enum(["unisex", "combos"]).default("unisex"),
    packSize: z.coerce.number().int().min(1).max(100).default(1),
    topNotes: z.array(z.string().trim().min(1).max(80)).min(1).max(8),
    heartNotes: z.array(z.string().trim().min(1).max(80)).min(1).max(8),
    baseNotes: z.array(z.string().trim().min(1).max(80)).min(1).max(8),
    longevity: z.string().trim().min(2).max(80),
    mood: z.string().trim().min(2).max(160),
    occasion: z.string().trim().min(2).max(160),
    story: z.string().trim().min(10).max(5000),
    active: z.coerce.boolean().default(false),
    featured: z.coerce.boolean().default(false),
    isNew: z.coerce.boolean().default(false),
    bestSeller: z.coerce.boolean().default(false),
    seoTitle: z.string().trim().max(70).optional().nullable(),
    seoDescription: z.string().trim().max(160).optional().nullable(),
    brandId: z.string().uuid().optional().nullable(),
    categoryId: z.string().uuid().optional().nullable(),
    images: z
      .array(
        z.object({
          url: z
            .string()
            .trim()
            .min(1)
            .max(2048)
            .refine((value) => {
              if (value.startsWith("/") && !value.startsWith("//")) return true;
              if (!URL.canParse(value)) return false;
              return new URL(value).protocol === "https:";
            }, "Use an HTTPS image URL or site path."),
          alt: z.string().trim().min(1).max(160),
          variantName: z.enum(["20ml", "100ml"]).optional().nullable(),
        }),
      )
      .min(1)
      .max(8),
    variants: z
      .array(
        z.object({
          id: z.string().uuid().optional(),
          name: z.enum(["20ml", "100ml"]),
          sku: z.string().trim().min(2).max(80),
          pricePaise: z.coerce.number().int().nonnegative().max(999999999),
          mrpPaise: z.coerce.number().int().nonnegative().max(999999999),
          stock: z.coerce.number().int().nonnegative().max(100000),
          lowStockAt: z.coerce
            .number()
            .int()
            .nonnegative()
            .max(100000)
            .default(5),
          active: z.coerce.boolean().default(true),
        }),
      )
      .min(1)
      .max(8),
  })
  .superRefine((value, context) =>
    value.variants.forEach((variant, index) => {
      if (variant.pricePaise > variant.mrpPaise)
        context.addIssue({
          code: "custom",
          path: ["variants", index, "pricePaise"],
          message: "Variant price cannot exceed MRP.",
        });
    }),
  );

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().positive().max(10000).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(120).optional(),
  collection: z.enum(["unisex", "combos"]).optional(),
  family: z.enum(["Woody", "Floral", "Fresh", "Amber", "Mixed"]).optional(),
  size: z.enum(["20ml", "100ml"]).optional(),
  brand: z.string().trim().max(120).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  inStock: z.enum(["true", "false"]).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "name"]).default("newest"),
  includeDeleted: z.enum(["true", "false"]).optional(),
});
