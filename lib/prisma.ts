import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const prisma = new PrismaClient({ accelerateUrl: databaseUrl });

export { prisma };
export default prisma;
