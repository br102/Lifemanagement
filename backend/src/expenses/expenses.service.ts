import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ConfirmReceiptDto, ReceiptLineItemDto, UpdateIngredientDto, UpdateIngredientPriceDto, UpdateReceiptDto, UpsertBudgetsDto } from './dto/upload-receipt.dto';
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
    const receipt = await this.prisma.$transaction(
      async (tx) => {
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
      },
      { timeout: 30000 },
    );

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
      priceId: p.id,
      name: p.ingredient.name,
      category: p.ingredient.category,
      unitPrice: p.unitPrice,
      unit: p.unit,
      purchaseDate: p.purchaseDate,
      currency: p.currency,
    }));
  }

  async updateIngredient(userId: string, ingredientId: string, dto: UpdateIngredientDto) {
    const ingredient = await this.prisma.ingredient.findUniqueOrThrow({ where: { id: ingredientId } });
    return this.prisma.ingredient.update({
      where: { id: ingredientId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.category && { category: dto.category }),
      },
    });
  }

  async updateIngredientPrice(userId: string, priceId: string, dto: UpdateIngredientPriceDto) {
    const existingPrice = await this.prisma.ingredientPrice.findFirst({
      where: { id: priceId, userId },
    });
    if (!existingPrice) throw new NotFoundException('Ingredient price not found');

    const quantity = dto.quantity ?? existingPrice.quantity;
    const unit = dto.unit ?? existingPrice.unit;
    const price = dto.price ?? existingPrice.price;
    const unitPrice = this.calculateUnitPrice(quantity, unit, price);

    return this.prisma.ingredientPrice.update({
      where: { id: priceId },
      data: {
        ...(dto.price !== undefined && { price }),
        ...(dto.quantity !== undefined && { quantity }),
        ...(dto.unit && { unit }),
        ...(dto.purchaseDate && { purchaseDate: dto.purchaseDate }),
        unitPrice,
      },
      include: { ingredient: true },
    });
  }

  async deleteIngredientPrice(userId: string, priceId: string) {
    const price = await this.prisma.ingredientPrice.findFirst({
      where: { id: priceId, userId },
    });
    if (!price) throw new NotFoundException('Ingredient price not found');

    return this.prisma.ingredientPrice.delete({ where: { id: priceId } });
  }

  async updateReceipt(userId: string, receiptId: string, dto: UpdateReceiptDto) {
    const receipt = await this.prisma.receipt.findFirst({
      where: { id: receiptId, userId },
      include: { prices: { include: { ingredient: true } } },
    });
    if (!receipt) throw new NotFoundException('Receipt not found');

    return this.prisma.$transaction(
      async (tx) => {
        const updated = await tx.receipt.update({
          where: { id: receiptId },
          data: {
            ...(dto.store && { store: dto.store }),
            ...(dto.purchaseDate && { purchaseDate: dto.purchaseDate }),
            ...(dto.totalAmount !== undefined && { totalAmount: dto.totalAmount }),
            ...(dto.currency && { currency: dto.currency }),
          },
        });

        if (dto.items && dto.items.length > 0) {
          await tx.ingredientPrice.deleteMany({ where: { receiptId } });

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
                receiptId,
                price: item.price,
                quantity: item.quantity,
                unit: item.unit,
                unitPrice,
                currency: updated.currency,
                purchaseDate: updated.purchaseDate,
              },
            });
          }
        }

        return tx.receipt.findUniqueOrThrow({
          where: { id: receiptId },
          include: { prices: { include: { ingredient: true } } },
        });
      },
      { timeout: 30000 },
    );
  }

  async deleteReceipt(userId: string, receiptId: string) {
    const receipt = await this.prisma.receipt.findFirst({
      where: { id: receiptId, userId },
    });
    if (!receipt) throw new NotFoundException('Receipt not found');

    return this.prisma.$transaction(async (tx) => {
      await tx.ingredientPrice.deleteMany({ where: { receiptId } });
      return tx.receipt.delete({ where: { id: receiptId } });
    });
  }

  async getMonthlySpending(userId: string, months = 6) {
    const prices = await this.prisma.ingredientPrice.findMany({
      where: { userId },
      include: { ingredient: true },
      orderBy: { purchaseDate: 'asc' },
    });

    const spending = new Map<string, { total: number; byCategory: Record<string, number> }>();

    for (const price of prices) {
      const month = price.purchaseDate.substring(0, 7);
      if (!spending.has(month)) {
        spending.set(month, { total: 0, byCategory: {} });
      }
      const monthData = spending.get(month)!;
      monthData.total += price.price;
      const category = price.ingredient.category || 'Other';
      monthData.byCategory[category] = (monthData.byCategory[category] || 0) + price.price;
    }

    const now = new Date();
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toISOString().substring(0, 7);
      result.push({
        month,
        total: spending.get(month)?.total || 0,
        byCategory: spending.get(month)?.byCategory || {},
      });
    }
    return result;
  }

  async getBudgets(userId: string, month: string) {
    const budgets = await this.prisma.monthlyBudget.findMany({
      where: { userId, month },
    });

    const spending = await this.getMonthlySpending(userId, 1);
    const monthSpending = spending[spending.length - 1];
    const spendByCategory = monthSpending?.byCategory || {};

    return budgets.map((b) => ({
      category: b.category,
      limit: b.amountLimit,
      spent: spendByCategory[b.category] || 0,
      currency: b.currency,
    }));
  }

  async upsertBudgets(userId: string, month: string, dto: UpsertBudgetsDto) {
    const upsertPromises = dto.items.map((item) =>
      this.prisma.monthlyBudget.upsert({
        where: { userId_month_category: { userId, month, category: item.category } },
        create: {
          userId,
          month,
          category: item.category,
          amountLimit: item.amountLimit,
        },
        update: {
          amountLimit: item.amountLimit,
        },
      }),
    );
    return Promise.all(upsertPromises);
  }

  async getMealCosts(userId: string) {
    // Fetch all meals with their ingredients
    const meals = await this.prisma.meal.findMany({
      where: { userId },
      include: {
        ingredients: { include: { ingredient: true } },
        nutrition: true,
      },
    });

    // Fetch latest ingredient prices per ingredientId in a single query
    const latestPrices = await this.prisma.ingredientPrice.findMany({
      where: { userId },
      distinct: ['ingredientId'],
      orderBy: { purchaseDate: 'desc' },
    });

    // Create a map of ingredientId -> latest price
    const priceMap = new Map<string, any>();
    latestPrices.forEach((price) => {
      if (!priceMap.has(price.ingredientId)) {
        priceMap.set(price.ingredientId, price);
      }
    });

    return meals.map((meal) => {
      const { estimatedCost, missingIngredients } = this.calculateMealCost(meal, priceMap);
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

  private calculateMealCost(meal: any, priceMap: Map<string, any>): { estimatedCost: number; missingIngredients: string[] } {
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

      // Look up latest price for this ingredient from the map
      const latestPrice = priceMap.get(mealIng.ingredientId);
      if (!latestPrice) {
        missingIngredients.push(mealIng.ingredient.name);
        continue;
      }

      // Extract unit from the amount string (e.g., "200g" -> "g", "2 cups" -> "cups")
      const unitMatch = (mealIng.amount as string).match(/([a-zA-Z]+)$/);
      const unit = unitMatch ? unitMatch[1] : mealIng.unit;

      // Calculate cost using the helper
      const itemCost = this.calculateItemCost(quantity, unit, latestPrice.unitPrice, latestPrice.unit);
      if (itemCost === null) {
        missingIngredients.push(mealIng.ingredient.name);
      } else {
        estimatedCost += itemCost;
      }
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
        priceId: p.id,
        name: p.ingredient.name,
        category: p.ingredient.category,
        quantity: p.quantity,
        unit: p.unit,
        price: p.price,
        unitPrice: p.unitPrice,
      })),
      createdAt: receipt.createdAt.toISOString(),
    };
  }
}
