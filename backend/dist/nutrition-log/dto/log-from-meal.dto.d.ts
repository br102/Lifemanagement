import { MealType } from '@prisma/client';
export declare class LogFromMealDto {
    date: string;
    mealId: string;
    mealType?: MealType;
    quantity?: number;
    notes?: string;
}
