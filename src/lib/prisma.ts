import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cache } from "react";

function getD1Binding() {
  try {
    const { env } = getCloudflareContext();
    if (env?.DB) return env.DB;
  } catch {
    // Outside the Workers runtime (for example during early metadata collection).
  }

  throw new Error(
    "Cloudflare D1 binding `DB` is not available. Bind the database in wrangler.jsonc and run the app with OpenNext (`npm run dev` / `npm run cf:preview` / `npm run cf:deploy`)."
  );
}

const createPrismaClient = cache(() => {
  return new PrismaClient({
    adapter: new PrismaD1(getD1Binding()),
    log: ["error", "warn"]
  });
});

// API route modules are imported while Next collects build metadata. Defer
// creating the D1 adapter until a handler actually uses Prisma.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = createPrismaClient();
    const value = Reflect.get(client, property, client) as unknown;
    return typeof value === "function" ? value.bind(client) : value;
  }
});
