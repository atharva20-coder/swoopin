import { NextResponse } from 'next/server';
import type { ApiSuccessResponse, ApiErrorResponse, ErrorCode } from './types';
import { ErrorCodes } from './types';

/**
 * API Response Helpers
 * Standard response functions for consistent API responses
 */

/**
 * Success response
 */
export function success<T>(
  data: T,
  meta?: ApiSuccessResponse<T>['meta']
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      ...meta,
      version: 'v1',
    },
  });
}

/**
 * Paginated success response
 */
export function paginated<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse<ApiSuccessResponse<T[]>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      version: 'v1',
    },
  });
}

/**
 * Error response
 */
export function error(
  code: ErrorCode,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

/**
 * Common error responses
 */
export function unauthorized(message: string = 'Authentication required') {
  return error(ErrorCodes.UNAUTHORIZED, message, 401);
}

export function forbidden(message: string = 'Access denied') {
  return error(ErrorCodes.FORBIDDEN, message, 403);
}

export function notFound(resource: string = 'Resource') {
  return error(ErrorCodes.NOT_FOUND, `${resource} not found`, 404);
}

export function validationError(message: string, details?: Record<string, unknown>) {
  return error(ErrorCodes.VALIDATION_ERROR, message, 400, details);
}

export function conflict(message: string) {
  return error(ErrorCodes.CONFLICT, message, 409);
}

export function rateLimited(message: string = 'Too many requests') {
  return error(ErrorCodes.RATE_LIMITED, message, 429);
}

export function internalError(message: string = 'Internal server error') {
  return error(ErrorCodes.INTERNAL_ERROR, message, 500);
}

export function serviceUnavailable(message: string = 'Service temporarily unavailable') {
  return error(ErrorCodes.SERVICE_UNAVAILABLE, message, 503);
}
