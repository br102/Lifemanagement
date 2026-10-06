import { MealType } from '@prisma/client';
export declare class CreateLogEntryDto {
    date: string;
    label: string;
    mealType?: MealType;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    notes?: string;
}
