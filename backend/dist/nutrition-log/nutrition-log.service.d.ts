import { PrismaService } from '../database/prisma.service';
import { CreateLogEntryDto } from './dto/create-log-entry.dto';
import { LogFromMealDto } from './dto/log-from-meal.dto';
import { UpdateLogEntryDto } from './dto/update-log-entry.dto';
import { AiProvider } from '../ai/ai-provider.interface';
export interface DailyNutritionSummary {
    date: string;
    entries: any[];
    totals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    targets: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
    };
    remaining: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}
export declare class NutritionLogService {
    private readonly prisma;
    private readonly ai;
    constructor(prisma: PrismaService, ai: AiProvider);
    logFromMeal(userId: string, dto: LogFromMealDto): Promise<{
        id: any;
        date: any;
        mealId: any;
        mealType: any;
        label: any;
        quantity: any;
        calories: any;
        protein: any;
        carbs: any;
        fat: any;
        notes: any;
        loggedAt: any;
        createdAt: any;
    }>;
    createCustom(userId: string, dto: CreateLogEntryDto): Promise<{
        id: any;
        date: any;
        mealId: any;
        mealType: any;
        label: any;
        quantity: any;
        calories: any;
        protein: any;
        carbs: any;
        fat: any;
        notes: any;
        loggedAt: any;
        createdAt: any;
    }>;
    update(userId: string, id: string, dto: UpdateLogEntryDto): Promise<{
        id: any;
        date: any;
        mealId: any;
        mealType: any;
        label: any;
        quantity: any;
        calories: any;
        protein: any;
        carbs: any;
        fat: any;
        notes: any;
        loggedAt: any;
        createdAt: any;
    }>;
    remove(userId: string, id: string): Promise<{
        success: boolean;
    }>;
    getDay(userId: string, date: string): Promise<DailyNutritionSummary>;
    getRange(userId: string, from?: string, to?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        userId: string;
        mealId: string | null;
        date: string;
        notes: string | null;
        quantity: number;
        label: string;
        mealType: string | null;
        loggedAt: Date;
    }[]>;
    private dateRange;
    private toFrontendEntry;
}
