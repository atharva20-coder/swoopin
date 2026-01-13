/**
 * API v1 Library
 * Re-export all utility functions for easy importing
 */

// Response helpers
export {
  success,
  paginated,
  error,
  unauthorized,
  forbidden,
  notFound,
  validationError,
  conflict,
  rateLimited,
  internalError,
  serviceUnavailable,
} from './response';

// Types
export { ErrorCodes } from './types';
export type { 
  ApiResponse, 
  ApiSuccessResponse, 
  ApiErrorResponse,
  ErrorCode,
} from './types';

// Middleware
export {
  getAuthUser,
  requireAuth,
  getDbUser,
  hasSubscription,
  isAdmin,
} from './middleware';
export type { AuthenticatedUser } from './middleware';

// Validation
export {
  validateBody,
  validateQuery,
  validateResponse,
  CommonSchemas,
  createPaginatedSchema,
} from './validation';
export type { CursorPagination } from './validation';

// Rate Limiting
export {
  checkRateLimit,
  rateLimitByUser,
  rateLimitByIp,
  RateLimitConfigs,
} from './rate-limit';
