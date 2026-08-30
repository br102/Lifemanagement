-- CreateTable
CREATE TABLE "TrainingExercise" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "muscleGroups" TEXT[],
    "equipment" TEXT,
    "difficulty" TEXT,
    "instructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingDay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingDayExercise" (
    "id" TEXT NOT NULL,
    "trainingDayId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "orderNo" INTEGER NOT NULL,
    "sets" INTEGER,
    "reps" INTEGER,
    "durationMin" INTEGER,
    "targetWeight" DOUBLE PRECISION,
    "intensity" TEXT,
    "notes" TEXT,

    CONSTRAINT "TrainingDayExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trainingDayId" TEXT,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "durationMin" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSessionExercise" (
    "id" TEXT NOT NULL,
    "workoutSessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "orderNo" INTEGER NOT NULL,
    "sets" INTEGER,
    "reps" INTEGER,
    "weight" DOUBLE PRECISION,
    "durationMin" INTEGER,
    "notes" TEXT,

    CONSTRAINT "WorkoutSessionExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingExercise_userId_name_idx" ON "TrainingExercise"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingDay_userId_date_key" ON "TrainingDay"("userId", "date");

-- CreateIndex
CREATE INDEX "TrainingDay_userId_date_idx" ON "TrainingDay"("userId", "date");

-- CreateIndex
CREATE INDEX "TrainingDayExercise_trainingDayId_orderNo_idx" ON "TrainingDayExercise"("trainingDayId", "orderNo");

-- CreateIndex
CREATE INDEX "WorkoutSession_userId_date_idx" ON "WorkoutSession"("userId", "date");

-- CreateIndex
CREATE INDEX "WorkoutSessionExercise_workoutSessionId_orderNo_idx" ON "WorkoutSessionExercise"("workoutSessionId", "orderNo");

-- AddForeignKey
ALTER TABLE "TrainingExercise" ADD CONSTRAINT "TrainingExercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingDay" ADD CONSTRAINT "TrainingDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingDayExercise" ADD CONSTRAINT "TrainingDayExercise_trainingDayId_fkey" FOREIGN KEY ("trainingDayId") REFERENCES "TrainingDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingDayExercise" ADD CONSTRAINT "TrainingDayExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "TrainingExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_trainingDayId_fkey" FOREIGN KEY ("trainingDayId") REFERENCES "TrainingDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSessionExercise" ADD CONSTRAINT "WorkoutSessionExercise_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSessionExercise" ADD CONSTRAINT "WorkoutSessionExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "TrainingExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
