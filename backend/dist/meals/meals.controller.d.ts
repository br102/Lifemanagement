import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { AiCategorizeDto, AiNutritionDto } from './dto/ai-tools.dto';
import { MealsService } from './meals.service';
export declare class MealsController {
    private readonly mealsService;
    constructor(mealsService: MealsService);
    uploadImage(file: any): {
        imageUrl: string;
    };
    findAll(user: {
        userId: string;
    }, search?: string, type?: string): Promise<{
        id: any;
        name: any;
        score: any;
        category: any;
        types: any;
        ingredients: any;
        steps: any;
        link: any;
        nutritionalValue: any;
        image: any;
        aiCategorized: any;
        aiNutrition: any;
        prepTime: any;
        cookTime: any;
        servings: any;
        tags: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    findOne(user: {
        userId: string;
    }, id: string): Promise<{
        id: any;
        name: any;
        score: any;
        category: any;
        types: any;
        ingredients: any;
        steps: any;
        link: any;
        nutritionalValue: any;
        image: any;
        aiCategorized: any;
        aiNutrition: any;
        prepTime: any;
        cookTime: any;
        servings: any;
        tags: any;
        createdAt: any;
        updatedAt: any;
    }>;
    create(user: {
        userId: string;
    }, dto: CreateMealDto): Promise<{
        id: any;
        name: any;
        score: any;
        category: any;
        types: any;
        ingredients: any;
        steps: any;
        link: any;
        nutritionalValue: any;
        image: any;
        aiCategorized: any;
        aiNutrition: any;
        prepTime: any;
        cookTime: any;
        servings: any;
        tags: any;
        createdAt: any;
        updatedAt: any;
    }>;
    categorize(dto: AiCategorizeDto): Promise<import("../ai/ai-provider.interface").MealClassification>;
    nutrition(dto: AiNutritionDto): Promise<import("../ai/ai-provider.interface").NutritionResult>;
    update(user: {
        userId: string;
    }, id: string, dto: UpdateMealDto): Promise<{
        id: any;
        name: any;
        score: any;
        category: any;
        types: any;
        ingredients: any;
        steps: any;
        link: any;
        nutritionalValue: any;
        image: any;
        aiCategorized: any;
        aiNutrition: any;
        prepTime: any;
        cookTime: any;
        servings: any;
        tags: any;
        createdAt: any;
        updatedAt: any;
    }>;
    remove(user: {
        userId: string;
    }, id: string): Promise<{
        success: boolean;
    }>;
}
