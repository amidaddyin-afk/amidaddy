import { z } from "zod";

const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120);

export const productInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug,
  sku: z.string().trim().min(2).max(80),
  barcode: z.string().trim().max(80).optional().nullable(),
  description: z.string().trim().min(10).max(5000),
  mrp: z.coerce.number().nonnegative().max(9999999),
  sellingPrice: z.coerce.number().nonnegative().max(9999999),
  offerPrice: z.coerce.number().nonnegative().max(9999999).optional().nullable(),
  gstRate: z.coerce.number().min(0).max(100).default(18),
  stock: z.coerce.number().int().nonnegative().max(100000),
  lowStockAt: z.coerce.number().int().nonnegative().max(100000).default(5),
  active: z.coerce.boolean().default(false),
  featured: z.coerce.boolean().default(false),
  isNew: z.coerce.boolean().default(false),
  bestSeller: z.coerce.boolean().default(false),
  seoTitle: z.string().trim().max(70).optional().nullable(),
  seoDescription: z.string().trim().max(160).optional().nullable(),
  brandId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  images: z.array(z.object({ url: z.string().url().max(2048), alt: z.string().trim().min(1).max(160) })).min(1).max(8),
}).superRefine((value, context) => {
  if (value.sellingPrice > value.mrp) context.addIssue({ code: "custom", path: ["sellingPrice"], message: "Selling price cannot exceed MRP." });
  if (value.offerPrice && value.offerPrice > value.sellingPrice) context.addIssue({ code: "custom", path: ["offerPrice"], message: "Offer price cannot exceed selling price." });
});

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().positive().max(10000).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(120).optional(),
  brand: z.string().trim().max(120).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  inStock: z.enum(["true", "false"]).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "name"]).default("newest"),
  includeDeleted: z.enum(["true", "false"]).optional(),
});
