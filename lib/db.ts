// lib/db.ts
// Cliente Prisma singleton — garante que só existe UMA instância
// em desenvolvimento (onde o hot reload cria módulos novos toda hora).
// Em produção, só roda uma vez então não tem problema.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;