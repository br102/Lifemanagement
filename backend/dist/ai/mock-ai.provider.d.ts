import { AiProvider, MealClassification, NutritionResult, PlannerInput, GrocerySuggestion } from './ai-provider.interface';
export declare class MockAiProvider implements AiProvider {
    classifyMeal(name: string): Promise<MealClassification>;
    estimateNutrition(): Promise<NutritionResult>;
    generateWeekPlan(input: PlannerInput): Promise<Record<string, any>>;
    suggestGroceryMeta(items: Array<{
        name: string;
        category: string;
    }>): Promise<GrocerySuggestion[]>;
}
