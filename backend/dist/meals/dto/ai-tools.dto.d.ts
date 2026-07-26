declare class IngredientInputDto {
    name: string;
    amount: string;
    unit: string;
}
export declare class AiCategorizeDto {
    name: string;
    ingredients: string[];
}
export declare class AiNutritionDto {
    name: string;
    ingredients: IngredientInputDto[];
}
export {};
