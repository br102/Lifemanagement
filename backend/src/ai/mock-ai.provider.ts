import { Injectable } from '@nestjs/common';
import { AiProvider, MealClassification, NutritionResult, PlannerInput, GrocerySuggestion } from './ai-provider.interface';

@Injectable()
export class MockAiProvider implements AiProvider {
  async classifyMeal(name: string): Promise<MealClassification> {
    const lower = name.toLowerCase();
    return {
      category: lower.includes('pasta') ? 'Italian' : 'Healthy',
      types: lower.includes('shake') ? ['Protein Shake'] : ['Dinner'],
    };
  }

  async estimateNutrition(): Promise<NutritionResult> {
    return { calories: 350, protein: 24, carbs: 30, fat: 10, fiber: 6, sugar: 7, sodium: 320 };
  }

  async generateWeekPlan(input: PlannerInput) {
    const plan: Record<string, any> = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(input.weekStartDate);
      date.setDate(date.getDate() + i);
      const key = date.toISOString().slice(0, 10);
      const first = input.meals[0]?.id;
      plan[key] = { breakfast: first, lunch: first, snack: first, dinner: first };
    }
    return plan;
  }

  async suggestGroceryMeta(items: Array<{ name: string; category: string }>): Promise<GrocerySuggestion[]> {
    return items.map((i) => ({ category: i.category, itemName: i.name }));
  }
}
