import { PrismaClient } from "../generated/prisma/client";

// Attach to globalThis so the singleton survives hot-reloads in dev and is
// reused across concurrent requests within the same Fluid Compute instance.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }
  return new PrismaClient({ accelerateUrl: databaseUrl });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createClient();
globalForPrisma.prisma = prisma;

export default prisma;
