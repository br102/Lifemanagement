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
exports.NutritionLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let NutritionLogService = class NutritionLogService {
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
        this.toFrontendEntry = (entry) => ({
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
    async logFromMeal(userId, dto) {
        const meal = await this.prisma.meal.findFirst({
            where: { id: dto.mealId, userId },
            include: { nutrition: true },
        });
        if (!meal || !meal.nutrition)
            throw new common_1.NotFoundException('Meal or nutrition not found');
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
    async createCustom(userId, dto) {
        let macros;
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
    async update(userId, id, dto) {
        const existing = await this.prisma.nutritionLogEntry.findFirst({
            where: { id, userId },
            include: { meal: { include: { nutrition: true } } },
        });
        if (!existing)
            throw new common_1.NotFoundException('Entry not found');
        const updateData = {};
        if (dto.label !== undefined)
            updateData.label = dto.label;
        if (dto.mealType !== undefined)
            updateData.mealType = dto.mealType;
        if (dto.notes !== undefined)
            updateData.notes = dto.notes;
        if (dto.quantity !== undefined && existing.mealId && existing.meal?.nutrition) {
            updateData.quantity = dto.quantity;
            updateData.calories = Math.round(existing.meal.nutrition.calories * dto.quantity);
            updateData.protein = Math.round(existing.meal.nutrition.protein * dto.quantity);
            updateData.carbs = Math.round(existing.meal.nutrition.carbs * dto.quantity);
            updateData.fat = Math.round(existing.meal.nutrition.fat * dto.quantity);
        }
        else {
            if (dto.calories !== undefined)
                updateData.calories = dto.calories;
            if (dto.protein !== undefined)
                updateData.protein = dto.protein;
            if (dto.carbs !== undefined)
                updateData.carbs = dto.carbs;
            if (dto.fat !== undefined)
                updateData.fat = dto.fat;
        }
        const updated = await this.prisma.nutritionLogEntry.update({
            where: { id },
            data: updateData,
        });
        return this.toFrontendEntry(updated);
    }
    async remove(userId, id) {
        const existing = await this.prisma.nutritionLogEntry.findFirst({
            where: { id, userId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Entry not found');
        await this.prisma.nutritionLogEntry.delete({ where: { id } });
        return { success: true };
    }
    async getDay(userId, date) {
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
        const totals = entries.reduce((acc, e) => ({
            calories: acc.calories + e.calories,
            protein: acc.protein + e.protein,
            carbs: acc.carbs + e.carbs,
            fat: acc.fat + e.fat,
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
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
    async getRange(userId, from, to) {
        return this.prisma.nutritionLogEntry.findMany({
            where: {
                userId,
                ...this.dateRange(from, to),
            },
            orderBy: [{ date: 'desc' }, { loggedAt: 'asc' }],
        });
    }
    dateRange(from, to) {
        if (!from && !to)
            return {};
        return { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } };
    }
};
exports.NutritionLogService = NutritionLogService;
exports.NutritionLogService = NutritionLogService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('AI_PROVIDER')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], NutritionLogService);
//# sourceMappingURL=nutrition-log.service.js.map