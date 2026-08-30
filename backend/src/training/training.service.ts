import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateTrainingExerciseDto } from './dto/create-training-exercise.dto';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { UpdateTrainingExerciseDto } from './dto/update-training-exercise.dto';
import { UpsertTrainingDayDto } from './dto/upsert-training-day.dto';

@Injectable()
export class TrainingService {
  constructor(private readonly prisma: PrismaService) {}

  async findExercises(userId: string, search?: string) {
    const rows = await this.prisma.trainingExercise.findMany({
      where: {
        userId,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: [{ name: 'asc' }],
    });
    return rows.map(this.toExercise);
  }

  async createExercise(userId: string, dto: CreateTrainingExerciseDto) {
    const row = await this.prisma.trainingExercise.create({
      data: {
        userId,
        name: dto.name,
        category: dto.category,
        muscleGroups: dto.muscleGroups,
        equipment: dto.equipment,
        difficulty: dto.difficulty,
        instructions: dto.instructions,
      },
    });
    return this.toExercise(row);
  }

  async updateExercise(userId: string, id: string, dto: UpdateTrainingExerciseDto) {
    const existing = await this.prisma.trainingExercise.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Exercise not found');
    const row = await this.prisma.trainingExercise.update({
      where: { id },
      data: {
        name: dto.name,
        category: dto.category,
        muscleGroups: dto.muscleGroups,
        equipment: dto.equipment,
        difficulty: dto.difficulty,
        instructions: dto.instructions,
      },
    });
    return this.toExercise(row);
  }

  async removeExercise(userId: string, id: string) {
    const existing = await this.prisma.trainingExercise.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Exercise not found');
    await this.prisma.trainingExercise.delete({ where: { id } });
    return { success: true };
  }

  async getSchedule(userId: string, from?: string, to?: string) {
    const rows = await this.prisma.trainingDay.findMany({
      where: { userId, ...this.dateRange(from, to) },
      include: this.trainingDayInclude,
      orderBy: { date: 'asc' },
    });
    return rows.map(this.toTrainingDay);
  }

  async upsertTrainingDay(userId: string, dto: UpsertTrainingDayDto) {
    await this.assertExerciseOwnership(userId, dto.exercises.map((item) => item.exerciseId));

    const row = await this.prisma.$transaction(async (tx) => {
      const day = await tx.trainingDay.upsert({
        where: { userId_date: { userId, date: dto.date } },
        create: { userId, date: dto.date, status: dto.status ?? 'planned', notes: dto.notes },
        update: { status: dto.status ?? 'planned', notes: dto.notes },
      });
      await tx.trainingDayExercise.deleteMany({ where: { trainingDayId: day.id } });
      for (const [index, item] of dto.exercises.entries()) {
        await tx.trainingDayExercise.create({
          data: {
            trainingDayId: day.id,
            exerciseId: item.exerciseId,
            orderNo: index + 1,
            sets: item.sets,
            reps: item.reps,
            durationMin: item.durationMin,
            targetWeight: item.targetWeight,
            intensity: item.intensity,
            notes: item.notes,
          },
        });
      }
      return tx.trainingDay.findUniqueOrThrow({ where: { id: day.id }, include: this.trainingDayInclude });
    });

    return this.toTrainingDay(row);
  }

  async removeTrainingDay(userId: string, date: string) {
    const existing = await this.prisma.trainingDay.findUnique({ where: { userId_date: { userId, date } } });
    if (!existing) throw new NotFoundException('Training day not found');
    await this.prisma.trainingDay.delete({ where: { id: existing.id } });
    return { success: true };
  }

  async getSessions(userId: string, from?: string, to?: string) {
    const rows = await this.prisma.workoutSession.findMany({
      where: { userId, ...this.dateRange(from, to) },
      include: this.workoutSessionInclude,
      orderBy: { date: 'desc' },
    });
    return rows.map(this.toWorkoutSession);
  }

  async createSession(userId: string, dto: CreateWorkoutSessionDto) {
    await this.assertExerciseOwnership(userId, dto.exercises.map((item) => item.exerciseId));
    if (dto.trainingDayId) {
      const day = await this.prisma.trainingDay.findFirst({ where: { id: dto.trainingDayId, userId } });
      if (!day) throw new NotFoundException('Training day not found');
    }

    const row = await this.prisma.$transaction(async (tx) => {
      const session = await tx.workoutSession.create({
        data: {
          userId,
          trainingDayId: dto.trainingDayId,
          date: dto.date,
          status: dto.status ?? 'completed',
          durationMin: dto.durationMin,
          notes: dto.notes,
        },
      });
      if (dto.trainingDayId) {
        await tx.trainingDay.update({ where: { id: dto.trainingDayId }, data: { status: dto.status ?? 'completed' } });
      }
      for (const [index, item] of dto.exercises.entries()) {
        await tx.workoutSessionExercise.create({
          data: {
            workoutSessionId: session.id,
            exerciseId: item.exerciseId,
            orderNo: index + 1,
            sets: item.sets,
            reps: item.reps,
            weight: item.weight,
            durationMin: item.durationMin,
            notes: item.notes,
          },
        });
      }
      return tx.workoutSession.findUniqueOrThrow({ where: { id: session.id }, include: this.workoutSessionInclude });
    });

    return this.toWorkoutSession(row);
  }

  async getBalance(userId: string, from?: string, to?: string) {
    const [schedule, sessions] = await Promise.all([
      this.getSchedule(userId, from, to),
      this.getSessions(userId, from, to),
    ]);
    const plannedMuscles = new Map<string, number>();
    const completedMuscles = new Map<string, number>();
    const categoryCounts = new Map<string, number>();

    for (const day of schedule) {
      for (const item of day.exercises) {
        categoryCounts.set(item.exercise.category, (categoryCounts.get(item.exercise.category) ?? 0) + 1);
        for (const muscle of item.exercise.muscleGroups) plannedMuscles.set(muscle, (plannedMuscles.get(muscle) ?? 0) + 1);
      }
    }
    for (const session of sessions.filter((item) => item.status === 'completed')) {
      for (const item of session.exercises) {
        for (const muscle of item.exercise.muscleGroups) completedMuscles.set(muscle, (completedMuscles.get(muscle) ?? 0) + 1);
      }
    }

    const warnings: string[] = [];
    if (schedule.length > 0 && sessions.filter((item) => item.status === 'completed').length === 0) warnings.push('No completed workouts logged for this range.');
    if ((categoryCounts.get('mobility') ?? 0) === 0) warnings.push('No mobility work planned.');
    if ((categoryCounts.get('cardio') ?? 0) === 0) warnings.push('No cardio work planned.');
    const mostLoaded = [...plannedMuscles.entries()].sort((a, b) => b[1] - a[1])[0];
    if (mostLoaded && mostLoaded[1] >= 4) warnings.push(`${mostLoaded[0]} appears frequently in this range.`);

    return {
      from,
      to,
      plannedWorkouts: schedule.length,
      completedWorkouts: sessions.filter((item) => item.status === 'completed').length,
      skippedWorkouts: schedule.filter((item) => item.status === 'skipped').length,
      totalLoggedMinutes: sessions.reduce((sum, item) => sum + (item.durationMin ?? 0), 0),
      plannedMuscleGroups: Object.fromEntries(plannedMuscles),
      completedMuscleGroups: Object.fromEntries(completedMuscles),
      categoryDistribution: Object.fromEntries(categoryCounts),
      warnings,
    };
  }

  private async assertExerciseOwnership(userId: string, exerciseIds: string[]) {
    const uniqueIds = Array.from(new Set(exerciseIds));
    if (uniqueIds.length === 0) return;
    const count = await this.prisma.trainingExercise.count({ where: { userId, id: { in: uniqueIds } } });
    if (count !== uniqueIds.length) throw new NotFoundException('Exercise not found');
  }

  private dateRange(from?: string, to?: string) {
    if (!from && !to) return {};
    return { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } };
  }

