import { PrismaClient } from "@prisma/client";

const defaultDatabaseUrl =
  "postgres://6b83f1ecc19934a2ebc2ea0c7526d6896279df5fd2af9389cc45c1800622286f:sk_8ewmT_VI_AxJd2FANfCfY@db.prisma.io:5432/postgres?sslmode=require";

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.DATABASE_URL_POOLED ||
  process.env.POSTGRES_URL ||
  process.env.PRISMA_DATABASE_URL ||
  defaultDatabaseUrl;

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = dbUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
