import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Prisma client with connection pool settings for serverless
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Use singleton pattern to prevent connection leaks
export const client = globalThis.prisma ?? prismaClientSingleton();

// In development, attach to global to survive hot-reload
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = client;
}

// Graceful shutdown handler for serverless
// Only add listener once to prevent memory leak warning during hot-reload
declare global {
  var prismaShutdownRegistered: boolean | undefined;
}

if (!globalThis.prismaShutdownRegistered) {
  globalThis.prismaShutdownRegistered = true;
  
  const handleShutdown = async () => {
    await client.$disconnect();
  };
  
  process.on("beforeExit", handleShutdown);
}

/**
 * Wrapper to handle connection errors and retry
 * Use this for critical database operations
 */
export async function withDbRetry<T>(
  operation: () => Promise<T>,
  retries = 2
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const isConnectionError =
        error?.message?.includes("Connection") ||
        error?.code === "P1001" ||
        error?.code === "P1002" ||
        error?.code === "P1017";

      if (isConnectionError && attempt < retries) {
        console.warn(`DB connection error, retrying (${attempt + 1}/${retries})...`);
        // Reconnect
        await client.$disconnect();
        await client.$connect();
        continue;
      }
      throw error;
    }
  }
  throw new Error("Database operation failed after retries");
}
