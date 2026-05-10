import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Meal, WeekPlan, GroceryList, MealType, NutritionalValue, Ingredient } from '../types';

interface AppContextType {
  meals: Meal[];
  weekPlans: WeekPlan[];
  groceryLists: GroceryList[];
  addMeal: (meal: Omit<Meal, 'id' | 'createdAt'>) => Promise<Meal>;
  updateMeal: (meal: Meal) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  getWeekPlan: (weekStartDate: string) => WeekPlan | undefined;
  saveWeekPlan: (plan: WeekPlan) => void;
  addMealToSlot: (weekStartDate: string, date: string, slot: 'breakfast' | 'lunch' | 'snack' | 'proteinShake' | 'dinner', mealId: string) => Promise<void>;
  removeMealFromSlot: (weekStartDate: string, date: string, slot: 'breakfast' | 'lunch' | 'snack' | 'proteinShake' | 'dinner') => Promise<void>;
  getGroceryList: (weekStartDate: string) => GroceryList | undefined;
  saveGroceryList: (list: GroceryList) => void;
  toggleGroceryItem: (listId: string, itemId: string) => Promise<void>;
  aiCategorize: (name: string, ingredients: string[]) => Promise<{ category: string; types: MealType[] }>;
  aiCalculateNutrition: (name: string, ingredients: Ingredient[]) => Promise<NutritionalValue>;
  aiGenerateMealPlan: (weekStartDate: string, veggiePrefs?: Set<string>) => Promise<WeekPlan>;
  aiGenerateGroceryList: (weekStartDate: string) => Promise<GroceryList>;
}

const AppContext = createContext<AppContextType | null>(null);

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
const DEMO_EMAIL = 'demo@lifemanagement.local';
const DEMO_PASSWORD = 'DemoPass123!';

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
  'Protein Shake': ['shake', 'protein', 'whey', 'casein', 'pea protein', 'plant protein', 'post-workout', 'recovery shake'],
};

async function authFetch(path: string, init: RequestInit = {}) {
  let accessToken = localStorage.getItem('lm_access_token');
  if (!accessToken) {
    await bootstrapAuth();
    accessToken = localStorage.getItem('lm_access_token');
  }

  const doFetch = async (token?: string) => fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  let response = await doFetch(accessToken || undefined);
  if (response.status === 401) {
    const refreshed = await refreshAuth();
    if (refreshed) {
      response = await doFetch(localStorage.getItem('lm_access_token') || undefined);
    }
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function bootstrapAuth() {
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
  });

  let data: any;
  if (loginRes.ok) {
    data = await loginRes.json();
  } else {
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
    });
    if (!registerRes.ok) throw new Error('Unable to bootstrap auth');
    data = await registerRes.json();
  }

  localStorage.setItem('lm_access_token', data.accessToken);
  localStorage.setItem('lm_refresh_token', data.refreshToken);
}

