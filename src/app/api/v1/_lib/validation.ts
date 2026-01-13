import { z } from 'zod';
import { validationError } from './response';

/**
 * API Request Validation
 * Zod-based validation helpers for API requests
 */

/**
 * Validate request body against a Zod schema
 * Returns validated data or throws a validation error response
 */
export async function validateBody<T extends z.ZodSchema>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const details = err.errors.reduce((acc, e) => {
        const path = e.path.join('.');
        acc[path] = e.message;
        return acc;
      }, {} as Record<string, string>);
      
      throw validationError('Invalid request body', details);
    }
    throw validationError('Invalid JSON body');
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T extends z.ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  try {
    return schema.parse(params);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const details = err.errors.reduce((acc, e) => {
        const path = e.path.join('.');
        acc[path] = e.message;
        return acc;
      }, {} as Record<string, string>);
      
      throw validationError('Invalid query parameters', details);
    }
    throw validationError('Invalid query parameters');
  }
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),

  // UUID
  uuid: z.string().uuid(),

  // Email
  email: z.string().email(),

  // Non-empty string
  nonEmptyString: z.string().min(1),
};
