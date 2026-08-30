import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type {
  Meal,
  WeekPlan,
  GroceryList,
  MealType,
  NutritionalValue,
  Ingredient,
  UserProfile,
  TrainingExercise,
  TrainingDay,
  WorkoutSession,
  TrainingBalance,
} from '../types';

interface AppContextType {
  meals: Meal[];
  weekPlans: WeekPlan[];
  groceryLists: GroceryList[];
  userProfile: UserProfile | null;
  trainingExercises: TrainingExercise[];
  trainingDays: TrainingDay[];
  workoutSessions: WorkoutSession[];
  trainingBalance: TrainingBalance | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  currentUserName: string | null;
  login: (username: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
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
  aiCategorize: (name: string, ingredients: string[]) => Promise<{
    category: string;
    primaryCategory: string;
    categories: string[];
    types: MealType[];
    vegetarian: boolean;
    lactoseFree: boolean;
  }>;
  aiCalculateNutrition: (name: string, ingredients: Ingredient[]) => Promise<NutritionalValue>;
  aiDraftMealFromLink: (link: string) => Promise<{
    name?: string;
    category?: string;
    types?: string[];
    score?: number;
    ingredients?: Array<{ name: string; amount: string; unit: string }>;
    steps?: string[];
    nutritionalValue?: NutritionalValue;
    image?: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    tags?: string[];
  }>;
  aiGenerateMealPlan: (weekStartDate: string) => Promise<WeekPlan>;
  aiGenerateGroceryList: (weekStartDate: string) => Promise<GroceryList>;
  getUserProfile: () => Promise<UserProfile | null>;
  saveUserProfile: (profile: Partial<UserProfile>) => Promise<UserProfile>;
  addTrainingExercise: (exercise: Omit<TrainingExercise, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TrainingExercise>;
  updateTrainingExercise: (exercise: TrainingExercise) => Promise<void>;
  deleteTrainingExercise: (id: string) => Promise<void>;
  loadTrainingRange: (from: string, to: string) => Promise<void>;
  saveTrainingDay: (day: Omit<TrainingDay, 'id'>) => Promise<TrainingDay>;
  deleteTrainingDay: (date: string) => Promise<void>;
  logWorkoutSession: (session: Omit<WorkoutSession, 'id' | 'createdAt'>) => Promise<WorkoutSession>;
  loadTrainingBalance: (from: string, to: string) => Promise<TrainingBalance>;
}

const AppContext = createContext<AppContextType | null>(null);

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
const SINGLE_USER_NAME = (import.meta as any).env?.VITE_SINGLE_USER_NAME || 'Borja';
const SINGLE_USER_EMAIL = (import.meta as any).env?.VITE_SINGLE_USER_EMAIL || 'borja@lifemanagement.local';
const ACCESS_TOKEN_KEY = 'lm_access_token';
const REFRESH_TOKEN_KEY = 'lm_refresh_token';
const USERNAME_KEY = 'lm_username';

function getStoredValue(key: string): string | null {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

function setStoredValue(key: string, value: string, remember: boolean) {
  if (remember) {
    localStorage.setItem(key, value);
    sessionStorage.removeItem(key);
  } else {
    sessionStorage.setItem(key, value);
    localStorage.removeItem(key);
  }
}

function clearStoredValue(key: string) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

async function refreshAuth(): Promise<boolean> {
  const refreshToken = getStoredValue(REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;

  const remember = localStorage.getItem(REFRESH_TOKEN_KEY) !== null;
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
  setStoredValue(ACCESS_TOKEN_KEY, data.accessToken, remember);
  setStoredValue(REFRESH_TOKEN_KEY, data.refreshToken, remember);
  return true;
}

async function authFetch(path: string, init: RequestInit = {}) {
  const accessToken = getStoredValue(ACCESS_TOKEN_KEY);
  if (!accessToken) throw new Error('Not authenticated');

  const doFetch = async (token?: string) => fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  let response = await doFetch(accessToken);
  if (response.status === 401) {
    const refreshed = await refreshAuth();
    if (refreshed) {
      response = await doFetch(getStoredValue(ACCESS_TOKEN_KEY) || undefined);
    }
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [weekPlans, setWeekPlans] = useState<WeekPlan[]>([]);
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [trainingExercises, setTrainingExercises] = useState<TrainingExercise[]>([]);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [trainingBalance, setTrainingBalance] = useState<TrainingBalance | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

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

  const saveTrainingDayLocal = useCallback((day: TrainingDay) => {
    setTrainingDays((prev) => {
      const exists = prev.find((item) => item.date === day.date);
      if (!exists) return [...prev, day].sort((a, b) => a.date.localeCompare(b.date));
      return prev.map((item) => (item.date === day.date ? day : item)).sort((a, b) => a.date.localeCompare(b.date));
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

  const loadInitialData = useCallback(async () => {
    const mealsRes = await authFetch('/meals');
    setMeals(mealsRes || []);
    const profileRes = await authFetch('/profile/me');
    setUserProfile(profileRes || null);
    const exerciseRes = await authFetch('/training/exercises');
    setTrainingExercises(exerciseRes || []);

    const today = new Date();
    const monday = new Date(today);
    const day = monday.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(monday.getDate() + diff);

    const weekStarts: string[] = [];
    for (let index = -2; index <= 2; index++) {
      const week = new Date(monday);
      week.setDate(week.getDate() + index * 7);
      weekStarts.push(week.toISOString().slice(0, 10));
    }

    for (const weekStart of weekStarts) {
      await loadWeekPlan(weekStart);
      await loadGrocery(weekStart);
    }
    const trainingFrom = weekStarts[0];
    const trainingToDate = new Date(`${weekStarts[weekStarts.length - 1]}T00:00:00`);
    trainingToDate.setDate(trainingToDate.getDate() + 6);
    const trainingTo = trainingToDate.toISOString().slice(0, 10);
    const [daysRes, sessionsRes, balanceRes] = await Promise.all([
      authFetch(`/training/schedule?from=${trainingFrom}&to=${trainingTo}`),
      authFetch(`/training/sessions?from=${trainingFrom}&to=${trainingTo}`),
      authFetch(`/training/balance?from=${trainingFrom}&to=${trainingTo}`),
    ]);
    setTrainingDays(daysRes || []);
    setWorkoutSessions(sessionsRes || []);
    setTrainingBalance(balanceRes || null);
  }, [loadWeekPlan, loadGrocery]);

  useEffect(() => {
    (async () => {
      const token = getStoredValue(ACCESS_TOKEN_KEY);
      const rememberedUser = getStoredValue(USERNAME_KEY);
      if (!token) {
        setAuthLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setCurrentUserName(rememberedUser || SINGLE_USER_NAME);

      try {
        await loadInitialData();
      } catch (error) {
        console.error(error);
        clearStoredValue(ACCESS_TOKEN_KEY);
        clearStoredValue(REFRESH_TOKEN_KEY);
        clearStoredValue(USERNAME_KEY);
        setIsAuthenticated(false);
        setCurrentUserName(null);
      } finally {
        setAuthLoading(false);
      }
    })();
  }, [loadInitialData]);

  const login = useCallback(async (username: string, password: string, remember: boolean) => {
    if (username !== SINGLE_USER_NAME) {
      throw new Error('Invalid user');
    }

    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: SINGLE_USER_EMAIL, password }),
    });

    if (!loginRes.ok) {
      throw new Error('Invalid credentials');
    }
    const data = await loginRes.json();

    setStoredValue(ACCESS_TOKEN_KEY, data.accessToken, remember);
    setStoredValue(REFRESH_TOKEN_KEY, data.refreshToken, remember);
    setStoredValue(USERNAME_KEY, username, remember);

    setIsAuthenticated(true);
    setCurrentUserName(username);
    await loadInitialData();
  }, [loadInitialData]);

  const logout = useCallback(() => {
    clearStoredValue(ACCESS_TOKEN_KEY);
    clearStoredValue(REFRESH_TOKEN_KEY);
    clearStoredValue(USERNAME_KEY);
    setMeals([]);
    setWeekPlans([]);
    setGroceryLists([]);
    setTrainingExercises([]);
    setTrainingDays([]);
    setWorkoutSessions([]);
    setTrainingBalance(null);
    setIsAuthenticated(false);
    setCurrentUserName(null);
  }, []);

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

  const aiCategorize = useCallback(async (name: string, ingredients: string[]) => {
    const result = await authFetch('/meals/ai/categorize', {
      method: 'POST',
      body: JSON.stringify({ name, ingredients }),
    });
    return result as {
      category: string;
      primaryCategory: string;
      categories: string[];
      types: MealType[];
      vegetarian: boolean;
      lactoseFree: boolean;
    };
  }, []);

  const aiCalculateNutrition = useCallback(async (name: string, ingredients: Ingredient[]): Promise<NutritionalValue> => {
    const result = await authFetch('/meals/ai/nutrition', {
      method: 'POST',
      body: JSON.stringify({
        name,
        ingredients: ingredients.map((item) => ({ name: item.name, amount: item.amount, unit: item.unit })),
      }),
    });
    return result as NutritionalValue;
  }, []);

  const aiDraftMealFromLink = useCallback(async (link: string) => {
    const result = await authFetch('/meals/ai/from-link', {
      method: 'POST',
      body: JSON.stringify({ link }),
    });
    return result as {
      name?: string;
      category?: string;
      types?: string[];
      score?: number;
      ingredients?: Array<{ name: string; amount: string; unit: string }>;
      steps?: string[];
      nutritionalValue?: NutritionalValue;
      image?: string;
      prepTime?: number;
      cookTime?: number;
      servings?: number;
      tags?: string[];
    };
  }, []);

  const getUserProfile = useCallback(async () => {
    const profile = await authFetch('/profile/me');
    setUserProfile(profile as UserProfile);
    return profile as UserProfile;
  }, []);

  const saveUserProfile = useCallback(async (profile: Partial<UserProfile>) => {
    const updated = await authFetch('/profile/me', {
      method: 'PATCH',
      body: JSON.stringify(profile),
    });
    setUserProfile(updated as UserProfile);
    return updated as UserProfile;
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

  const addTrainingExercise = useCallback(async (exercise: Omit<TrainingExercise, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await authFetch('/training/exercises', { method: 'POST', body: JSON.stringify(exercise) });
    setTrainingExercises((prev) => [created as TrainingExercise, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
    return created as TrainingExercise;
  }, []);

  const updateTrainingExercise = useCallback(async (exercise: TrainingExercise) => {
    const updated = await authFetch(`/training/exercises/${exercise.id}`, { method: 'PATCH', body: JSON.stringify(exercise) });
    setTrainingExercises((prev) => prev.map((item) => (item.id === exercise.id ? updated as TrainingExercise : item)).sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  const deleteTrainingExercise = useCallback(async (id: string) => {
    await authFetch(`/training/exercises/${id}`, { method: 'DELETE' });
    setTrainingExercises((prev) => prev.filter((item) => item.id !== id));
    setTrainingDays((prev) => prev.map((day) => ({ ...day, exercises: day.exercises.filter((item) => item.exerciseId !== id) })));
  }, []);

  const loadTrainingRange = useCallback(async (from: string, to: string) => {
    const [daysRes, sessionsRes] = await Promise.all([
      authFetch(`/training/schedule?from=${from}&to=${to}`),
      authFetch(`/training/sessions?from=${from}&to=${to}`),
    ]);
    setTrainingDays(daysRes || []);
    setWorkoutSessions(sessionsRes || []);
  }, []);

  const saveTrainingDay = useCallback(async (day: Omit<TrainingDay, 'id'>) => {
    const saved = await authFetch('/training/schedule', { method: 'POST', body: JSON.stringify(day) });
    saveTrainingDayLocal(saved as TrainingDay);
    return saved as TrainingDay;
  }, [saveTrainingDayLocal]);

  const deleteTrainingDay = useCallback(async (date: string) => {
    await authFetch(`/training/schedule/${date}`, { method: 'DELETE' });
    setTrainingDays((prev) => prev.filter((item) => item.date !== date));
  }, []);

  const logWorkoutSession = useCallback(async (session: Omit<WorkoutSession, 'id' | 'createdAt'>) => {
    const saved = await authFetch('/training/sessions', { method: 'POST', body: JSON.stringify(session) });
    setWorkoutSessions((prev) => [saved as WorkoutSession, ...prev]);
    if (session.trainingDayId) {
      setTrainingDays((prev) => prev.map((day) => (day.id === session.trainingDayId ? { ...day, status: (session.status || 'completed') as any } : day)));
    }
    return saved as WorkoutSession;
  }, []);

  const loadTrainingBalance = useCallback(async (from: string, to: string) => {
    const balance = await authFetch(`/training/balance?from=${from}&to=${to}`);
    setTrainingBalance(balance as TrainingBalance);
    return balance as TrainingBalance;
  }, []);

  return (
    <AppContext.Provider
      value={{
        meals,
        weekPlans,
        groceryLists,
        userProfile,
        trainingExercises,
        trainingDays,
        workoutSessions,
        trainingBalance,
        isAuthenticated,
        authLoading,
        currentUserName,
        login,
        logout,
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
        aiDraftMealFromLink,
        aiGenerateMealPlan,
        aiGenerateGroceryList,
        getUserProfile,
        saveUserProfile,
        addTrainingExercise,
        updateTrainingExercise,
        deleteTrainingExercise,
        loadTrainingRange,
        saveTrainingDay,
        deleteTrainingDay,
        logWorkoutSession,
        loadTrainingBalance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
