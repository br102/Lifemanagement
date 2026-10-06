import { useState, useEffect, useMemo } from 'react';
import { format, parseISO, subDays, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { DailyNutritionSummary, MealType, Meal } from '../../types';

function ProgressBar({ current, target, color }: { current: number; target: number; color: string }) {
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const isOver = current > target;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-300">{current}</span>
        <span className="text-gray-400">{target}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all ${isOver ? 'bg-red-400' : color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function MealTypeIcon({ type }: { type?: MealType }) {
  const icons: Record<string, string> = {
    Breakfast: '🌅',
    Lunch: '☀️',
    Dinner: '🌙',
    Snack: '🍎',
    'Protein Shake': '💪',
  };
  return icons[type || ''] || '🍽️';
}

export function NutritionLogPage() {
  const { getDaySummary, logMealEaten, logCustomFood, updateLogEntry, deleteLogEntry, meals, getWeekPlan } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [daySummary, setDaySummary] = useState<DailyNutritionSummary | null>(null);
  const [sevenDayData, setSevenDayData] = useState<DailyNutritionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ label: '', mealType: '', calories: '', protein: '', carbs: '', fat: '' });

  const todaysMeals = useMemo(() => {
    const weekStart = startOfWeek(parseISO(`${selectedDate}T00:00:00`), { weekStartsOn: 1 });
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const plan = getWeekPlan(weekStartStr);
    if (!plan) return [];

    const dayPlan = plan.days.find(d => d.date === selectedDate);
    if (!dayPlan) return [];

    const slots = ['breakfast', 'lunch', 'snack', 'proteinShake', 'dinner'] as const;
    const plannedMeals: (Meal & { mealType: MealType })[] = [];

    slots.forEach((slot) => {
      const mealId = dayPlan[slot];
      if (mealId) {
        const meal = meals.find(m => m.id === mealId);
        if (meal) {
          const mealTypeMap: Record<string, MealType> = {
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            snack: 'Snack',
            proteinShake: 'Protein Shake',
            dinner: 'Dinner',
          };
          plannedMeals.push({ ...meal, mealType: mealTypeMap[slot] });
        }
      }
    });

    return plannedMeals;
  }, [selectedDate, getWeekPlan, meals]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const summary = await getDaySummary(selectedDate);
        setDaySummary(summary);
      } catch (error) {
        console.error('Failed to load day summary:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedDate, getDaySummary]);

  useEffect(() => {
    (async () => {
      const data: DailyNutritionSummary[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i).toISOString().slice(0, 10);
        try {
          const summary = await getDaySummary(date);
          data.push(summary);
        } catch (error) {
          console.error(`Failed to load ${date}:`, error);
        }
      }
      setSevenDayData(data);
    })();
  }, [getDaySummary]);

  const handleAddMeal = async () => {
    if (!newEntry.label) return;
    await logCustomFood({
      label: newEntry.label,
      mealType: (newEntry.mealType || undefined) as MealType | undefined,
      calories: newEntry.calories ? parseInt(newEntry.calories) : undefined,
      protein: newEntry.protein ? parseInt(newEntry.protein) : undefined,
      carbs: newEntry.carbs ? parseInt(newEntry.carbs) : undefined,
      fat: newEntry.fat ? parseInt(newEntry.fat) : undefined,
    });
    setNewEntry({ label: '', mealType: '', calories: '', protein: '', carbs: '', fat: '' });
    setShowAddModal(false);
    const summary = await getDaySummary(selectedDate);
    setDaySummary(summary);
  };

  const handleAddPlannedMeal = async (meal: Meal & { mealType: MealType }) => {
    await logCustomFood({
      label: meal.name,
      mealType: meal.mealType,
      calories: meal.nutritionalValue.calories,
      protein: meal.nutritionalValue.protein,
      carbs: meal.nutritionalValue.carbs,
      fat: meal.nutritionalValue.fat,
    });
    setShowAddModal(false);
    const summary = await getDaySummary(selectedDate);
    setDaySummary(summary);
  };

  const handleDeleteEntry = async (id: string) => {
    await deleteLogEntry(id);
    const summary = await getDaySummary(selectedDate);
    setDaySummary(summary);
  };

  if (loading || !daySummary) return <div className="p-6">Loading...</div>;

  const dateObj = parseISO(`${selectedDate}T00:00:00`);
  const displayDate = format(dateObj, 'EEEE, MMMM d, yyyy');
  const entriesByType = daySummary.entries.reduce(
    (acc, entry) => {
      const type = entry.mealType || 'Other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(entry);
      return acc;
    },
    {} as Record<string, typeof daySummary.entries>,
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Date picker and header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Nutrition Tracker</h1>
          <p className="text-gray-500 dark:text-gray-400">{displayDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(format(subDays(parseISO(`${selectedDate}T00:00:00`), 1), 'yyyy-MM-dd'))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
            className="px-3 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-medium"
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDate(format(parseISO(`${selectedDate}T00:00:00`), 'yyyy-MM-dd'))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Daily Summary */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-amber-50 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Today's Summary</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Calories</label>
              <ProgressBar current={daySummary.totals.calories} target={daySummary.targets.calories || 0} color="bg-amber-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{daySummary.remaining.calories > 0 ? '↓' : '↑'} {Math.abs(daySummary.remaining.calories)} remaining</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Protein</label>
              <ProgressBar current={daySummary.totals.protein} target={daySummary.targets.protein || 0} color="bg-green-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{daySummary.remaining.protein > 0 ? '↓' : '↑'} {Math.abs(daySummary.remaining.protein)}g remaining</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Carbs</label>
              <ProgressBar current={daySummary.totals.carbs} target={daySummary.targets.carbs || 0} color="bg-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fat</label>
              <ProgressBar current={daySummary.totals.fat} target={daySummary.targets.fat || 0} color="bg-purple-400" />
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-amber-50 dark:border-gray-700 space-y-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Entries</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{daySummary.entries.length}</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-white rounded-xl py-3 font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Food
          </button>
        </div>
      </div>

      {/* Entries by meal type */}
      <div className="space-y-4 mb-8">
        {Object.entries(entriesByType).map(([type, entries]) => (
          <div key={type} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-amber-50 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span>{MealTypeIcon({ type } as any)}</span> {type}
            </h4>
            <div className="space-y-2">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{entry.label}</p>
                    {entry.quantity !== 1 && <p className="text-xs text-gray-500 dark:text-gray-400">×{entry.quantity}</p>}
                    <p className="text-xs text-gray-500 dark:text-gray-400">{entry.calories} kcal • {entry.protein}g protein</p>
                    {entry.notes && <p className="text-xs text-gray-600 dark:text-gray-300 italic mt-1">{entry.notes}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="ml-3 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 7-day trend */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-amber-50 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">7-Day Trend</h3>
        <div className="grid grid-cols-7 gap-3">
          {sevenDayData.map((day) => (
            <div key={day.date} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-center">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-3">{format(parseISO(`${day.date}T00:00:00`), 'EEE')}</p>
              <div className="space-y-2 mb-3">
                <div>
                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-600 mb-1">
                    <div
                      className={`h-1.5 rounded-full ${
                        day.totals.calories > (day.targets.calories || 0) ? 'bg-red-400' : 'bg-amber-400'
                      }`}
                      style={{
                        width: `${Math.min((day.totals.calories / (day.targets.calories || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{day.totals.calories}</p>
                </div>
                <div>
                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-600 mb-1">
                    <div
                      className={`h-1.5 rounded-full ${
                        day.totals.protein > (day.targets.protein || 0) ? 'bg-green-400' : 'bg-green-300'
                      }`}
                      style={{
                        width: `${Math.min((day.totals.protein / (day.targets.protein || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{day.totals.protein}g</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">{day.entries.length} entries</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add food modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Log Food</h3>

            {todaysMeals.length > 0 && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase">Today's Planned Meals</p>
                <div className="space-y-2">
                  {todaysMeals.map((meal) => (
                    <button
                      key={meal.id}
                      onClick={() => handleAddPlannedMeal(meal)}
                      className="w-full text-left p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{meal.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{meal.nutritionalValue.calories} kcal • {meal.nutritionalValue.protein}g protein</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase">Or Add Custom Food</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Food name</label>
                <input
                  type="text"
                  value={newEntry.label}
                  onChange={(e) => setNewEntry((p) => ({ ...p, label: e.target.value }))}
                  placeholder="e.g., Apple, Coffee with milk"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Calories</label>
                  <input
                    type="number"
                    value={newEntry.calories}
                    onChange={(e) => setNewEntry((p) => ({ ...p, calories: e.target.value }))}
                    placeholder="0"
                    min="0"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={newEntry.protein}
                    onChange={(e) => setNewEntry((p) => ({ ...p, protein: e.target.value }))}
                    placeholder="0"
                    min="0"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMeal}
                  disabled={!newEntry.label}
                  className="flex-1 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-white font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
