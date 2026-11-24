import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
const outPath = path.resolve(process.cwd(), "migrations/0001_init.sql");
const remote = process.argv.includes("--remote");

fs.mkdirSync(path.dirname(outPath), { recursive: true });

console.log("Generating SQLite SQL from Prisma schema...");
const sql = execSync(
  `npx prisma migrate diff --from-empty --to-schema-datamodel "${schemaPath}" --script`,
  { encoding: "utf8", env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db" } }
);
fs.writeFileSync(outPath, sql);
console.log(`Wrote ${outPath}`);

const target = remote ? "--remote" : "--local";
console.log(`Applying schema to D1 (${remote ? "remote" : "local"})...`);
execSync(`npx wrangler d1 execute rd-catering ${target} --file="${outPath}"`, {
  stdio: "inherit",
});

console.log("Generating Prisma client...");
execSync("npx prisma generate", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db" },
});

console.log("D1 schema synced.");
