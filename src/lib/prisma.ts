import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    try {
      // When deployed or executing in Cloudflare Workers, env bindings may be accessible via OpenNext context
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getCloudflareContext } = require("@opennextjs/cloudflare");
      const ctx = getCloudflareContext();
      if (ctx?.env?.DATABASE_URL) {
        connectionString = ctx.env.DATABASE_URL;
      }
    } catch {
      // Outside Cloudflare context or during early metadata collection
    }
  }

  if (!connectionString) throw new Error("DATABASE_URL is not configured.");

  const client = new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
    log: ["error", "warn"]
  });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

// API route modules are imported while Next collects build metadata. Defer
// creating the database adapter until a handler actually uses Prisma so builds
// do not need production secrets in their environment.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, client) as unknown;
    return typeof value === "function" ? value.bind(client) : value;
  }
});
