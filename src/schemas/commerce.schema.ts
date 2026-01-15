import { z } from "zod";

/**
 * ============================================
 * COMMERCE SCHEMAS (Contract-Driven Design)
 * All normalization happens here via .transform()
 * ============================================
 */

// ============================================
// TRANSFORMERS
// ============================================

const nullishToNull = z
  .string()
  .nullish()
  .transform((val): string | null => val ?? null);

// ============================================
// ENUMS
// ============================================

export const ProductStatusSchema = z.enum([
  "ACTIVE",
  "OUT_OF_STOCK",
  "DISCONTINUED",
]);

// ============================================
// PRODUCT SCHEMA
// ============================================

export const ProductSchema = z.object({
  id: z.string().uuid(),
  externalId: z.string(),
  name: z.string(),
  price: z.number().min(0),
  currency: z.string().default("USD"),
  imageUrl: nullishToNull,
  status: ProductStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const ProductListSchema = z.array(ProductSchema);

// ============================================
// CATALOG SCHEMA
// ============================================

export const CatalogSchema = z.object({
  id: z.string().uuid(),
  catalogId: z.string(),
  name: nullishToNull,
  syncedAt: z.coerce.date().nullable(),
  products: ProductListSchema.optional(),
});

// ============================================
// REQUEST SCHEMAS
// ============================================

export const ProductsQuerySchema = z.object({
  status: ProductStatusSchema.optional(),
});

export const UpdateProductStatusRequestSchema = z.object({
  productId: z.string().uuid(),
  status: ProductStatusSchema,
});

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const SyncResultSchema = z.object({
  synced: z.boolean(),
  productCount: z.number().int().min(0),
  catalogId: z.string().nullable(),
});

// ============================================
// PRISMA INPUT SCHEMAS (for database operations)
// ============================================

export const ProductPrismaInputSchema = z.object({
  externalId: z.string(),
  name: z.string(),
  price: z.number().min(0),
  currency: z.string().default("USD"),
  imageUrl: nullishToNull,
  status: ProductStatusSchema,
});

// ============================================
// EXPORTED TYPES
// ============================================

export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Catalog = z.infer<typeof CatalogSchema>;
export type ProductsQuery = z.infer<typeof ProductsQuerySchema>;
export type UpdateProductStatusRequest = z.infer<
  typeof UpdateProductStatusRequestSchema
>;
export type SyncResult = z.infer<typeof SyncResultSchema>;
export type ProductPrismaInput = z.infer<typeof ProductPrismaInputSchema>;
