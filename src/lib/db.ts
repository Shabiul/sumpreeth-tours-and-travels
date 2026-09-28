import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Cached in every environment, not just dev — a warm serverless function
// instance (Vercel) reuses this across requests instead of opening a fresh
// pooled DB connection on every single admin page load.
globalForPrisma.prisma = prisma;
