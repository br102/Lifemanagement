import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateLogEntryDto } from './dto/create-log-entry.dto';
import { LogFromMealDto } from './dto/log-from-meal.dto';
import { UpdateLogEntryDto } from './dto/update-log-entry.dto';
import { AiProvider, NutritionResult } from '../ai/ai-provider.interface';

export interface DailyNutritionSummary {
  date: string;
  entries: any[];
  totals: { calories: number; protein: number; carbs: number; fat: number };
  targets: { calories?: number; protein?: number; carbs?: number; fat?: number };
  remaining: { calories: number; protein: number; carbs: number; fat: number };
}

@Injectable()
export class NutritionLogService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('AI_PROVIDER') private readonly ai: AiProvider,
  ) {}

  async logFromMeal(userId: string, dto: LogFromMealDto) {
    const meal = await this.prisma.meal.findFirst({
      where: { id: dto.mealId, userId },
      include: { nutrition: true },
    });
    if (!meal || !meal.nutrition) throw new NotFoundException('Meal or nutrition not found');

    const quantity = dto.quantity ?? 1;
    const entry = await this.prisma.nutritionLogEntry.create({
      data: {
        userId,
        date: dto.date,
        mealId: dto.mealId,
        mealType: dto.mealType,
        label: meal.name,
        quantity,
        calories: Math.round(meal.nutrition.calories * quantity),
        protein: Math.round(meal.nutrition.protein * quantity),
        carbs: Math.round(meal.nutrition.carbs * quantity),
        fat: Math.round(meal.nutrition.fat * quantity),
        notes: dto.notes,
      },
    });

    return this.toFrontendEntry(entry);
  }

  async createCustom(userId: string, dto: CreateLogEntryDto) {
    let macros: NutritionResult | undefined;

    if (!Number.isFinite(dto.calories) || (dto.calories ?? 0) === 0) {
      macros = await this.ai.estimateNutrition(dto.label, []);
    }

    const entry = await this.prisma.nutritionLogEntry.create({
      data: {
        userId,
        date: dto.date,
        mealType: dto.mealType,
        label: dto.label,
        quantity: 1,
        calories: macros?.calories ?? dto.calories ?? 0,
        protein: macros?.protein ?? dto.protein ?? 0,
        carbs: macros?.carbs ?? dto.carbs ?? 0,
        fat: macros?.fat ?? dto.fat ?? 0,
      },
    });

    return this.toFrontendEntry(entry);
  }

  async update(userId: string, id: string, dto: UpdateLogEntryDto) {
    const existing = await this.prisma.nutritionLogEntry.findFirst({
      where: { id, userId },
      include: { meal: { include: { nutrition: true } } },
    });
    if (!existing) throw new NotFoundException('Entry not found');

    const updateData: Prisma.NutritionLogEntryUpdateInput = {};

    if (dto.label !== undefined) updateData.label = dto.label;
    if (dto.mealType !== undefined) updateData.mealType = dto.mealType;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    if (dto.quantity !== undefined && existing.mealId && existing.meal?.nutrition) {
      updateData.quantity = dto.quantity;
      updateData.calories = Math.round(existing.meal.nutrition.calories * dto.quantity);
      updateData.protein = Math.round(existing.meal.nutrition.protein * dto.quantity);
      updateData.carbs = Math.round(existing.meal.nutrition.carbs * dto.quantity);
      updateData.fat = Math.round(existing.meal.nutrition.fat * dto.quantity);
    } else {
      if (dto.calories !== undefined) updateData.calories = dto.calories;
      if (dto.protein !== undefined) updateData.protein = dto.protein;
      if (dto.carbs !== undefined) updateData.carbs = dto.carbs;
      if (dto.fat !== undefined) updateData.fat = dto.fat;
    }

    const updated = await this.prisma.nutritionLogEntry.update({
      where: { id },
      data: updateData,
    });

    return this.toFrontendEntry(updated);
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.nutritionLogEntry.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException('Entry not found');
    await this.prisma.nutritionLogEntry.delete({ where: { id } });
    return { success: true };
  }

  async getDay(userId: string, date: string): Promise<DailyNutritionSummary> {
    const [entries, user] = await Promise.all([
      this.prisma.nutritionLogEntry.findMany({
        where: { userId, date },
        orderBy: { loggedAt: 'asc' },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { targetCalories: true, targetProtein: true, targetCarbs: true, targetFat: true },
      }),
    ]);

    const totals = entries.reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        protein: acc.protein + e.protein,
        carbs: acc.carbs + e.carbs,
        fat: acc.fat + e.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const targets = {
      calories: user?.targetCalories ?? undefined,
      protein: user?.targetProtein ?? undefined,
      carbs: user?.targetCarbs ?? undefined,
      fat: user?.targetFat ?? undefined,
    };

    const remaining = {
      calories: (targets.calories ?? 0) - totals.calories,
      protein: (targets.protein ?? 0) - totals.protein,
      carbs: (targets.carbs ?? 0) - totals.carbs,
      fat: (targets.fat ?? 0) - totals.fat,
    };

    return {
      date,
      entries: entries.map(this.toFrontendEntry),
      totals,
      targets,
      remaining,
    };
  }

  async getRange(userId: string, from?: string, to?: string) {
    return this.prisma.nutritionLogEntry.findMany({
      where: {
        userId,
        ...this.dateRange(from, to),
      },
      orderBy: [{ date: 'desc' }, { loggedAt: 'asc' }],
    });
  }

  private dateRange(from?: string, to?: string) {
    if (!from && !to) return {};
    return { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } };
  }

  private toFrontendEntry = (entry: any) => ({
    id: entry.id,
    date: entry.date,
    mealId: entry.mealId ?? undefined,
    mealType: entry.mealType ?? undefined,
    label: entry.label,
    quantity: entry.quantity,
    calories: entry.calories,
    protein: entry.protein,
    carbs: entry.carbs,
    fat: entry.fat,
    notes: entry.notes ?? undefined,
    loggedAt: entry.loggedAt.toISOString(),
    createdAt: entry.createdAt.toISOString(),
  });
}
