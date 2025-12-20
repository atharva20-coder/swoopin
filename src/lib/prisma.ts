import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Create Prisma client with connection logging for debugging
export const client = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

// For development, store client globally to prevent hot-reload issues
if (process.env.NODE_ENV !== "production") globalThis.prisma = client;

// Test connection on startup (helps wake up serverless databases)
client.$connect().catch((err: Error) => {
  console.error("Failed to connect to database:", err.message);
});
