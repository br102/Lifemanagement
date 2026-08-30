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
  meals: Array<{ id: string; name: string; types: string[]; category: string }>;
  profile?: {
    displayName?: string | null;
    weightKg?: number | null;
    heightCm?: number | null;
    age?: number | null;
    sex?: string | null;
    activityLevel?: string | null;
    fitnessGoal?: string | null;
    goalNotes?: string | null;
    dietaryPreferences?: string[];
    allergies?: string[];
    dislikes?: string[];
    targetCalories?: number | null;
    targetProtein?: number | null;
    targetCarbs?: number | null;
    targetFat?: number | null;
    mealsPerDay?: number | null;
  };
}

export interface GrocerySuggestion {
  category: string;
  itemName: string;
  recommendedPurchaseDate?: string;
  estimatedExpirationDate?: string;
}

export interface ReceiptItemSuggestion {
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface ReceiptParseResult {
  store: string;
  purchaseDate: string;
  totalAmount?: number;
  items: ReceiptItemSuggestion[];
}

export interface MealDraftSuggestion {
  name?: string;
  category?: string;
  types?: string[];
  score?: number;
  ingredients?: Array<{ name: string; amount: string; unit: string }>;
  steps?: string[];
  nutritionalValue?: NutritionResult;
  image?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  tags?: string[];
}

export interface AiProvider {
  classifyMeal(name: string, ingredients: string[]): Promise<MealClassification>;
  estimateNutrition(name: string, ingredients: Array<{ name: string; amount: string; unit: string }>): Promise<NutritionResult>;
  draftMealFromLink(link: string): Promise<MealDraftSuggestion>;
  generateWeekPlan(input: PlannerInput): Promise<Record<string, Partial<Record<'breakfast' | 'lunch' | 'snack' | 'proteinShake' | 'dinner', string>>>>;
  suggestGroceryMeta(items: Array<{ name: string; category: string }>): Promise<GrocerySuggestion[]>;
  parseReceipt(imageUrl: string, knownIngredientNames: string[]): Promise<ReceiptParseResult>;
}
