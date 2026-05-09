export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Protein Shake';

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export interface NutritionalValue {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface Meal {
  id: string;
  name: string;
  score: number;
  category: string;
  types: MealType[];
  ingredients: Ingredient[];
  steps: string[];
  link?: string;
  nutritionalValue: NutritionalValue;
  image?: string;
  aiCategorized?: boolean;
  aiNutrition?: boolean;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  tags?: string[];
  createdAt: string;
}

export interface DayPlan {
  date: string;
  breakfast?: string;
  lunch?: string;
  snack?: string;
  proteinShake?: string;
  dinner?: string;
}

export interface WeekPlan {
  id: string;
  startDate: string;
  days: DayPlan[];
  aiGenerated?: boolean;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
  expiryDays?: number;
  buyByDate?: string;
  urgency?: 'today' | 'this-week' | 'anytime';
  notes?: string;
  forMeals?: string[];
}

export interface GroceryList {
  id: string;
  weekPlanId: string;
  weekStartDate: string;
  generatedAt: string;
  items: GroceryItem[];
}