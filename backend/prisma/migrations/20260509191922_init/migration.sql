-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'PROTEIN_SHAKE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "refreshTokenHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "categoryId" TEXT,
    "link" TEXT,
    "image" TEXT,
    "prepTime" INTEGER,
    "cookTime" INTEGER,
    "servings" INTEGER,
    "aiCategorized" BOOLEAN NOT NULL DEFAULT false,
    "aiNutrition" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MealCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MealTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealTagOnMeal" (
    "mealId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "MealTagOnMeal_pkey" PRIMARY KEY ("mealId","tagId")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealIngredient" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "MealIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealStep" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "orderNo" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "MealStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nutrition" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" INTEGER NOT NULL,
    "carbs" INTEGER NOT NULL,
    "fat" INTEGER NOT NULL,
    "fiber" INTEGER NOT NULL,
    "sugar" INTEGER NOT NULL,
    "sodium" INTEGER NOT NULL,

    CONSTRAINT "Nutrition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealTypeOnMeal" (
    "mealId" TEXT NOT NULL,
    "type" "MealType" NOT NULL,

    CONSTRAINT "MealTypeOnMeal_pkey" PRIMARY KEY ("mealId","type")
);

-- CreateTable
CREATE TABLE "WeekPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeekPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayPlan" (
    "id" TEXT NOT NULL,
    "weekPlanId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "breakfastId" TEXT,
    "lunchId" TEXT,
    "snackId" TEXT,
    "proteinShakeId" TEXT,
    "dinnerId" TEXT,

    CONSTRAINT "DayPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroceryList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekPlanId" TEXT NOT NULL,
    "weekStartDate" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroceryList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroceryItem" (
    "id" TEXT NOT NULL,
    "groceryListId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "estimatedExpirationDate" TEXT,
    "recommendedPurchaseDate" TEXT,
    "buyByDate" TEXT,
    "urgency" TEXT,
    "notes" TEXT,
    "forMeals" TEXT[],

    CONSTRAINT "GroceryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Meal_userId_createdAt_idx" ON "Meal"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MealCategory_name_key" ON "MealCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MealTag_name_key" ON "MealTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_name_key" ON "Ingredient"("name");

-- CreateIndex
CREATE INDEX "MealIngredient_mealId_idx" ON "MealIngredient"("mealId");

-- CreateIndex
CREATE INDEX "MealStep_mealId_orderNo_idx" ON "MealStep"("mealId", "orderNo");

-- CreateIndex
CREATE UNIQUE INDEX "Nutrition_mealId_key" ON "Nutrition"("mealId");

-- CreateIndex
CREATE UNIQUE INDEX "WeekPlan_userId_startDate_key" ON "WeekPlan"("userId", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "DayPlan_weekPlanId_date_key" ON "DayPlan"("weekPlanId", "date");

-- CreateIndex
CREATE INDEX "GroceryList_weekPlanId_idx" ON "GroceryList"("weekPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "GroceryList_userId_weekStartDate_key" ON "GroceryList"("userId", "weekStartDate");

-- CreateIndex
CREATE INDEX "GroceryItem_groceryListId_category_idx" ON "GroceryItem"("groceryListId", "category");

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MealCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealTagOnMeal" ADD CONSTRAINT "MealTagOnMeal_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealTagOnMeal" ADD CONSTRAINT "MealTagOnMeal_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "MealTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealIngredient" ADD CONSTRAINT "MealIngredient_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealIngredient" ADD CONSTRAINT "MealIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealStep" ADD CONSTRAINT "MealStep_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nutrition" ADD CONSTRAINT "Nutrition_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealTypeOnMeal" ADD CONSTRAINT "MealTypeOnMeal_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekPlan" ADD CONSTRAINT "WeekPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayPlan" ADD CONSTRAINT "DayPlan_weekPlanId_fkey" FOREIGN KEY ("weekPlanId") REFERENCES "WeekPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroceryList" ADD CONSTRAINT "GroceryList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroceryItem" ADD CONSTRAINT "GroceryItem_groceryListId_fkey" FOREIGN KEY ("groceryListId") REFERENCES "GroceryList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
