-- Migration: Add paidAt field to Order model
-- Run this manually or create a proper migration when DATABASE_URL is available

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP;
CREATE INDEX IF NOT EXISTS "Order_paidAt_idx" ON "Order"("paidAt");

