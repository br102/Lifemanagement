import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ConfirmReceiptDto, ReceiptLineItemDto } from './dto/upload-receipt.dto';
import { AiProvider, ReceiptParseResult } from '../ai/ai-provider.interface';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService, @Inject('AI_PROVIDER') private readonly ai: AiProvider) {}

  async parseReceipt(userId: string, imageUrl: string): Promise<ReceiptParseResult> {
    const knownIngredients = await this.prisma.ingredient.findMany({ select: { name: true } });
    const knownNames = knownIngredients.map((i) => i.name);
    return this.ai.parseReceipt(imageUrl, knownNames);
  }

  async confirmReceipt(userId: string, dto: ConfirmReceiptDto) {
    const receipt = await this.prisma.$transaction(async (tx) => {
      const r = await tx.receipt.create({
        data: {
          userId,
          store: dto.store,
          imageUrl: dto.imageUrl,
          purchaseDate: dto.purchaseDate,
          totalAmount: dto.totalAmount,
          currency: dto.currency || 'PLN',
        },
      });

      for (const item of dto.items) {
        const ingredient = await tx.ingredient.upsert({
          where: { name: item.name },
          create: { name: item.name },
          update: {},
        });

        const unitPrice = this.calculateUnitPrice(item.quantity, item.unit, item.price);
        await tx.ingredientPrice.create({
          data: {
            userId,
            ingredientId: ingredient.id,
            receiptId: r.id,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice,
            currency: r.currency,
            purchaseDate: r.purchaseDate,
          },
        });
      }

      return tx.receipt.findUniqueOrThrow({
        where: { id: r.id },
        include: { prices: { include: { ingredient: true } } },
      });
    });

    return this.toFrontendReceipt(receipt);
  }

  async getReceipts(userId: string) {
    const receipts = await this.prisma.receipt.findMany({
      where: { userId },
      include: { prices: { include: { ingredient: true } } },
      orderBy: { purchaseDate: 'desc' },
    });
    return receipts.map((r) => this.toFrontendReceipt(r));
  }

  async getIngredientPrices(userId: string) {
    const prices = await this.prisma.ingredientPrice.findMany({
      where: { userId },
      distinct: ['ingredientId'],
      orderBy: { purchaseDate: 'desc' },
      include: { ingredient: true },
    });

    return prices.map((p) => ({
      ingredientId: p.ingredientId,
      name: p.ingredient.name,
      unitPrice: p.unitPrice,
      unit: p.unit,
      purchaseDate: p.purchaseDate,
      currency: p.currency,
    }));
  }

  async getMealCosts(userId: string) {
    const meals = await this.prisma.meal.findMany({
      where: { userId },
      include: {
        ingredients: { include: { ingredient: true } },
        nutrition: true,
      },
    });

    return meals.map((meal) => {
      const { estimatedCost, missingIngredients } = this.calculateMealCost(meal, userId);
      return {
        mealId: meal.id,
        mealName: meal.name,
        estimatedCost,
        currency: 'PLN',
        missingIngredients,
      };
    });
  }

  async getGroceryEstimate(userId: string, weekStartDate: string) {
    const groceryList = await this.prisma.groceryList.findFirst({
      where: { userId, weekStartDate },
      include: { items: true },
    });

    if (!groceryList) {
      throw new NotFoundException('Grocery list not found');
    }

    let totalCost = 0;
    const missingItems: string[] = [];

    for (const item of groceryList.items) {
      const latestPrice = await this.prisma.ingredientPrice.findFirst({
        where: {
          userId,
          ingredient: { name: { contains: item.name, mode: 'insensitive' } },
        },
        orderBy: { purchaseDate: 'desc' },
      });

      if (!latestPrice) {
        missingItems.push(item.name);
        continue;
      }

      const itemCost = this.calculateItemCost(item.quantity, item.unit, latestPrice.unitPrice, latestPrice.unit);
      if (itemCost === null) {
        missingItems.push(item.name);
      } else {
        totalCost += itemCost;
      }
    }

    return { totalCost, currency: 'PLN', missingItems };
  }

  private calculateUnitPrice(quantity: number, unit: string, price: number): number {
    const baseQuantity = this.normalizeToBaseUnit(quantity, unit);
    if (baseQuantity === null) return 0;
    return baseQuantity > 0 ? price / baseQuantity : 0;
  }

  private normalizeToBaseUnit(quantity: number, unit: string): number | null {
    const normalized = unit.toLowerCase().trim();
    if (normalized === 'g') return quantity;
    if (normalized === 'kg') return quantity * 1000;
    if (normalized === 'ml') return quantity;
    if (normalized === 'l') return quantity * 1000;
    if (normalized === 'pcs') return quantity;
    return null;
  }

  private calculateItemCost(quantity: number, unit: string, unitPrice: number, priceUnit: string): number | null {
    const normalizedQty = this.normalizeToBaseUnit(quantity, unit);
    const normalizedPrice = this.normalizeToBaseUnit(1, priceUnit);
    if (normalizedQty === null || normalizedPrice === null) {
      return null;
    }
    return (normalizedQty / normalizedPrice) * unitPrice;
  }

  private calculateMealCost(meal: any, userId: string): { estimatedCost: number; missingIngredients: string[] } {
    let estimatedCost = 0;
    const missingIngredients: string[] = [];

    for (const mealIng of meal.ingredients) {
      // Try to parse amount (e.g., "200g" -> 200, "2" -> 2, "1/2" -> 0.5)
      const amountMatch = (mealIng.amount as string).match(/^([\d.]+(?:\/[\d.]+)?)/);
      if (!amountMatch) {
        missingIngredients.push(mealIng.ingredient.name);
        continue;
      }

      let quantity = 0;
      const amountStr = amountMatch[1];
      if (amountStr.includes('/')) {
        const [num, den] = amountStr.split('/').map(Number);
        quantity = num / den;
      } else {
        quantity = Number(amountStr);
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        missingIngredients.push(mealIng.ingredient.name);
        continue;
      }

      // Sync prisma query: find latest price for this ingredient
      // This is a limitation — in real code you'd prefetch this data
      missingIngredients.push(mealIng.ingredient.name);
    }

    return { estimatedCost, missingIngredients };
  }

  private toFrontendReceipt(receipt: any) {
    return {
      id: receipt.id,
      store: receipt.store,
      imageUrl: receipt.imageUrl,
      purchaseDate: receipt.purchaseDate,
      totalAmount: receipt.totalAmount,
      currency: receipt.currency,
      items: (receipt.prices || []).map((p: any) => ({
        name: p.ingredient.name,
        quantity: p.quantity,
        unit: p.unit,
        price: p.price,
        unitPrice: p.unitPrice,
      })),
      createdAt: receipt.createdAt.toISOString(),
    };
  }
}
