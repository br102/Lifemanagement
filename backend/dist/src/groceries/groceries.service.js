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
exports.GroceriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let GroceriesService = class GroceriesService {
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
    }
    async getByWeek(userId, weekStartDate) {
        const list = await this.prisma.groceryList.findUnique({ where: { userId_weekStartDate: { userId, weekStartDate } }, include: { items: true } });
        return list ? this.mapList(list) : null;
    }
    async toggleItem(userId, listId, itemId) {
        const list = await this.prisma.groceryList.findFirst({ where: { id: listId, userId } });
        if (!list)
            throw new common_1.BadRequestException('List not found');
        const item = await this.prisma.groceryItem.findUniqueOrThrow({ where: { id: itemId } });
        await this.prisma.groceryItem.update({ where: { id: itemId }, data: { checked: !item.checked } });
        return this.getByWeek(userId, list.weekStartDate);
    }
    async generateFromWeekPlan(userId, weekStartDate) {
        const plan = await this.prisma.weekPlan.findUnique({ where: { userId_startDate: { userId, startDate: weekStartDate } }, include: { days: true } });
        if (!plan)
            throw new common_1.BadRequestException('No week plan found');
        const mealIds = Array.from(new Set(plan.days.flatMap((d) => [d.breakfastId, d.lunchId, d.snackId, d.proteinShakeId, d.dinnerId].filter(Boolean))));
        const meals = await this.prisma.meal.findMany({ where: { id: { in: mealIds } }, include: { ingredients: { include: { ingredient: true } } } });
        const accumulator = new Map();
        meals.forEach((m) => {
            m.ingredients.forEach((ing) => {
                const key = ing.ingredient.name.toLowerCase();
                const prev = accumulator.get(key);
                if (prev)
                    prev.forMeals.push(m.name);
                else
                    accumulator.set(key, { quantity: Number(ing.amount) || 1, unit: ing.unit, category: 'Pantry & Spices', forMeals: [m.name] });
            });
        });
        const items = Array.from(accumulator.entries()).map(([name, value]) => ({ name, category: value.category }));
        const meta = await this.ai.suggestGroceryMeta(items);
        const list = await this.prisma.groceryList.upsert({
            where: { userId_weekStartDate: { userId, weekStartDate } },
            create: { userId, weekPlanId: plan.id, weekStartDate },
            update: { generatedAt: new Date(), items: { deleteMany: {} } },
            include: { items: true },
        });
        await this.prisma.groceryItem.createMany({
            data: Array.from(accumulator.entries()).map(([name, value]) => {
                const suggestion = meta.find((m) => m.itemName.toLowerCase() === name.toLowerCase());
                return {
                    groceryListId: list.id,
                    name: name[0].toUpperCase() + name.slice(1),
                    quantity: value.quantity,
                    unit: value.unit,
                    category: suggestion?.category ?? value.category,
                    checked: false,
                    recommendedPurchaseDate: suggestion?.recommendedPurchaseDate,
                    estimatedExpirationDate: suggestion?.estimatedExpirationDate,
                    forMeals: [...new Set(value.forMeals)],
                };
            }),
        });
        return this.getByWeek(userId, weekStartDate);
    }
    mapList(list) {
        return {
            id: list.id,
            weekPlanId: list.weekPlanId,
            weekStartDate: list.weekStartDate,
            generatedAt: list.generatedAt.toISOString(),
            items: list.items.map((i) => ({
                id: i.id,
                name: i.name,
                quantity: i.quantity,
                unit: i.unit,
                category: i.category,
                estimatedExpirationDate: i.estimatedExpirationDate,
                recommendedPurchaseDate: i.recommendedPurchaseDate,
                buyByDate: i.buyByDate,
                checked: i.checked,
                urgency: i.urgency,
                notes: i.notes,
                forMeals: i.forMeals,
            })),
        };
    }
};
exports.GroceriesService = GroceriesService;
exports.GroceriesService = GroceriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('AI_PROVIDER')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], GroceriesService);
//# sourceMappingURL=groceries.service.js.map