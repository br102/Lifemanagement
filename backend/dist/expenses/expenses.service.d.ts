import { PrismaService } from '../database/prisma.service';
import { ConfirmReceiptDto, UpdateIngredientDto, UpdateIngredientPriceDto, UpdateReceiptDto, UpsertBudgetsDto } from './dto/upload-receipt.dto';
import { AiProvider, ReceiptParseResult } from '../ai/ai-provider.interface';
export declare class ExpensesService {
    private readonly prisma;
    private readonly ai;
    constructor(prisma: PrismaService, ai: AiProvider);
    parseReceipt(userId: string, imageUrl: string): Promise<ReceiptParseResult>;
    confirmReceipt(userId: string, dto: ConfirmReceiptDto): Promise<{
        id: any;
        store: any;
        imageUrl: any;
        purchaseDate: any;
        totalAmount: any;
        currency: any;
        items: any;
        createdAt: any;
    }>;
    getReceipts(userId: string): Promise<{
        id: any;
        store: any;
        imageUrl: any;
        purchaseDate: any;
        totalAmount: any;
        currency: any;
        items: any;
        createdAt: any;
    }[]>;
    getIngredientPrices(userId: string): Promise<{
        ingredientId: string;
        priceId: string;
        name: string;
        category: string;
        unitPrice: number;
        unit: string;
        purchaseDate: string;
        currency: string;
    }[]>;
    updateIngredient(userId: string, ingredientId: string, dto: UpdateIngredientDto): Promise<{
        id: string;
        name: string;
        category: string;
    }>;
    updateIngredientPrice(userId: string, priceId: string, dto: UpdateIngredientPriceDto): Promise<{
        ingredient: {
            id: string;
            name: string;
            category: string;
        };
    } & {
        id: string;
        createdAt: Date;
        unit: string;
        userId: string;
        ingredientId: string;
        quantity: number;
        purchaseDate: string;
        currency: string;
        receiptId: string | null;
        price: number;
        unitPrice: number;
    }>;
    deleteIngredientPrice(userId: string, priceId: string): Promise<{
        id: string;
        createdAt: Date;
        unit: string;
        userId: string;
        ingredientId: string;
        quantity: number;
        purchaseDate: string;
        currency: string;
        receiptId: string | null;
        price: number;
        unitPrice: number;
    }>;
    updateReceipt(userId: string, receiptId: string, dto: UpdateReceiptDto): Promise<{
        prices: ({
            ingredient: {
                id: string;
                name: string;
                category: string;
            };
        } & {
            id: string;
            createdAt: Date;
            unit: string;
            userId: string;
            ingredientId: string;
            quantity: number;
            purchaseDate: string;
            currency: string;
            receiptId: string | null;
            price: number;
            unitPrice: number;
        })[];
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        store: string;
        imageUrl: string;
        purchaseDate: string;
        totalAmount: number | null;
        currency: string;
    }>;
    deleteReceipt(userId: string, receiptId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        store: string;
        imageUrl: string;
        purchaseDate: string;
        totalAmount: number | null;
        currency: string;
    }>;
    getMonthlySpending(userId: string, months?: number): Promise<{
        month: string;
        total: number;
        byCategory: Record<string, number>;
    }[]>;
    getBudgets(userId: string, month: string): Promise<{
        category: string;
        limit: number;
        spent: number;
        currency: string;
    }[]>;
    upsertBudgets(userId: string, month: string, dto: UpsertBudgetsDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        userId: string;
        month: string;
        currency: string;
        amountLimit: number;
    }[]>;
    getMealCosts(userId: string): Promise<{
        mealId: string;
        mealName: string;
        estimatedCost: number;
        currency: string;
        missingIngredients: string[];
    }[]>;
    getGroceryEstimate(userId: string, weekStartDate: string): Promise<{
        totalCost: number;
        currency: string;
        missingItems: string[];
    }>;
    private calculateUnitPrice;
    private normalizeToBaseUnit;
    private calculateItemCost;
    private calculateMealCost;
    private toFrontendReceipt;
}
