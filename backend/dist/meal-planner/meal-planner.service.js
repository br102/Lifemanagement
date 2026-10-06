"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MealPlannerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let MealPlannerService = class MealPlannerService {
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
    }
    async getWeek(userId, weekStartDate) {
        const plan = await this.prisma.weekPlan.findUnique({ where: { userId_startDate: { userId, startDate: weekStartDate } }, include: { days: true } });
        if (!plan)
            return { id: weekStartDate, startDate: weekStartDate, days: [] };
        return { id: plan.id, startDate: plan.startDate, aiGenerated: plan.aiGenerated, days: plan.days.map((d) => ({ date: d.date, breakfast: d.breakfastId, lunch: d.lunchId, snack: d.snackId, proteinShake: d.proteinShakeId, dinner: d.dinnerId })) };
    }
    async getProfileSummary(userId) {
        const profile = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                displayName: true,
                weightKg: true,
                heightCm: true,
                age: true,
                sex: true,
                targetCalories: true,
                targetProtein: true,
                targetCarbs: true,
                targetFat: true,
                mealsPerDay: true,
            },
        });
        if (!profile)
            return undefined;
        return profile;
    }
    async upsertSlot(userId, weekStartDate, dto) {
        const plan = await this.prisma.weekPlan.upsert({ where: { userId_startDate: { userId, startDate: weekStartDate } }, create: { userId, startDate: weekStartDate }, update: {} });
        const existing = await this.prisma.dayPlan.findUnique({ where: { weekPlanId_date: { weekPlanId: plan.id, date: dto.date } } });
        const data = { breakfastId: existing?.breakfastId, lunchId: existing?.lunchId, snackId: existing?.snackId, proteinShakeId: existing?.proteinShakeId, dinnerId: existing?.dinnerId };
        const key = `${dto.slot}Id`;
        data[key] = dto.mealId ?? null;
        await this.prisma.dayPlan.upsert({ where: { weekPlanId_date: { weekPlanId: plan.id, date: dto.date } }, create: { weekPlanId: plan.id, date: dto.date, ...data }, update: data });
        return this.getWeek(userId, weekStartDate);
    }
    async aiGenerate(userId, dto) {
        const meals = await this.prisma.meal.findMany({ where: { userId }, include: { types: true, category: true } });
        if (!meals.length) {
            throw new Error('No meals found. Please add some meals to your catalog before generating a plan.');
        }
        const profile = await this.getProfileSummary(userId);
        try {
            const generated = await this.ai.generateWeekPlan({
                weekStartDate: dto.weekStartDate,
                meals: meals.map((m) => ({
                    id: m.id,
                    name: m.name,
                    types: m.types.map((t) => t.type),
                    category: m.category?.name ?? 'Healthy',
                    desiredFrequency: undefined,
                    score: undefined,
                })),
                profile,
                preferences: {
                    dietaryRestrictions: dto.dietaryRestrictions,
                    cuisinePreferences: dto.cuisinePreferences,
                    ingredientsToAvoid: dto.ingredientsToAvoid,
                    cookingLevel: dto.cookingLevel,
                    mealRepetition: dto.mealRepetition,
                    notes: dto.notes,
                },
            });
            if (!generated || typeof generated !== 'object' || !Object.keys(generated).length) {
                throw new Error('AI generated empty meal plan. Please try again.');
            }
            const plan = await this.prisma.weekPlan.upsert({ where: { userId_startDate: { userId, startDate: dto.weekStartDate } }, create: { userId, startDate: dto.weekStartDate, aiGenerated: true }, update: { aiGenerated: true } });
            for (const [date, slots] of Object.entries(generated)) {
                const breakfast = typeof slots?.breakfast === 'string' ? slots.breakfast : null;
                const lunch = typeof slots?.lunch === 'string' ? slots.lunch : null;
                const snack = typeof slots?.snack === 'string' ? slots.snack : null;
                const proteinShake = typeof slots?.proteinShake === 'string' ? slots.proteinShake : null;
                const dinner = typeof slots?.dinner === 'string' ? slots.dinner : null;
                await this.prisma.dayPlan.upsert({
                    where: { weekPlanId_date: { weekPlanId: plan.id, date } },
                    create: { weekPlanId: plan.id, date, breakfastId: breakfast, lunchId: lunch, snackId: snack, proteinShakeId: proteinShake, dinnerId: dinner },
                    update: { breakfastId: breakfast, lunchId: lunch, snackId: snack, proteinShakeId: proteinShake, dinnerId: dinner },
                });
            }
            return this.getWeek(userId, dto.weekStartDate);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to generate meal plan';
            throw new Error(`AI meal plan generation failed: ${message}`);
        }
    }
    async getMonth(userId, month) {
        const plans = await this.prisma.weekPlan.findMany({
            where: {
                userId,
                startDate: { gte: `${month}-01`, lte: `${month}-31` },
            },
            include: { days: true },
        });
        return {
            month,
            days: plans.flatMap((p) => p.days.map((d) => ({
                date: d.date,
                breakfast: d.breakfastId,
                lunch: d.lunchId,
                dinner: d.dinnerId,
            }))),
        };
    }
};
exports.MealPlannerService = MealPlannerService;
exports.MealPlannerService = MealPlannerService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('AI_PROVIDER')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], MealPlannerService);
//# sourceMappingURL=meal-planner.service.js.map