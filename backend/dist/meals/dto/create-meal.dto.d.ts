declare class IngredientDto {
    name: string;
    amount: string;
    unit: string;
}
declare class NutritionDto {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
}
export declare class CreateMealDto {
    name: string;
    score: number;
    category?: string;
    types: string[];
    ingredients: IngredientDto[];
    steps: string[];
    link?: string;
    nutritionalValue: NutritionDto;
    image?: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    tags?: string[];
}
export {};
