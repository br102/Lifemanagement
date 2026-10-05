-- CreateTable
CREATE TABLE "NutritionLogEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "mealId" TEXT,
    "mealType" TEXT,
    "label" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "calories" INTEGER NOT NULL,
    "protein" INTEGER NOT NULL,
    "carbs" INTEGER NOT NULL,
    "fat" INTEGER NOT NULL,
    "notes" TEXT,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NutritionLogEntry_userId_date_idx" ON "NutritionLogEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "NutritionLogEntry_date_idx" ON "NutritionLogEntry"("date");

-- AddForeignKey
ALTER TABLE "NutritionLogEntry" ADD CONSTRAINT "NutritionLogEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionLogEntry" ADD CONSTRAINT "NutritionLogEntry_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
