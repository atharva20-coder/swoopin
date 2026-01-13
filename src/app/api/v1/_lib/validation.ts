import { z } from 'zod';
import { NextResponse } from 'next/server';

/**
 * API Request/Response Validation
 * Contract-driven design with Zod schemas
 */

/**
 * Validate request body against a Zod schema
 * Returns validated data or a 422 validation error response
 */
export async function validateBody<T extends z.ZodSchema>(
  request: Request,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
        code: e.code,
      }));
      
      return {
        success: false,
        response: NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request body',
              details,
            },
          },
          { status: 422 }
        ),
      };
    }
    
    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON in request body',
            details: [],
          },
        },
        { status: 422 }
      ),
    };
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T extends z.ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse } {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = schema.safeParse(params);
  
  if (!result.success) {
    const details = result.error.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));
    
    return {
      success: false,
      response: NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details,
          },
        },
        { status: 422 }
      ),
    };
  }
  
  return { success: true, data: result.data };
}

/**
 * Validate response data against a schema (prevents data leakage)
 */
export function validateResponse<T extends z.ZodSchema>(
  data: unknown,
  schema: T
): z.infer<T> {
  return schema.parse(data);
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  // Cursor-based pagination
  cursorPagination: z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),

  // UUID
  uuid: z.string().uuid(),

  // Email
  email: z.string().email(),

  // Non-empty string
  nonEmptyString: z.string().min(1),
  
  // Date string
  dateString: z.string().datetime(),
};

/**
 * Create a paginated response schema
 */
export function createPaginatedSchema<T extends z.ZodSchema>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    meta: z.object({
      nextCursor: z.string().nullable(),
      hasMore: z.boolean(),
      total: z.number().optional(),
    }),
  });
}

/**
 * Infer types from schemas
 */
export type CursorPagination = z.infer<typeof CommonSchemas.cursorPagination>;
