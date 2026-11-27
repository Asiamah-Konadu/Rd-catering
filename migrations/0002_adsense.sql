-- Migration: Add AdSenseConfig singleton table for manual AdSense ad containers
CREATE TABLE IF NOT EXISTS "AdSenseConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "publisherId" TEXT NOT NULL DEFAULT '',
    "slotsJson" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL
);
