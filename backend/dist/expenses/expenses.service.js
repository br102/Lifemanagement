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
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let ExpensesService = class ExpensesService {
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
    }
    async parseReceipt(userId, imageUrl) {
        const knownIngredients = await this.prisma.ingredient.findMany({ select: { name: true } });
        const knownNames = knownIngredients.map((i) => i.name);
        return this.ai.parseReceipt(imageUrl, knownNames);
    }
    async confirmReceipt(userId, dto) {
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
        }, { timeout: 30000 });
        return this.toFrontendReceipt(receipt);
    }
    async getReceipts(userId) {
        const receipts = await this.prisma.receipt.findMany({
            where: { userId },
            include: { prices: { include: { ingredient: true } } },
            orderBy: { purchaseDate: 'desc' },
        });
        return receipts.map((r) => this.toFrontendReceipt(r));
    }
    async getIngredientPrices(userId) {
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
    async updateIngredient(userId, ingredientId, dto) {
        const ingredient = await this.prisma.ingredient.findUniqueOrThrow({ where: { id: ingredientId } });
        return this.prisma.ingredient.update({
            where: { id: ingredientId },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.category && { category: dto.category }),
            },
        });
    }
    async updateIngredientPrice(userId, priceId, dto) {
        const existingPrice = await this.prisma.ingredientPrice.findFirst({
            where: { id: priceId, userId },
        });
        if (!existingPrice)
            throw new common_1.NotFoundException('Ingredient price not found');
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
    async deleteIngredientPrice(userId, priceId) {
        const price = await this.prisma.ingredientPrice.findFirst({
            where: { id: priceId, userId },
        });
        if (!price)
            throw new common_1.NotFoundException('Ingredient price not found');
        return this.prisma.ingredientPrice.delete({ where: { id: priceId } });
    }
    async updateReceipt(userId, receiptId, dto) {
        const receipt = await this.prisma.receipt.findFirst({
            where: { id: receiptId, userId },
            include: { prices: { include: { ingredient: true } } },
        });
        if (!receipt)
            throw new common_1.NotFoundException('Receipt not found');
        return this.prisma.$transaction(async (tx) => {
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
        }, { timeout: 30000 });
    }
    async deleteReceipt(userId, receiptId) {
        const receipt = await this.prisma.receipt.findFirst({
            where: { id: receiptId, userId },
        });
        if (!receipt)
            throw new common_1.NotFoundException('Receipt not found');
        return this.prisma.$transaction(async (tx) => {
            await tx.ingredientPrice.deleteMany({ where: { receiptId } });
            return tx.receipt.delete({ where: { id: receiptId } });
        });
    }
    async getMonthlySpending(userId, months = 6) {
        const prices = await this.prisma.ingredientPrice.findMany({
            where: { userId },
            include: { ingredient: true },
            orderBy: { purchaseDate: 'asc' },
        });
        const spending = new Map();
        for (const price of prices) {
            const month = price.purchaseDate.substring(0, 7);
            if (!spending.has(month)) {
                spending.set(month, { total: 0, byCategory: {} });
            }
            const monthData = spending.get(month);
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
    async getBudgets(userId, month) {
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
    async upsertBudgets(userId, month, dto) {
        const upsertPromises = dto.items.map((item) => this.prisma.monthlyBudget.upsert({
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
        }));
        return Promise.all(upsertPromises);
    }
    async getMealCosts(userId) {
        const meals = await this.prisma.meal.findMany({
            where: { userId },
            include: {
                ingredients: { include: { ingredient: true } },
                nutrition: true,
            },
        });
        const latestPrices = await this.prisma.ingredientPrice.findMany({
            where: { userId },
            distinct: ['ingredientId'],
            orderBy: { purchaseDate: 'desc' },
        });
        const priceMap = new Map();
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
    async getGroceryEstimate(userId, weekStartDate) {
        const groceryList = await this.prisma.groceryList.findFirst({
            where: { userId, weekStartDate },
            include: { items: true },
        });
        if (!groceryList) {
            throw new common_1.NotFoundException('Grocery list not found');
        }
        let totalCost = 0;
        const missingItems = [];
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
            }
            else {
                totalCost += itemCost;
            }
        }
        return { totalCost, currency: 'PLN', missingItems };
    }
    calculateUnitPrice(quantity, unit, price) {
        const baseQuantity = this.normalizeToBaseUnit(quantity, unit);
        if (baseQuantity === null)
            return 0;
        return baseQuantity > 0 ? price / baseQuantity : 0;
    }
    normalizeToBaseUnit(quantity, unit) {
        const normalized = unit.toLowerCase().trim();
        if (normalized === 'g')
            return quantity;
        if (normalized === 'kg')
            return quantity * 1000;
        if (normalized === 'ml')
            return quantity;
        if (normalized === 'l')
            return quantity * 1000;
        if (normalized === 'pcs')
            return quantity;
        return null;
    }
    calculateItemCost(quantity, unit, unitPrice, priceUnit) {
        const normalizedQty = this.normalizeToBaseUnit(quantity, unit);
        const normalizedPrice = this.normalizeToBaseUnit(1, priceUnit);
        if (normalizedQty === null || normalizedPrice === null) {
            return null;
        }
        return (normalizedQty / normalizedPrice) * unitPrice;
    }
    calculateMealCost(meal, priceMap) {
        let estimatedCost = 0;
        const missingIngredients = [];
        for (const mealIng of meal.ingredients) {
            const amountMatch = mealIng.amount.match(/^([\d.]+(?:\/[\d.]+)?)/);
            if (!amountMatch) {
                missingIngredients.push(mealIng.ingredient.name);
                continue;
            }
            let quantity = 0;
            const amountStr = amountMatch[1];
            if (amountStr.includes('/')) {
                const [num, den] = amountStr.split('/').map(Number);
                quantity = num / den;
            }
            else {
                quantity = Number(amountStr);
            }
            if (!Number.isFinite(quantity) || quantity <= 0) {
                missingIngredients.push(mealIng.ingredient.name);
                continue;
            }
            const latestPrice = priceMap.get(mealIng.ingredientId);
            if (!latestPrice) {
                missingIngredients.push(mealIng.ingredient.name);
                continue;
            }
            const unitMatch = mealIng.amount.match(/([a-zA-Z]+)$/);
            const unit = unitMatch ? unitMatch[1] : mealIng.unit;
            const itemCost = this.calculateItemCost(quantity, unit, latestPrice.unitPrice, latestPrice.unit);
            if (itemCost === null) {
                missingIngredients.push(mealIng.ingredient.name);
            }
            else {
                estimatedCost += itemCost;
            }
        }
        return { estimatedCost, missingIngredients };
    }
    toFrontendReceipt(receipt) {
        return {
            id: receipt.id,
            store: receipt.store,
            imageUrl: receipt.imageUrl,
            purchaseDate: receipt.purchaseDate,
            totalAmount: receipt.totalAmount,
            currency: receipt.currency,
            items: (receipt.prices || []).map((p) => ({
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
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('AI_PROVIDER')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map