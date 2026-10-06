export declare class GeneratePlanDto {
    weekStartDate: string;
    dietaryRestrictions?: string;
    cuisinePreferences?: string;
    ingredientsToAvoid?: string;
    cookingLevel?: 'quick' | 'moderate' | 'advanced';
    mealRepetition?: number;
    notes?: string;
}
