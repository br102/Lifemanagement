import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpsertSlotDto } from './dto/upsert-slot.dto';
import { AiProvider } from '../ai/ai-provider.interface';

@Injectable()
export class MealPlannerService {
  constructor(private readonly prisma: PrismaService, @Inject('AI_PROVIDER') private readonly ai: AiProvider) {}

  async getWeek(userId: string, weekStartDate: string) {
    const plan = await this.prisma.weekPlan.findUnique({ where: { userId_startDate: { userId, startDate: weekStartDate } }, include: { days: true } });
    if (!plan) return { id: weekStartDate, startDate: weekStartDate, days: [] };
    return { id: plan.id, startDate: plan.startDate, aiGenerated: plan.aiGenerated, days: plan.days.map((d) => ({ date: d.date, breakfast: d.breakfastId, lunch: d.lunchId, snack: d.snackId, proteinShake: d.proteinShakeId, dinner: d.dinnerId })) };
  }

  private async getProfileSummary(userId: string) {
    const profile = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        displayName: true,
        weightKg: true,
        heightCm: true,
        age: true,
        sex: true,
        activityLevel: true,
        fitnessGoal: true,
        goalNotes: true,
        dietaryPreferences: true,
        allergies: true,
        dislikes: true,
        targetCalories: true,
        targetProtein: true,
        targetCarbs: true,
        targetFat: true,
        mealsPerDay: true,
      },
    });
    if (!profile) return undefined;
    return profile;
  }

  async upsertSlot(userId: string, weekStartDate: string, dto: UpsertSlotDto) {
    const plan = await this.prisma.weekPlan.upsert({ where: { userId_startDate: { userId, startDate: weekStartDate } }, create: { userId, startDate: weekStartDate }, update: {} });
    const existing = await this.prisma.dayPlan.findUnique({ where: { weekPlanId_date: { weekPlanId: plan.id, date: dto.date } } });
    const data: any = { breakfastId: existing?.breakfastId, lunchId: existing?.lunchId, snackId: existing?.snackId, proteinShakeId: existing?.proteinShakeId, dinnerId: existing?.dinnerId };
    const key = `${dto.slot}Id`;
    data[key] = dto.mealId ?? null;
    await this.prisma.dayPlan.upsert({ where: { weekPlanId_date: { weekPlanId: plan.id, date: dto.date } }, create: { weekPlanId: plan.id, date: dto.date, ...data }, update: data });
    return this.getWeek(userId, weekStartDate);
  }

  async aiGenerate(userId: string, weekStartDate: string) {
    const meals = await this.prisma.meal.findMany({ where: { userId }, include: { types: true, category: true } });
    const profile = await this.getProfileSummary(userId);
    const generated = await this.ai.generateWeekPlan({
      weekStartDate,
      meals: meals.map((m) => ({
        id: m.id,
        name: m.name,
        types: m.types.map((t) => t.type),
        category: m.category?.name ?? 'Healthy',
      })),
      profile,
    });
    const plan = await this.prisma.weekPlan.upsert({ where: { userId_startDate: { userId, startDate: weekStartDate } }, create: { userId, startDate: weekStartDate, aiGenerated: true }, update: { aiGenerated: true } });
    for (const [date, slots] of Object.entries(generated)) {
      await this.prisma.dayPlan.upsert({ where: { weekPlanId_date: { weekPlanId: plan.id, date } }, create: { weekPlanId: plan.id, date, breakfastId: slots.breakfast, lunchId: slots.lunch, snackId: slots.snack, proteinShakeId: slots.proteinShake, dinnerId: slots.dinner }, update: { breakfastId: slots.breakfast, lunchId: slots.lunch, snackId: slots.snack, proteinShakeId: slots.proteinShake, dinnerId: slots.dinner } });
    }
    return this.getWeek(userId, weekStartDate);
  }

  async getMonth(userId: string, month: string) {
    const plans = await this.prisma.weekPlan.findMany({
      where: {
        userId,
        startDate: { gte: `${month}-01`, lte: `${month}-31` },
      },
      include: { days: true },
    });

    return {
      month,
      days: plans.flatMap((p) =>
        p.days.map((d) => ({
          date: d.date,
          breakfast: d.breakfastId,
          lunch: d.lunchId,
          dinner: d.dinnerId,
        })),
      ),
    };
  }
}