async function refreshAuth() {
  const refreshToken = localStorage.getItem('lm_refresh_token');
  if (!refreshToken) return false;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${refreshToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return false;
  const data = await res.json();
  localStorage.setItem('lm_access_token', data.accessToken);
  localStorage.setItem('lm_refresh_token', data.refreshToken);
  return true;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [weekPlans, setWeekPlans] = useState<WeekPlan[]>([]);
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([]);

  const getWeekPlan = useCallback((weekStartDate: string) => weekPlans.find((p) => p.startDate === weekStartDate), [weekPlans]);
  const getGroceryList = useCallback((weekStartDate: string) => groceryLists.find((l) => l.weekStartDate === weekStartDate), [groceryLists]);

  const saveWeekPlan = useCallback((plan: WeekPlan) => {
    setWeekPlans((prev) => {
      const exists = prev.find((p) => p.startDate === plan.startDate);
      if (!exists) return [...prev, plan];
      return prev.map((p) => (p.startDate === plan.startDate ? plan : p));
    });
  }, []);

  const saveGroceryList = useCallback((list: GroceryList) => {
    setGroceryLists((prev) => {
      const exists = prev.find((l) => l.weekStartDate === list.weekStartDate);
      if (!exists) return [...prev, list];
      return prev.map((l) => (l.weekStartDate === list.weekStartDate ? list : l));
    });
  }, []);

  const loadWeekPlan = useCallback(async (weekStartDate: string) => {
    const plan = await authFetch(`/planner/week/${weekStartDate}`);
    saveWeekPlan(plan);
    return plan as WeekPlan;
  }, [saveWeekPlan]);

  const loadGrocery = useCallback(async (weekStartDate: string) => {
    const list = await authFetch(`/groceries/${weekStartDate}`);
    if (list) saveGroceryList(list);
  }, [saveGroceryList]);

  useEffect(() => {
    (async () => {
      try {
        await bootstrapAuth();
        const mealsRes = await authFetch('/meals');
        setMeals(mealsRes || []);

        const today = new Date();
        const monday = new Date(today);
        const d = monday.getDay();
        const diff = d === 0 ? -6 : 1 - d;
        monday.setDate(monday.getDate() + diff);

        const weekStarts: string[] = [];
        for (let i = -2; i <= 2; i++) {
          const w = new Date(monday);
          w.setDate(w.getDate() + i * 7);
          weekStarts.push(w.toISOString().slice(0, 10));
        }

        for (const ws of weekStarts) {
          await loadWeekPlan(ws);
          await loadGrocery(ws);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [loadWeekPlan, loadGrocery]);

  const addMeal = useCallback(async (mealData: Omit<Meal, 'id' | 'createdAt'>) => {
    const created = await authFetch('/meals', { method: 'POST', body: JSON.stringify(mealData) });
    setMeals((prev) => [created, ...prev]);
    return created as Meal;
  }, []);

  const updateMeal = useCallback(async (meal: Meal) => {
    const updated = await authFetch(`/meals/${meal.id}`, { method: 'PATCH', body: JSON.stringify(meal) });
    setMeals((prev) => prev.map((m) => (m.id === meal.id ? updated : m)));
  }, []);

  const deleteMeal = useCallback(async (id: string) => {
    await authFetch(`/meals/${id}`, { method: 'DELETE' });
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addMealToSlot = useCallback(async (weekStartDate: string, date: string, slot: 'breakfast' | 'lunch' | 'snack' | 'proteinShake' | 'dinner', mealId: string) => {
    const plan = await authFetch(`/planner/week/${weekStartDate}/slot`, {
      method: 'POST',
      body: JSON.stringify({ date, slot, mealId }),
    });
    saveWeekPlan(plan as WeekPlan);
  }, [saveWeekPlan]);

  const removeMealFromSlot = useCallback(async (weekStartDate: string, date: string, slot: 'breakfast' | 'lunch' | 'snack' | 'proteinShake' | 'dinner') => {
    const plan = await authFetch(`/planner/week/${weekStartDate}/slot`, {
      method: 'POST',
      body: JSON.stringify({ date, slot }),
    });
    saveWeekPlan(plan as WeekPlan);
  }, [saveWeekPlan]);

  const toggleGroceryItem = useCallback(async (listId: string, itemId: string) => {
    const list = groceryLists.find((l) => l.id === listId);
    if (!list) return;
    const updated = await authFetch(`/groceries/${listId}/items/${itemId}/toggle`, { method: 'PATCH' });
    saveGroceryList(updated as GroceryList);
  }, [groceryLists, saveGroceryList]);

  const aiCategorize = useCallback(async (name: string): Promise<{ category: string; types: MealType[] }> => {
    const lower = name.toLowerCase();
    let category = 'Healthy';
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((k) => lower.includes(k))) {
        category = cat;
        break;
      }
    }

    const types: MealType[] = [];
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some((k) => lower.includes(k))) types.push(type as MealType);
    }
    if (types.length === 0) types.push('Dinner');
    return { category, types };
  }, []);

  const aiCalculateNutrition = useCallback(async (): Promise<NutritionalValue> => {
    return { calories: 350, protein: 24, carbs: 32, fat: 11, fiber: 5, sugar: 8, sodium: 320 };
  }, []);

  const aiGenerateMealPlan = useCallback(async (weekStartDate: string) => {
    const plan = await authFetch(`/planner/week/${weekStartDate}/ai-generate`, { method: 'POST' });
    saveWeekPlan(plan as WeekPlan);
    return plan as WeekPlan;
  }, [saveWeekPlan]);

  const aiGenerateGroceryList = useCallback(async (weekStartDate: string) => {
    const list = await authFetch(`/groceries/${weekStartDate}/generate`, { method: 'POST' });
    saveGroceryList(list as GroceryList);
    return list as GroceryList;
  }, [saveGroceryList]);

  return (
    <AppContext.Provider
      value={{
        meals,
        weekPlans,
        groceryLists,
        addMeal,
        updateMeal,
        deleteMeal,
        getWeekPlan,
        saveWeekPlan,
        addMealToSlot,
        removeMealFromSlot,
        getGroceryList,
        saveGroceryList,
        toggleGroceryItem,
        aiCategorize,
        aiCalculateNutrition,
        aiGenerateMealPlan,
        aiGenerateGroceryList,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
