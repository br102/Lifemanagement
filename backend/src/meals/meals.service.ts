import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Prisma, MealType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { AiProvider, MealDraftSuggestion } from '../ai/ai-provider.interface';

@Injectable()
export class MealsService {
  constructor(private readonly prisma: PrismaService, @Inject('AI_PROVIDER') private readonly ai: AiProvider) {}

  async findAll(userId: string, search?: string, type?: string) {
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

  async create(userId: string, dto: CreateMealDto) {
    const hasCategory = typeof dto.category === 'string' && dto.category.trim().length > 0;
    const needsAiTags = !dto.tags || dto.tags.length === 0;
    const aiClassification = !hasCategory || needsAiTags
      ? await this.ai.classifyMeal(dto.name, dto.ingredients.map((i) => i.name))
      : null;
    const category = hasCategory
      ? dto.category!.trim()
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
      for (const t of dto.types) await tx.mealTypeOnMeal.create({ data: { mealId: created.id, type: this.toMealType(t) } });
      for (const [index, step] of dto.steps.entries()) await tx.mealStep.create({ data: { mealId: created.id, orderNo: index + 1, text: step } });
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

  async aiCategorize(name: string, ingredients: string[]) {
    return this.ai.classifyMeal(name, ingredients);
  }

  async aiNutrition(name: string, ingredients: Array<{ name: string; amount: string; unit: string }>) {
    return this.ai.estimateNutrition(name, ingredients);
  }

  async aiDraftFromLink(link: string): Promise<MealDraftSuggestion> {
    return this.ai.draftMealFromLink(link);
  }

  async update(userId: string, id: string, dto: UpdateMealDto) {
    const existing = await this.prisma.meal.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Meal not found');
    await this.prisma.meal.update({ where: { id }, data: { name: dto.name, score: dto.score, link: dto.link, image: dto.image, prepTime: dto.prepTime, cookTime: dto.cookTime, servings: dto.servings } });
    return this.findById(userId, id);
  }

  async findById(userId: string, id: string) {
    const meal = await this.prisma.meal.findFirst({ where: { id, userId }, include: this.defaultInclude });
    if (!meal) throw new NotFoundException('Meal not found');
    return this.toFrontendMeal(meal);
  }

  async remove(userId: string, id: string) {
    const exists = await this.prisma.meal.findFirst({ where: { id, userId } });
    if (!exists) throw new NotFoundException('Meal not found');
    await this.prisma.meal.delete({ where: { id } });
    return { success: true };
  }

  private readonly defaultInclude = {
    category: true,
    ingredients: { include: { ingredient: true } },
    nutrition: true,
    steps: { orderBy: { orderNo: 'asc' } },
    tags: { include: { tag: true } },
    types: true,
  } satisfies Prisma.MealInclude;

  private toMealType(type: string): MealType {
    const map: Record<string, MealType> = { Breakfast: 'BREAKFAST', Lunch: 'LUNCH', Dinner: 'DINNER', Snack: 'SNACK', 'Protein Shake': 'PROTEIN_SHAKE' };
    return map[type] ?? 'DINNER';
  }

  private toFrontendMeal = (meal: any) => ({
    id: meal.id,
    name: meal.name,
    score: meal.score,
    category: meal.category?.name ?? 'Healthy',
    types: meal.types.map((t: any) => {
      const typeMap: Record<string, string> = {
        BREAKFAST: 'Breakfast',
        LUNCH: 'Lunch',
        DINNER: 'Dinner',
        SNACK: 'Snack',
        PROTEIN_SHAKE: 'Protein Shake',
      };
      return typeMap[t.type] ?? 'Dinner';
    }),
    ingredients: meal.ingredients.map((i: any) => ({ id: i.id, name: i.ingredient.name, amount: i.amount, unit: i.unit })),
    steps: meal.steps.map((s: any) => s.text),
    link: meal.link ?? undefined,
    nutritionalValue: meal.nutrition,
    image: meal.image ?? undefined,
    aiCategorized: meal.aiCategorized,
    aiNutrition: meal.aiNutrition,
    prepTime: meal.prepTime ?? undefined,
    cookTime: meal.cookTime ?? undefined,
    servings: meal.servings ?? undefined,
    tags: meal.tags.map((t: any) => t.tag.name),
    createdAt: meal.createdAt.toISOString(),
    updatedAt: meal.updatedAt.toISOString(),
  });
}
