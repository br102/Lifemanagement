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

export interface UserProfile {
  id: string;
  email: string;
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
  createdAt: string;
  updatedAt: string;
}

export type TrainingDayStatus = 'planned' | 'completed' | 'skipped';

export interface TrainingExercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment?: string;
  difficulty?: string;
  instructions?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TrainingDayExercise {
  id?: string;
  exerciseId: string;
  sets?: number;
  reps?: number;
  durationMin?: number;
  targetWeight?: number;
  intensity?: string;
  notes?: string;
  exercise: TrainingExercise;
}

export interface TrainingDay {
  id: string;
  date: string;
  status: TrainingDayStatus;
  notes?: string;
  exercises: TrainingDayExercise[];
}

export interface WorkoutSessionExercise {
  id?: string;
  exerciseId: string;
  sets?: number;
  reps?: number;
  weight?: number;
  durationMin?: number;
  notes?: string;
  exercise: TrainingExercise;
}

export interface WorkoutSession {
  id: string;
  trainingDayId?: string;
  date: string;
  status: TrainingDayStatus;
  durationMin?: number;
  notes?: string;
  exercises: WorkoutSessionExercise[];
  createdAt: string;
}

export interface TrainingBalance {
  from?: string;
  to?: string;
  plannedWorkouts: number;
  completedWorkouts: number;
  skippedWorkouts: number;
  totalLoggedMinutes: number;
  plannedMuscleGroups: Record<string, number>;
  completedMuscleGroups: Record<string, number>;
  categoryDistribution: Record<string, number>;
  warnings: string[];
}

export interface ReceiptLineItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  unitPrice?: number;
}

export interface Receipt {
  id: string;
  store: string;
  imageUrl: string;
  purchaseDate: string;
  totalAmount?: number;
  currency: string;
  items: ReceiptLineItem[];
  createdAt: string;
}

export interface IngredientPrice {
  ingredientId: string;
  name: string;
  unitPrice: number;
  unit: string;
  purchaseDate: string;
  currency: string;
}

export interface MealCostEstimate {
  mealId: string;
  mealName: string;
  estimatedCost: number;
  currency: string;
  missingIngredients: string[];
}

export interface GroceryEstimate {
  totalCost: number;
  currency: string;
  missingItems: string[];
}
