-- Drop fitness/dietary preference fields; profile now purely body stats + nutrient goals
ALTER TABLE "User" DROP COLUMN "fitnessGoal";
ALTER TABLE "User" DROP COLUMN "activityLevel";
ALTER TABLE "User" DROP COLUMN "goalNotes";
ALTER TABLE "User" DROP COLUMN "dietaryPreferences";
ALTER TABLE "User" DROP COLUMN "allergies";
ALTER TABLE "User" DROP COLUMN "dislikes";
