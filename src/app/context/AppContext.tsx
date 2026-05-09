import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Meal, WeekPlan, GroceryList, GroceryItem, MealType, NutritionalValue, Ingredient } from '../types';
import { INITIAL_MEALS, INITIAL_WEEK_PLANS, INITIAL_GROCERY_LISTS } from '../data/mockData';
import { isVeggieMeal } from '../utils/veggieUtils';
import { format, addDays, parseISO } from 'date-fns';

interface AppContextType {
  meals: Meal[];
  weekPlans: WeekPlan[];
  groceryLists: GroceryList[];
  addMeal: (meal: Omit<Meal, 'id' | 'createdAt'>) => Meal;
  updateMeal: (meal: Meal) => void;
  deleteMeal: (id: string) => void;
  getWeekPlan: (weekStartDate: string) => WeekPlan | undefined;
  saveWeekPlan: (plan: WeekPlan) => void;
  addMealToSlot: (weekStartDate: string, date: string, slot: 'breakfast' | 'lunch' | 'snack' | 'dinner', mealId: string) => void;
  removeMealFromSlot: (weekStartDate: string, date: string, slot: 'breakfast' | 'lunch' | 'snack' | 'dinner') => void;
  getGroceryList: (weekStartDate: string) => GroceryList | undefined;
  saveGroceryList: (list: GroceryList) => void;
  toggleGroceryItem: (listId: string, itemId: string) => void;
  aiCategorize: (name: string, ingredients: string[]) => Promise<{ category: string; types: MealType[] }>;
  aiCalculateNutrition: (name: string, ingredients: Ingredient[]) => Promise<NutritionalValue>;
  aiGenerateMealPlan: (weekStartDate: string, veggiePrefs?: Set<string>) => Promise<WeekPlan>;
  aiGenerateGroceryList: (weekStartDate: string) => Promise<GroceryList>;
}

const AppContext = createContext<AppContextType | null>(null);

// AI Mock helpers
const categoryKeywords: Record<string, string[]> = {
  Italian: ['pasta', 'pizza', 'risotto', 'carbonara', 'arrabiata', 'pesto', 'tiramisu', 'lasagna'],
  Mediterranean: ['salad', 'hummus', 'falafel', 'greek', 'quinoa', 'olive', 'yogurt', 'tzatziki'],
  Asian: ['stir', 'fry', 'rice', 'noodle', 'sushi', 'wok', 'teriyaki', 'ramen', 'curry', 'tofu', 'sesame'],
  Mexican: ['taco', 'burrito', 'quesadilla', 'guacamole', 'salsa', 'enchilada', 'cilantro', 'pastor'],
  American: ['burger', 'sandwich', 'pancake', 'waffle', 'bbq', 'muffin', 'french toast', 'maple'],
  Healthy: ['bowl', 'smoothie', 'avocado', 'salmon', 'kale', 'spinach', 'detox', 'superfood', 'grain'],
};

const typeKeywords: Record<MealType, string[]> = {
  Breakfast: ['pancake', 'waffle', 'omelette', 'egg', 'toast', 'yogurt', 'smoothie', 'bowl', 'muffin', 'granola', 'porridge', 'cereal', 'french toast'],
  Lunch: ['salad', 'sandwich', 'soup', 'wrap', 'panini', 'caesar', 'minestrone'],
  Dinner: ['pasta', 'steak', 'chicken', 'fish', 'salmon', 'rice', 'taco', 'stir fry', 'curry', 'roast', 'burger', 'pizza'],
  Snack: ['yogurt', 'fruit', 'nuts', 'energy', 'smoothie', 'bowl', 'toast', 'avocado'],
};

