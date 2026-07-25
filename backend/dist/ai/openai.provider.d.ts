import { AiProvider, GrocerySuggestion, MealClassification, NutritionResult, PlannerInput } from './ai-provider.interface';
export declare class OpenAiProvider implements AiProvider {
    private readonly apiKey;
    private readonly model;
    private readonly baseUrl;
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
    private askJson;
    private requiredInt;
    private requiredString;
    private optionalString;
    private requiredBoolean;
}
