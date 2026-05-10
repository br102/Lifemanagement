import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AiProvider } from '../ai/ai-provider.interface';

@Injectable()
export class GroceriesService {
  constructor(private readonly prisma: PrismaService, @Inject('AI_PROVIDER') private readonly ai: AiProvider) {}

  async getByWeek(userId: string, weekStartDate: string) {
    const list = await this.prisma.groceryList.findUnique({ where: { userId_weekStartDate: { userId, weekStartDate } }, include: { items: true } });
    return list ? this.mapList(list) : null;
  }

  async toggleItem(userId: string, listId: string, itemId: string) {
    const list = await this.prisma.groceryList.findFirst({ where: { id: listId, userId } });
    if (!list) throw new BadRequestException('List not found');
    const item = await this.prisma.groceryItem.findUniqueOrThrow({ where: { id: itemId } });
    await this.prisma.groceryItem.update({ where: { id: itemId }, data: { checked: !item.checked } });
    return this.getByWeek(userId, list.weekStartDate);
  }

  async generateFromWeekPlan(userId: string, weekStartDate: string) {
    const plan = await this.prisma.weekPlan.findUnique({ where: { userId_startDate: { userId, startDate: weekStartDate } }, include: { days: true } });
    if (!plan) throw new BadRequestException('No week plan found');

    const mealIds = Array.from(new Set(plan.days.flatMap((d) => [d.breakfastId, d.lunchId, d.snackId, d.proteinShakeId, d.dinnerId].filter(Boolean) as string[])));
    const meals = await this.prisma.meal.findMany({ where: { id: { in: mealIds } }, include: { ingredients: { include: { ingredient: true } } } });

    const accumulator = new Map<string, { quantity: number; unit: string; category: string; forMeals: string[] }>();
    meals.forEach((m) => {
      m.ingredients.forEach((ing) => {
        const key = ing.ingredient.name.toLowerCase();
        const prev = accumulator.get(key);
        if (prev) prev.forMeals.push(m.name);
        else accumulator.set(key, { quantity: Number(ing.amount) || 1, unit: ing.unit, category: 'Pantry & Spices', forMeals: [m.name] });
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

  private mapList(list: any) {
    return {
      id: list.id,
      weekPlanId: list.weekPlanId,
      weekStartDate: list.weekStartDate,
      generatedAt: list.generatedAt.toISOString(),
      items: list.items.map((i: any) => ({
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
}
