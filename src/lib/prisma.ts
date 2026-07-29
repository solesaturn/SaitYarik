import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function resolveDatabaseUrl() {
  const configured = process.env.DATABASE_URL;
  // On Vercel the filesystem is read-only except /tmp. Ship a seeded SQLite and copy it.
  if (process.env.VERCEL) {
    const seedDb = path.join(process.cwd(), "prisma", "seed.db");
    const runtimeDb = path.join("/tmp", "saityarik.db");
    if (fs.existsSync(seedDb)) {
      try {
        if (!fs.existsSync(runtimeDb) || fs.statSync(seedDb).mtimeMs > fs.statSync(runtimeDb).mtimeMs) {
          fs.copyFileSync(seedDb, runtimeDb);
        }
      } catch {
        try {
          fs.copyFileSync(seedDb, runtimeDb);
        } catch {
          /* ignore */
        }
      }
      return `file:${runtimeDb}`;
    }
  }
  return configured || "file:./dev.db";
}

process.env.DATABASE_URL = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
