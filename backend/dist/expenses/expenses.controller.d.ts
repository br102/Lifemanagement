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
        id: string;
        name: string;
        category: string;
    }>;
    updateIngredientPrice(user: {
        userId: string;
    }, id: string, dto: UpdateIngredientPriceDto): Promise<{
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
    deleteIngredientPrice(user: {
        userId: string;
    }, id: string): Promise<{
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
    updateReceipt(user: {
        userId: string;
    }, id: string, dto: UpdateReceiptDto): Promise<{
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
    deleteReceipt(user: {
        userId: string;
    }, id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        store: string;
        imageUrl: string;
        purchaseDate: string;
        totalAmount: number | null;
        currency: string;
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
        createdAt: Date;
        updatedAt: Date;
        category: string;
        userId: string;
        month: string;
        currency: string;
        amountLimit: number;
    }[]>;
}
type UploadedImageFile = {
    mimetype: string;
    originalname: string;
    buffer: Buffer;
};
export {};
