"use client";

/**
 * Sanitizes error messages for production to hide sensitive information
 * like database URLs, API keys, internal paths, etc.
 */

// Patterns that indicate sensitive information
const SENSITIVE_PATTERNS = [
  // Database URLs
  /postgres:\/\/[^\s]+/gi,
  /mysql:\/\/[^\s]+/gi,
  /mongodb(\+srv)?:\/\/[^\s]+/gi,
  /redis:\/\/[^\s]+/gi,
  
  // Cloud provider hostnames
  /[a-z0-9-]+\.neon\.tech[^\s]*/gi,
  /[a-z0-9-]+\.supabase\.co[^\s]*/gi,
  /[a-z0-9-]+\.planetscale\.com[^\s]*/gi,
  /[a-z0-9-]+\.aws\.com[^\s]*/gi,
  /[a-z0-9-]+\.amazonaws\.com[^\s]*/gi,
  /[a-z0-9-]+\.azure\.com[^\s]*/gi,
  /[a-z0-9-]+\.vercel\.app[^\s]*/gi,
  
  // IP addresses with ports
  /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+/g,
  
  // Connection strings
  /Can't reach database server at[^\n]+/gi,
  /Connection refused at[^\n]+/gi,
  /ECONNREFUSED[^\s]*/gi,
  
  // File paths
  /\/Users\/[^\s]+/g,
  /\/home\/[^\s]+/g,
  /C:\\[^\s]+/gi,
  
  // API keys and tokens (common patterns)
  /sk_live_[a-zA-Z0-9]+/g,
  /pk_live_[a-zA-Z0-9]+/g,
  /Bearer [a-zA-Z0-9._-]+/g,
  
  // Prisma-specific
  /Invalid `prisma\.[a-zA-Z.]+\(\)` invocation:/gi,
];

// Generic user-friendly messages for common error types
const ERROR_TYPE_MESSAGES: Record<string, string> = {
  database: "We're having trouble connecting to our servers. Please try again in a moment.",
  network: "Network connection issue. Please check your connection and try again.",
  auth: "Authentication error. Please try logging in again.",
  permission: "You don't have permission to perform this action.",
  validation: "Please check your input and try again.",
  server: "Something went wrong on our end. Please try again later.",
};

/**
 * Checks if an error message contains sensitive information
 */
function containsSensitiveInfo(message: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Determines the type of error for user-friendly messaging
 */
function getErrorType(message: string): keyof typeof ERROR_TYPE_MESSAGES {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("database") || lowerMessage.includes("prisma") || 
      lowerMessage.includes("connection") || lowerMessage.includes("postgres") ||
      lowerMessage.includes("sql") || lowerMessage.includes("query")) {
    return "database";
  }
  
  if (lowerMessage.includes("network") || lowerMessage.includes("fetch") ||
      lowerMessage.includes("timeout") || lowerMessage.includes("econnrefused")) {
    return "network";
  }
  
  if (lowerMessage.includes("auth") || lowerMessage.includes("unauthorized") ||
      lowerMessage.includes("token") || lowerMessage.includes("session")) {
    return "auth";
  }
  
  if (lowerMessage.includes("permission") || lowerMessage.includes("forbidden") ||
      lowerMessage.includes("access denied")) {
    return "permission";
  }
  
  if (lowerMessage.includes("validation") || lowerMessage.includes("invalid") ||
      lowerMessage.includes("required")) {
    return "validation";
  }
  
  return "server";
}

/**
 * Sanitizes an error message for safe display to users.
 * In production, replaces sensitive information with user-friendly messages.
 * In development, returns the original message for debugging.
 */
export function sanitizeErrorMessage(error: Error | string | unknown): string {
  const isDevelopment = process.env.NODE_ENV === "development";
  
  // Extract message from various error types
  let message: string;
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else {
    message = "An unexpected error occurred";
  }
  
  // In development, show full error for debugging
  if (isDevelopment) {
    return message;
  }
  
  // In production, sanitize sensitive information
  if (containsSensitiveInfo(message)) {
    const errorType = getErrorType(message);
    return ERROR_TYPE_MESSAGES[errorType];
  }
  
  // If no sensitive info detected, still check for overly technical messages
  if (message.length > 200 || message.includes("at ") || message.includes("Error:")) {
    const errorType = getErrorType(message);
    return ERROR_TYPE_MESSAGES[errorType];
  }
  
  return message;
}

/**
 * Gets a safe error message suitable for API responses
 */
export function getSafeApiErrorMessage(error: unknown): { message: string; code?: string } {
  const message = sanitizeErrorMessage(error);
  
  if (error instanceof Error && (error as Error & { code?: string }).code) {
    return { message, code: (error as Error & { code?: string }).code };
  }
  
  return { message };
}

export default sanitizeErrorMessage;
