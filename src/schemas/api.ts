import { z } from "zod";

/**
 * Common validation schemas for API endpoints
 */

// Email validation
export const emailSchema = z.string().email("Invalid email address");

// User deletion request
export const deleteUserSchema = z.object({
  email: emailSchema,
});

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Admin user upgrade request
export const upgradeUserSchema = z.object({
  email: emailSchema,
  plan: z.enum(["FREE", "PRO", "ENTERPRISE"]),
});

// Automation ID validation
export const automationIdSchema = z.object({
  id: z.string().uuid("Invalid automation ID"),
});

// Generic ID validation
export const idSchema = z.object({
  id: z.string().uuid("Invalid ID"),
});

/**
 * Validate request body against a schema
 * Returns parsed data or throws validation error
 */
export async function validateBody<T extends z.ZodSchema>(
  request: Request,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; error: string }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error.errors.map((e) => e.message).join(", "),
      };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: "Invalid JSON body" };
  }
}

/**
 * Validate search params against a schema
 */
export function validateSearchParams<T extends z.ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const params = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(params);
  
  if (!result.success) {
    return {
      success: false,
      error: result.error.errors.map((e) => e.message).join(", "),
    };
  }
  
  return { success: true, data: result.data };
}
