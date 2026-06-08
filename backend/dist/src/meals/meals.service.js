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
exports.MealsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let MealsService = class MealsService {
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
        this.defaultInclude = {
            category: true,
            ingredients: { include: { ingredient: true } },
            nutrition: true,
            steps: { orderBy: { orderNo: 'asc' } },
            tags: { include: { tag: true } },
            types: true,
        };
        this.toFrontendMeal = (meal) => ({
            id: meal.id,
            name: meal.name,
            score: meal.score,
            category: meal.category?.name ?? 'Healthy',
            types: meal.types.map((t) => {
                const typeMap = {
                    BREAKFAST: 'Breakfast',
                    LUNCH: 'Lunch',
                    DINNER: 'Dinner',
                    SNACK: 'Snack',
                    PROTEIN_SHAKE: 'Protein Shake',
                };
                return typeMap[t.type] ?? 'Dinner';
            }),
            ingredients: meal.ingredients.map((i) => ({ id: i.id, name: i.ingredient.name, amount: i.amount, unit: i.unit })),
            steps: meal.steps.map((s) => s.text),
            link: meal.link ?? undefined,
            nutritionalValue: meal.nutrition,
            image: meal.image ?? undefined,
            aiCategorized: meal.aiCategorized,
            aiNutrition: meal.aiNutrition,
            prepTime: meal.prepTime ?? undefined,
            cookTime: meal.cookTime ?? undefined,
            servings: meal.servings ?? undefined,
            tags: meal.tags.map((t) => t.tag.name),
            createdAt: meal.createdAt.toISOString(),
            updatedAt: meal.updatedAt.toISOString(),
        });
    }
    async findAll(userId, search, type) {
        const rows = await this.prisma.meal.findMany({
            where: {
                userId,
                ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
                ...(type ? { types: { some: { type: this.toMealType(type) } } } : {}),
            },
            include: this.defaultInclude,
            orderBy: { createdAt: 'desc' },
        });
        return rows.map(this.toFrontendMeal);
    }
    async create(userId, dto) {
        const hasCategory = typeof dto.category === 'string' && dto.category.trim().length > 0;
        const needsAiTags = !dto.tags || dto.tags.length === 0;
        const aiClassification = !hasCategory || needsAiTags
            ? await this.ai.classifyMeal(dto.name, dto.ingredients.map((i) => i.name))
            : null;
        const category = hasCategory
            ? dto.category.trim()
            : (aiClassification?.primaryCategory ?? 'General');
        const hasNutrition = Number.isFinite(dto.nutritionalValue?.calories) && Number(dto.nutritionalValue?.calories) > 0;
        const nutrition = hasNutrition
            ? dto.nutritionalValue
            : await this.ai.estimateNutrition(dto.name, dto.ingredients);
        const autoTags = aiClassification
            ? [
                ...aiClassification.categories,
                aiClassification.vegetarian ? 'vegetarian' : 'non-vegetarian',
                aiClassification.lactoseFree ? 'lactose-free' : 'contains-lactose',
            ]
            : [];
        const finalTags = Array.from(new Set([...(dto.tags ?? []), ...autoTags].map((tag) => tag.trim()).filter(Boolean)));
        const meal = await this.prisma.$transaction(async (tx) => {
            const categoryRow = await tx.mealCategory.upsert({ where: { name: category }, create: { name: category }, update: {} });
            const created = await tx.meal.create({
                data: {
                    userId,
                    name: dto.name,
                    score: dto.score,
                    categoryId: categoryRow.id,
                    link: dto.link,
                    image: dto.image,
                    prepTime: dto.prepTime,
                    cookTime: dto.cookTime,
                    servings: dto.servings,
                    aiCategorized: !hasCategory,
                    aiNutrition: !hasNutrition,
                },
                include: this.defaultInclude,
            });
            await tx.nutrition.create({ data: { mealId: created.id, ...nutrition } });
            for (const t of dto.types)
                await tx.mealTypeOnMeal.create({ data: { mealId: created.id, type: this.toMealType(t) } });
            for (const [index, step] of dto.steps.entries())
                await tx.mealStep.create({ data: { mealId: created.id, orderNo: index + 1, text: step } });
            for (const ing of dto.ingredients) {
                const ingredient = await tx.ingredient.upsert({ where: { name: ing.name }, create: { name: ing.name }, update: {} });
                await tx.mealIngredient.create({ data: { mealId: created.id, ingredientId: ingredient.id, amount: ing.amount, unit: ing.unit } });
            }
            for (const tag of finalTags) {
                const tagRow = await tx.mealTag.upsert({ where: { name: tag }, create: { name: tag }, update: {} });
                await tx.mealTagOnMeal.create({ data: { mealId: created.id, tagId: tagRow.id } });
            }
            return tx.meal.findUniqueOrThrow({ where: { id: created.id }, include: this.defaultInclude });
        });
        return this.toFrontendMeal(meal);
    }
    async aiCategorize(name, ingredients) {
        return this.ai.classifyMeal(name, ingredients);
    }
    async aiNutrition(name, ingredients) {
        return this.ai.estimateNutrition(name, ingredients);
    }
    async update(userId, id, dto) {
        const existing = await this.prisma.meal.findFirst({ where: { id, userId } });
        if (!existing)
            throw new common_1.NotFoundException('Meal not found');
        await this.prisma.meal.update({ where: { id }, data: { name: dto.name, score: dto.score, link: dto.link, image: dto.image, prepTime: dto.prepTime, cookTime: dto.cookTime, servings: dto.servings } });
        return this.findById(userId, id);
    }
    async findById(userId, id) {
        const meal = await this.prisma.meal.findFirst({ where: { id, userId }, include: this.defaultInclude });
        if (!meal)
            throw new common_1.NotFoundException('Meal not found');
        return this.toFrontendMeal(meal);
    }
    async remove(userId, id) {
        const exists = await this.prisma.meal.findFirst({ where: { id, userId } });
        if (!exists)
            throw new common_1.NotFoundException('Meal not found');
        await this.prisma.meal.delete({ where: { id } });
        return { success: true };
    }
    toMealType(type) {
        const map = { Breakfast: 'BREAKFAST', Lunch: 'LUNCH', Dinner: 'DINNER', Snack: 'SNACK', 'Protein Shake': 'PROTEIN_SHAKE' };
        return map[type] ?? 'DINNER';
    }
};
exports.MealsService = MealsService;
exports.MealsService = MealsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('AI_PROVIDER')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], MealsService);
//# sourceMappingURL=meals.service.js.map