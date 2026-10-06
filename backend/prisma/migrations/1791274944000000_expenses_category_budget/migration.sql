-- Add category column to Ingredient table
ALTER TABLE "Ingredient" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'Other';

-- Create MonthlyBudget table
CREATE TABLE "MonthlyBudget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amountLimit" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PLN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MonthlyBudget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- Create unique index for MonthlyBudget
CREATE UNIQUE INDEX "MonthlyBudget_userId_month_category_key" ON "MonthlyBudget"("userId", "month", "category");

-- Create index for queries
CREATE INDEX "MonthlyBudget_userId_month_idx" ON "MonthlyBudget"("userId", "month");
