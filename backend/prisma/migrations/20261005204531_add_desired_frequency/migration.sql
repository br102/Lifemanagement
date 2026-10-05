-- CreateEnum
CREATE TYPE "DesiredFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'OCCASIONAL', 'SPECIAL');

-- AlterTable
ALTER TABLE "Meal" ADD COLUMN "desiredFrequency" "DesiredFrequency" NOT NULL DEFAULT 'WEEKLY';
