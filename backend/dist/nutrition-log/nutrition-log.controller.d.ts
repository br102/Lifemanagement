import { CreateLogEntryDto } from './dto/create-log-entry.dto';
import { LogFromMealDto } from './dto/log-from-meal.dto';
import { UpdateLogEntryDto } from './dto/update-log-entry.dto';
import { NutritionLogService } from './nutrition-log.service';
export declare class NutritionLogController {
    private readonly service;
    constructor(service: NutritionLogService);
    getDay(user: {
        userId: string;
    }, date: string): Promise<import("./nutrition-log.service").DailyNutritionSummary>;
    getRange(user: {
        userId: string;
    }, from?: string, to?: string): Promise<{
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
    logFromMeal(user: {
        userId: string;
    }, dto: LogFromMealDto): Promise<{
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
    create(user: {
        userId: string;
    }, dto: CreateLogEntryDto): Promise<{
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
    update(user: {
        userId: string;
    }, id: string, dto: UpdateLogEntryDto): Promise<{
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
    remove(user: {
        userId: string;
    }, id: string): Promise<{
        success: boolean;
    }>;
}
