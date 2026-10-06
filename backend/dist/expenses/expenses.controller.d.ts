import { SupabaseImageStorageService } from '../storage/supabase-image-storage.service';
import { ExpensesService } from './expenses.service';
import { ConfirmReceiptDto, ParseReceiptDto, UpdateIngredientDto, UpdateIngredientPriceDto, UpdateReceiptDto, UpsertBudgetsDto } from './dto/upload-receipt.dto';
export declare class ExpensesController {
    private readonly expensesService;
    private readonly imageStorage;
    constructor(expensesService: ExpensesService, imageStorage: SupabaseImageStorageService);
    uploadImage(file: UploadedImageFile): Promise<{
        imageUrl: string;
    }>;
    parseReceipt(user: {
        userId: string;
    }, dto: ParseReceiptDto): Promise<import("../ai/ai-provider.interface").ReceiptParseResult>;
    confirmReceipt(user: {
        userId: string;
    }, dto: ConfirmReceiptDto): Promise<{
        id: any;
        store: any;
        imageUrl: any;
        purchaseDate: any;
        totalAmount: any;
        currency: any;
        items: any;
        createdAt: any;
    }>;
    getReceipts(user: {
        userId: string;
    }): Promise<{
        id: any;
        store: any;
        imageUrl: any;
        purchaseDate: any;
        totalAmount: any;
        currency: any;
        items: any;
        createdAt: any;
    }[]>;
    getIngredientPrices(user: {
        userId: string;
    }): Promise<{
        ingredientId: string;
        priceId: string;
        name: string;
        category: string;
        unitPrice: number;
        unit: string;
        purchaseDate: string;
        currency: string;
    }[]>;
    getMealCosts(user: {
        userId: string;
    }): Promise<{
        mealId: string;
        mealName: string;
        estimatedCost: number;
        currency: string;
        missingIngredients: string[];
    }[]>;
    getGroceryEstimate(user: {
        userId: string;
    }, weekStartDate: string): Promise<{
        totalCost: number;
        currency: string;
        missingItems: string[];
    }>;
    updateIngredient(user: {
        userId: string;
    }, id: string, dto: UpdateIngredientDto): Promise<{
        name: string;
        id: string;
        category: string;
    }>;
    updateIngredientPrice(user: {
        userId: string;
    }, id: string, dto: UpdateIngredientPriceDto): Promise<{
        ingredient: {
            name: string;
            id: string;
            category: string;
        };
    } & {
        id: string;
        userId: string;
        purchaseDate: string;
        currency: string;
        createdAt: Date;
        ingredientId: string;
        receiptId: string | null;
        price: number;
        quantity: number;
        unit: string;
        unitPrice: number;
    }>;
    deleteIngredientPrice(user: {
        userId: string;
    }, id: string): Promise<{
        id: string;
        userId: string;
        purchaseDate: string;
        currency: string;
        createdAt: Date;
        ingredientId: string;
        receiptId: string | null;
        price: number;
        quantity: number;
        unit: string;
        unitPrice: number;
    }>;
    updateReceipt(user: {
        userId: string;
    }, id: string, dto: UpdateReceiptDto): Promise<{
        prices: ({
            ingredient: {
                name: string;
                id: string;
                category: string;
            };
        } & {
            id: string;
            userId: string;
            purchaseDate: string;
            currency: string;
            createdAt: Date;
            ingredientId: string;
            receiptId: string | null;
            price: number;
            quantity: number;
            unit: string;
            unitPrice: number;
        })[];
    } & {
        id: string;
        userId: string;
        store: string;
        imageUrl: string;
        purchaseDate: string;
        totalAmount: number | null;
        currency: string;
        createdAt: Date;
    }>;
    deleteReceipt(user: {
        userId: string;
    }, id: string): Promise<{
        id: string;
        userId: string;
        store: string;
        imageUrl: string;
        purchaseDate: string;
        totalAmount: number | null;
        currency: string;
        createdAt: Date;
    }>;
    getMonthlySpending(user: {
        userId: string;
    }): Promise<{
        month: string;
        total: number;
        byCategory: Record<string, number>;
    }[]>;
    getBudgets(user: {
        userId: string;
    }, month: string): Promise<{
        category: string;
        limit: number;
        spent: number;
        currency: string;
    }[]>;
    upsertBudgets(user: {
        userId: string;
    }, month: string, dto: UpsertBudgetsDto): Promise<{
        id: string;
        userId: string;
        currency: string;
        createdAt: Date;
        category: string;
        updatedAt: Date;
        month: string;
        amountLimit: number;
    }[]>;
}
type UploadedImageFile = {
    mimetype: string;
    originalname: string;
    buffer: Buffer;
};
export {};
