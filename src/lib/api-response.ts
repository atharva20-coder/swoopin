import { NextResponse } from "next/server";

/**
 * Standardized API response utilities following enterprise REST standards.
 * All responses use consistent shapes for frontend parsing.
 */

/**
 * Success response wrapper
 */
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ status, data }, { status });
}

/**
 * Error response wrapper - never exposes stack traces
 */
export function apiError(
  code: string,
  message: string,
  status: number,
  details: unknown[] = []
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

/**
 * Common error responses for reuse
 */
export const ApiErrors = {
  unauthorized: () => apiError("UNAUTHORIZED", "Authentication required", 401),
  forbidden: () => apiError("FORBIDDEN", "Access denied", 403),
  notFound: (resource = "Resource") =>
    apiError("NOT_FOUND", `${resource} not found`, 404),
  validation: (errors: unknown[]) =>
    apiError("VALIDATION_ERROR", "Invalid request data", 422, errors),
  rateLimited: () =>
    apiError("RATE_LIMITED", "Too many requests. Please try again later.", 429),
  internal: () =>
    apiError("INTERNAL_ERROR", "An unexpected error occurred", 500),
};

/**
 * Paginated response wrapper
 */
export function apiPaginated<T>(
  data: T[],
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }
) {
  return NextResponse.json({
    status: 200,
    data,
    pagination,
  });
}

/**
 * Cursor-based pagination response
 */
export function apiCursorPaginated<T>(
  data: T[],
  cursor: {
    nextCursor: string | null;
    prevCursor?: string | null;
  }
) {
  return NextResponse.json({
    status: 200,
    data,
    ...cursor,
  });
}
