export interface MealClassification {
    primaryCategory: string;
    categories: string[];
    category: string;
    types: string[];
    vegetarian: boolean;
    lactoseFree: boolean;
}
export interface NutritionResult {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
}
export interface PlannerInput {
    weekStartDate: string;
    meals: Array<{
        id: string;
        name: string;
        types: string[];
        category: string;
    }>;
}
export interface GrocerySuggestion {
    category: string;
    itemName: string;
    recommendedPurchaseDate?: string;
    estimatedExpirationDate?: string;
}
export interface AiProvider {
    classifyMeal(name: string, ingredients: string[]): Promise<MealClassification>;
    estimateNutrition(name: string, ingredients: Array<{
        name: string;
        amount: string;
        unit: string;
    }>): Promise<NutritionResult>;
    generateWeekPlan(input: PlannerInput): Promise<Record<string, Partial<Record<'breakfast' | 'lunch' | 'snack' | 'proteinShake' | 'dinner', string>>>>;
    suggestGroceryMeta(items: Array<{
        name: string;
        category: string;
    }>): Promise<GrocerySuggestion[]>;
}
