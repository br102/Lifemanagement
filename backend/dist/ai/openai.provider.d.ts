import { AiProvider, GrocerySuggestion, MealClassification, MealDraftSuggestion, NutritionResult, PlannerInput, ReceiptParseResult } from './ai-provider.interface';
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
    draftMealFromLink(link: string): Promise<MealDraftSuggestion>;
    generateWeekPlan(input: PlannerInput): Promise<Record<string, Partial<Record<'breakfast' | 'lunch' | 'snack' | 'proteinShake' | 'dinner', string>>>>;
    suggestGroceryMeta(items: Array<{
        name: string;
        category: string;
    }>): Promise<GrocerySuggestion[]>;
    parseReceipt(imageUrl: string, knownIngredientNames: string[]): Promise<ReceiptParseResult>;
    private askJson;
    private askJsonWithImage;
    private requiredInt;
    private requiredString;
    private optionalString;
    private requiredBoolean;
    private requiredFloat;
}