  private readonly trainingDayInclude = {
    exercises: { include: { exercise: true }, orderBy: { orderNo: 'asc' } },
  } satisfies Prisma.TrainingDayInclude;

  private readonly workoutSessionInclude = {
    exercises: { include: { exercise: true }, orderBy: { orderNo: 'asc' } },
  } satisfies Prisma.WorkoutSessionInclude;

  private toExercise = (exercise: any) => ({
    id: exercise.id,
    name: exercise.name,
    category: exercise.category,
    muscleGroups: exercise.muscleGroups,
    equipment: exercise.equipment ?? undefined,
    difficulty: exercise.difficulty ?? undefined,
    instructions: exercise.instructions ?? undefined,
    createdAt: exercise.createdAt.toISOString(),
    updatedAt: exercise.updatedAt.toISOString(),
  });

  private toTrainingDay = (day: any) => ({
    id: day.id,
    date: day.date,
    status: day.status,
    notes: day.notes ?? undefined,
    exercises: day.exercises.map((item: any) => ({
      id: item.id,
      exerciseId: item.exerciseId,
      sets: item.sets ?? undefined,
      reps: item.reps ?? undefined,
      durationMin: item.durationMin ?? undefined,
      targetWeight: item.targetWeight ?? undefined,
      intensity: item.intensity ?? undefined,
      notes: item.notes ?? undefined,
      exercise: this.toExercise(item.exercise),
    })),
  });

  private toWorkoutSession = (session: any) => ({
    id: session.id,
    trainingDayId: session.trainingDayId ?? undefined,
    date: session.date,
    status: session.status,
    durationMin: session.durationMin ?? undefined,
    notes: session.notes ?? undefined,
    exercises: session.exercises.map((item: any) => ({
      id: item.id,
      exerciseId: item.exerciseId,
      sets: item.sets ?? undefined,
      reps: item.reps ?? undefined,
      weight: item.weight ?? undefined,
      durationMin: item.durationMin ?? undefined,
      notes: item.notes ?? undefined,
      exercise: this.toExercise(item.exercise),
    })),
    createdAt: session.createdAt.toISOString(),
  });
}
