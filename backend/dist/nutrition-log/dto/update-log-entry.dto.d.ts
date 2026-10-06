import { MealType } from '@prisma/client';
export declare class UpdateLogEntryDto {
    label?: string;
    mealType?: MealType;
    quantity?: number;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    notes?: string;
}