const INGREDIENT_CATEGORIES: Record<string, string> = {
  lettuce: 'Produce', tomato: 'Produce', spinach: 'Produce', pepper: 'Produce',
  onion: 'Produce', garlic: 'Produce', lemon: 'Produce', lime: 'Produce',
  banana: 'Produce', berries: 'Produce', avocado: 'Produce', zucchini: 'Produce',
  carrot: 'Produce', celery: 'Produce', potato: 'Produce', asparagus: 'Produce',
  herb: 'Produce', cilantro: 'Produce', dill: 'Produce', parsley: 'Produce', ginger: 'Produce',
  pineapple: 'Produce', mushroom: 'Produce',
  chicken: 'Meat & Seafood', beef: 'Meat & Seafood', pork: 'Meat & Seafood',
  salmon: 'Meat & Seafood', tuna: 'Meat & Seafood', shrimp: 'Meat & Seafood', fish: 'Meat & Seafood',
  milk: 'Dairy & Eggs', egg: 'Dairy & Eggs', butter: 'Dairy & Eggs',
  cheese: 'Dairy & Eggs', parmesan: 'Dairy & Eggs', yogurt: 'Dairy & Eggs', cream: 'Dairy & Eggs',
  bread: 'Bakery & Grains', pasta: 'Bakery & Grains', rice: 'Bakery & Grains',
  flour: 'Bakery & Grains', tortilla: 'Bakery & Grains', quinoa: 'Bakery & Grains',
  granola: 'Bakery & Grains', sourdough: 'Bakery & Grains', crouton: 'Bakery & Grains',
  oil: 'Pantry & Spices', sauce: 'Pantry & Spices', soy: 'Pantry & Spices',
  honey: 'Pantry & Spices', maple: 'Pantry & Spices', sugar: 'Pantry & Spices',
  vanilla: 'Pantry & Spices', baking: 'Pantry & Spices', salt: 'Pantry & Spices',
  chili: 'Pantry & Spices', cumin: 'Pantry & Spices', paprika: 'Pantry & Spices',
  chia: 'Pantry & Spices', almond: 'Pantry & Spices', sesame: 'Pantry & Spices',
  'frozen berries': 'Frozen', 'frozen banana': 'Frozen',
};

