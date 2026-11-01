const { execSync } = require('child_process');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split(/\r?\n/);
const dbLine = lines.find(l => l.startsWith('DATABASE_URL='));

if (!dbLine) {
  console.error("Could not find DATABASE_URL in .env.local");
  process.exit(1);
}

const match = dbLine.match(/^DATABASE_URL="?([^"]+)"?$/);
const dbUrl = match ? match[1].trim() : dbLine.replace(/^DATABASE_URL=/, '').trim();
console.log("Database URL prefix:", dbUrl.substring(0, 25));

process.env.DATABASE_URL = dbUrl;

console.log("Running prisma db push...");
execSync('npx prisma db push', { stdio: 'inherit', env: process.env });

console.log("Running prisma generate...");
execSync('npx prisma generate', { stdio: 'inherit', env: process.env });

console.log("Done!");