function categorizeIngredient(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, cat] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (lower.includes(key)) return cat;
  }
  return 'Pantry & Spices';
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [meals, setMeals] = useState<Meal[]>(INITIAL_MEALS);
  const [weekPlans, setWeekPlans] = useState<WeekPlan[]>(INITIAL_WEEK_PLANS);
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>(INITIAL_GROCERY_LISTS);

  const addMeal = useCallback((mealData: Omit<Meal, 'id' | 'createdAt'>) => {
    const newMeal: Meal = {
      ...mealData,
      id: `meal-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMeals(prev => [newMeal, ...prev]);
    return newMeal;
  }, []);

  const updateMeal = useCallback((meal: Meal) => {
    setMeals(prev => prev.map(m => m.id === meal.id ? meal : m));
  }, []);

  const deleteMeal = useCallback((id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  }, []);

  const getWeekPlan = useCallback((weekStartDate: string) => {
    return weekPlans.find(p => p.startDate === weekStartDate);
  }, [weekPlans]);

  const saveWeekPlan = useCallback((plan: WeekPlan) => {
    setWeekPlans(prev => {
      const exists = prev.find(p => p.startDate === plan.startDate);
      if (exists) return prev.map(p => p.startDate === plan.startDate ? plan : p);
      return [...prev, plan];
    });
  }, []);

  const addMealToSlot = useCallback((weekStartDate: string, date: string, slot: 'breakfast' | 'lunch' | 'snack' | 'dinner', mealId: string) => {
    setWeekPlans(prev => {
      const plan = prev.find(p => p.startDate === weekStartDate);
      if (plan) {
        const days = plan.days.map(d => d.date === date ? { ...d, [slot]: mealId } : d);
        return prev.map(p => p.startDate === weekStartDate ? { ...p, days } : p);
      }
      // Create new plan
      const start = parseISO(weekStartDate);
      const newPlan: WeekPlan = {
        id: weekStartDate,
        startDate: weekStartDate,
        days: Array.from({ length: 7 }, (_, i) => ({
          date: format(addDays(start, i), 'yyyy-MM-dd'),
        })),
      };
      const days = newPlan.days.map(d => d.date === date ? { ...d, [slot]: mealId } : d);
      return [...prev, { ...newPlan, days }];
    });
  }, []);

  const removeMealFromSlot = useCallback((weekStartDate: string, date: string, slot: 'breakfast' | 'lunch' | 'snack' | 'dinner') => {
    setWeekPlans(prev => prev.map(p => {
      if (p.startDate !== weekStartDate) return p;
      const days = p.days.map(d => {
        if (d.date !== date) return d;
        const updated = { ...d };
        delete updated[slot];
        return updated;
      });
      return { ...p, days };
    }));
  }, []);

  const getGroceryList = useCallback((weekStartDate: string) => {
    return groceryLists.find(l => l.weekStartDate === weekStartDate);
  }, [groceryLists]);

  const saveGroceryList = useCallback((list: GroceryList) => {
    setGroceryLists(prev => {
      const exists = prev.find(l => l.weekStartDate === list.weekStartDate);
      if (exists) return prev.map(l => l.weekStartDate === list.weekStartDate ? list : l);
      return [...prev, list];
    });
  }, []);

  const toggleGroceryItem = useCallback((listId: string, itemId: string) => {
    setGroceryLists(prev => prev.map(list => {
      if (list.id !== listId) return list;
      return { ...list, items: list.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item) };
    }));
  }, []);

  // AI Mock Functions
  const aiCategorize = useCallback(async (name: string, ingredients: string[]): Promise<{ category: string; types: MealType[] }> => {
    await new Promise(r => setTimeout(r, 1500));
    const lower = name.toLowerCase();
    let category = 'Healthy';
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(k => lower.includes(k))) { category = cat; break; }
    }
    const types: MealType[] = [];
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(k => lower.includes(k))) types.push(type as MealType);
    }
    if (types.length === 0) types.push('Dinner');
    return { category, types };
  }, []);

  const aiCalculateNutrition = useCallback(async (name: string, ingredients: Ingredient[]): Promise<NutritionalValue> => {
    await new Promise(r => setTimeout(r, 2000));
    const calBase = 200 + Math.floor(Math.random() * 300);
    const proteinBase = 8 + Math.floor(Math.random() * 35);
    return {
      calories: calBase,
      protein: proteinBase,
      carbs: 20 + Math.floor(Math.random() * 60),
      fat: 5 + Math.floor(Math.random() * 25),
      fiber: 2 + Math.floor(Math.random() * 8),
      sugar: 3 + Math.floor(Math.random() * 20),
      sodium: 100 + Math.floor(Math.random() * 700),
    };
  }, []);

  const aiGenerateMealPlan = useCallback(async (weekStartDate: string, veggiePrefs?: Set<string>): Promise<WeekPlan> => {
    await new Promise(r => setTimeout(r, 2500));
    const start = parseISO(weekStartDate);
    const pick = (arr: string[], exclude: string[]) => {
      const available = arr.filter(id => !exclude.includes(id));
      return available[Math.floor(Math.random() * available.length)] || arr[0];
    };
    const existingPlan = weekPlans.find(p => p.startDate === weekStartDate);
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = format(addDays(start, i), 'yyyy-MM-dd');
      const existing = existingPlan?.days.find(d => d.date === date);
      const used: string[] = [];

      const getMealsForSlot = (slot: string, type: MealType): string[] => {
        const mustBeVeggie = veggiePrefs?.has(`${i}-${slot}`) ?? false;
        if (mustBeVeggie) {
          return meals.filter(m => m.types.includes(type) && isVeggieMeal(m)).map(m => m.id);
        }
        return meals.filter(m => m.types.includes(type)).map(m => m.id);
      };

      const breakfastMeals = getMealsForSlot('breakfast', 'Breakfast');
      const lunchMeals = getMealsForSlot('lunch', 'Lunch');
      const dinnerMeals = getMealsForSlot('dinner', 'Dinner');
      const snackMeals = getMealsForSlot('snack', 'Snack');

      const breakfast = existing?.breakfast || pick(breakfastMeals, used);
      if (breakfast) used.push(breakfast);
      const lunch = existing?.lunch || pick(lunchMeals, used);
      if (lunch) used.push(lunch);
      const dinner = existing?.dinner || pick(dinnerMeals, used);
      if (dinner) used.push(dinner);
      const snack = existing?.snack || pick(snackMeals, used);
      return { date, breakfast, lunch, snack, dinner };
    });
    return { id: weekStartDate, startDate: weekStartDate, days, aiGenerated: true };
  }, [meals, weekPlans]);

  const aiGenerateGroceryList = useCallback(async (weekStartDate: string): Promise<GroceryList> => {
    await new Promise(r => setTimeout(r, 3000));
    const plan = weekPlans.find(p => p.startDate === weekStartDate);
    if (!plan) throw new Error('No plan found');
    const allMealIds = plan.days.flatMap(d => [d.breakfast, d.lunch, d.snack, d.dinner].filter(Boolean) as string[]);
    const uniqueMealIds = [...new Set(allMealIds)];
    const planMeals = uniqueMealIds.map(id => meals.find(m => m.id === id)).filter(Boolean) as typeof meals;
    const ingredientMap: Map<string, { quantity: number; unit: string; forMeals: string[]; firstNeededDate: string }> = new Map();
    planMeals.forEach(meal => {
      const mealDay = plan.days.find(d => [d.breakfast, d.lunch, d.snack, d.dinner].includes(meal.id));
      const firstNeeded = mealDay?.date || weekStartDate;
      meal.ingredients.forEach(ing => {
        const key = ing.name.toLowerCase();
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          existing.forMeals.push(meal.name);
          if (firstNeeded < existing.firstNeededDate) existing.firstNeededDate = firstNeeded;
        } else {
          ingredientMap.set(key, { quantity: parseFloat(ing.amount) || 1, unit: ing.unit, forMeals: [meal.name], firstNeededDate: firstNeeded });
        }
      });
    });
    const today = format(new Date(), 'yyyy-MM-dd');
    const shelfLifeDays: Record<string, number> = { 'Meat & Seafood': 2, 'Produce': 4, 'Dairy & Eggs': 5, 'Bakery & Grains': 5, 'Pantry & Spices': 365, 'Frozen': 90 };
    const items: GroceryItem[] = Array.from(ingredientMap.entries()).map(([name, data], i) => {
      const category = categorizeIngredient(name);
      const shelfLife = shelfLifeDays[category] || 7;
      const neededDate = parseISO(data.firstNeededDate);
      const buyByDate = format(addDays(neededDate, -Math.max(1, Math.floor(shelfLife / 2))), 'yyyy-MM-dd');
      let urgency: GroceryItem['urgency'] = 'anytime';
      if (buyByDate <= today) urgency = 'today';
      else if (buyByDate <= format(addDays(parseISO(today), 4), 'yyyy-MM-dd')) urgency = 'this-week';
      return {
        id: `g-${Date.now()}-${i}`,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        quantity: data.quantity,
        unit: data.unit,
        category,
        checked: false,
        buyByDate,
        urgency,
        forMeals: [...new Set(data.forMeals)],
      };
    });
    return {
      id: `grocery-${Date.now()}`,
      weekPlanId: weekStartDate,
      weekStartDate,
      generatedAt: new Date().toISOString(),
      items: items.sort((a, b) => {
        const order = { today: 0, 'this-week': 1, anytime: 2 };
        return (order[a.urgency || 'anytime'] - order[b.urgency || 'anytime']);
      }),
    };
  }, [meals, weekPlans]);

  return (
    <AppContext.Provider value={{
      meals, weekPlans, groceryLists,
      addMeal, updateMeal, deleteMeal,
      getWeekPlan, saveWeekPlan, addMealToSlot, removeMealFromSlot,
      getGroceryList, saveGroceryList, toggleGroceryItem,
      aiCategorize, aiCalculateNutrition, aiGenerateMealPlan, aiGenerateGroceryList,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}