import { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Sparkles, Loader2, Plus, X, Search,
  CalendarDays, LayoutGrid, Check, Pencil,
} from 'lucide-react';
import {
  format, addDays, addWeeks, startOfWeek, parseISO,
  isSameMonth, getDay, startOfMonth, endOfMonth, eachDayOfInterval, isToday,
} from 'date-fns';
import { useApp } from '../../context/AppContext';
import { MealDetailModal } from '../meals/MealDetailModal';
import type { Meal, MealType } from '../../types';

const TYPE_COLORS: Record<string, string> = {
  Breakfast: 'border-l-orange-400 bg-orange-50 dark:bg-orange-900/20',
  Lunch: 'border-l-green-400 bg-green-50 dark:bg-green-900/20',
  Dinner: 'border-l-blue-400 bg-blue-50 dark:bg-blue-900/20',
  Snack: 'border-l-purple-400 bg-purple-50 dark:bg-purple-900/20',
  'Protein Shake': 'border-l-pink-400 bg-pink-50 dark:bg-pink-900/20',
};

const TYPE_BADGE: Record<string, string> = {
  Breakfast: 'bg-orange-100 text-orange-700',
  Lunch: 'bg-green-100 text-green-700',
  Dinner: 'bg-blue-100 text-blue-700',
  Snack: 'bg-purple-100 text-purple-700',
  'Protein Shake': 'bg-pink-100 text-pink-700',
};

const SLOTS = ['breakfast', 'lunch', 'snack', 'proteinShake', 'dinner'] as const;
type Slot = typeof SLOTS[number];
const SLOT_LABELS: Record<Slot, string> = { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack', proteinShake: 'Protein Shake', dinner: 'Dinner' };
const SLOT_EMOJIS: Record<Slot, string> = { breakfast: '🌅', lunch: '☀️', snack: '🍎', proteinShake: '💪', dinner: '🌙' };
const SLOT_TYPES: Record<Slot, MealType> = { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack', proteinShake: 'Protein Shake', dinner: 'Dinner' };
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Slot Picker ──────────────────────────────────────────────────────────────

interface SlotPickerProps {
  slot: Slot;
  weekStart: string;
  date: string;
  mealId?: string;
  onClose: () => void;
}

function SlotPicker({ slot, weekStart, date, mealId, onClose }: SlotPickerProps) {
  const { meals, addMealToSlot, removeMealFromSlot } = useApp();
  const [search, setSearch] = useState('');
  const slotType = SLOT_TYPES[slot];
  const relevant = meals.filter(m => m.types.includes(slotType));
  const filtered = relevant.filter(m => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-gray-900 dark:text-white" style={{ fontWeight: 600 }}>Choose for {SLOT_LABELS[slot]}</h3>
            <p className="text-gray-400 dark:text-gray-500 text-xs">{format(parseISO(date), 'EEEE, MMM d')}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-3 border-b border-gray-100 dark:border-gray-700 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search meals..." className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {mealId && (
            <button onClick={() => { removeMealFromSlot(weekStart, date, slot); onClose(); }}
              className="w-full p-2.5 rounded-xl border-2 border-dashed border-red-200 dark:border-red-800 text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              Remove current meal
            </button>
          )}
          {filtered.map(meal => (
            <button key={meal.id} onClick={() => { addMealToSlot(weekStart, date, slot, meal.id); onClose(); }}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-gray-700 transition-colors text-left ${meal.id === mealId ? 'bg-amber-50 dark:bg-gray-700 ring-2 ring-amber-400' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
              {meal.image ? (
                <img src={meal.image} alt={meal.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                  <span style={{ fontSize: '1.2rem' }}>🍽️</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-gray-800 dark:text-gray-200 text-sm truncate" style={{ fontWeight: 500 }}>{meal.name}</p>
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-xs">{meal.nutritionalValue.calories} kcal · {meal.category}</p>
              </div>
              {meal.id === mealId && <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-4">
              No {slotType} meals found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Week View ─────────────────────────────────────────────────────────────────

interface DailyNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function WeekView({ weekStart, onMealClick }: { weekStart: Date; onMealClick: (meal: Meal) => void }) {
  const { meals, getWeekPlan } = useApp();
  const [pickerInfo, setPickerInfo] = useState<{ slot: Slot; date: string; mealId?: string } | null>(null);

  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const plan = getWeekPlan(weekStartStr);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getMeal = (id?: string) => id ? meals.find(m => m.id === id) : undefined;
  const getDayPlan = (date: Date) => plan?.days.find(d => d.date === format(date, 'yyyy-MM-dd'));

  const calculateDailyNutrients = (date: Date): DailyNutrients => {
    const dayPlan = getDayPlan(date);
    if (!dayPlan) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    SLOTS.forEach(slot => {
      const mealId = dayPlan[slot];
      const meal = getMeal(mealId);
      if (meal) {
        totals.calories += meal.nutritionalValue.calories;
        totals.protein += meal.nutritionalValue.protein || 0;
        totals.carbs += meal.nutritionalValue.carbs || 0;
        totals.fat += meal.nutritionalValue.fat || 0;
      }
    });
    return totals;
  };

  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Day headers with daily totals */}
          <div className="grid grid-cols-8 gap-2 mb-3">
            <div />
            {days.map(day => {
              const nutrients = calculateDailyNutrients(day);
              return (
                <div key={day.toISOString()} className={`text-center rounded-xl py-2.5 ${isToday(day) ? 'bg-amber-400 text-white' : 'bg-white dark:bg-gray-700/50 text-gray-600 dark:text-gray-400'}`}>
                  <p style={{ fontSize: '0.7rem' }} className="opacity-70">{DAY_LABELS[getDay(day) === 0 ? 6 : getDay(day) - 1]}</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{format(day, 'd')}</p>
                  {isToday(day) && <p style={{ fontSize: '0.55rem' }} className="opacity-80">TODAY</p>}
                  {nutrients.calories > 0 && (
                    <div className="mt-1.5 pt-1.5 border-t border-gray-300 dark:border-gray-600 opacity-80">
                      <p style={{ fontSize: '0.7rem', fontWeight: 600 }}>{nutrients.calories} kcal</p>
                      <p style={{ fontSize: '0.6rem' }} className="opacity-75">{nutrients.protein?.toFixed(0)}p · {nutrients.carbs?.toFixed(0)}c · {nutrients.fat?.toFixed(0)}f</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Meal slots */}
          {SLOTS.map(slot => (
            <div key={slot} className="grid grid-cols-8 gap-2 mb-2">
              <div className="flex flex-col items-center justify-center py-2">
                <span style={{ fontSize: '1rem' }}>{SLOT_EMOJIS[slot]}</span>
                <span style={{ fontSize: '0.65rem' }} className="text-gray-400 dark:text-gray-500 mt-0.5">{SLOT_LABELS[slot]}</span>
              </div>
              {days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayPlan = getDayPlan(day);
                const mealId = dayPlan?.[slot];
                const meal = getMeal(mealId);

                return (
                  <div
                    key={dateStr}
                    onClick={() => meal ? onMealClick(meal) : setPickerInfo({ slot, date: dateStr, mealId })}
                    className={`relative min-h-[80px] rounded-xl cursor-pointer transition-all hover:shadow-md group ${
                      meal
                        ? `border-l-4 ${TYPE_COLORS[SLOT_LABELS[slot]]} border border-transparent`
                        : 'bg-white dark:bg-gray-700/30 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700'
                    }`}
                  >
                    {meal ? (
                      <div className="p-2 h-full flex flex-col">
                        {meal.image && <img src={meal.image} alt={meal.name} className="w-full h-12 object-cover rounded-lg mb-1.5" />}
                        <p className="text-gray-700 dark:text-gray-300 leading-tight" style={{ fontSize: '0.72rem', fontWeight: 600 }}>{meal.name}</p>
                        <div className="flex items-center gap-1 mt-auto">
                          <p className="text-gray-400 dark:text-gray-500" style={{ fontSize: '0.62rem' }}>{meal.nutritionalValue.calories} kcal</p>
                        </div>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-5 h-5 bg-white dark:bg-gray-700 rounded-full shadow flex items-center justify-center" onClick={(e) => { e.stopPropagation(); setPickerInfo({ slot, date: dateStr, mealId }); }}>
                            <Pencil className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <Plus className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-amber-400 transition-colors" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {pickerInfo && (
        <SlotPicker
          slot={pickerInfo.slot}
          weekStart={weekStartStr}
          date={pickerInfo.date}
          mealId={pickerInfo.mealId}
          onClose={() => setPickerInfo(null)}
        />
      )}
    </>
  );
}

// ─── Month View ────────────────────────────────────────────────────────────────

function MonthView({ currentDate, showMeals, onDayClick }: { currentDate: Date; showMeals: boolean; onDayClick: (date: Date) => void }) {
  const { meals, weekPlans } = useApp();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = addDays(monthStart, -(getDay(monthStart) === 0 ? 6 : getDay(monthStart) - 1));
  const calEnd = addDays(calStart, 41);
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const getMealForSlot = (date: Date, slot: Slot): Meal | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const weekStartDate = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const plan = weekPlans.find(p => p.startDate === weekStartDate);
    const dayPlan = plan?.days.find(d => d.date === dateStr);
    const mealId = dayPlan?.[slot];
    return mealId ? meals.find(m => m.id === mealId) : undefined;
  };

  return (
    <div>
      <div className="grid grid-cols-7 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="text-center py-2 text-gray-400" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calDays.map(day => {
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          const bkf = getMealForSlot(day, 'breakfast');
          const lnch = getMealForSlot(day, 'lunch');
          const din = getMealForSlot(day, 'dinner');
          const hasAny = bkf || lnch || din;

          return (
            <div
              key={day.toISOString()}
              onClick={() => inMonth && onDayClick(day)}
              className={`min-h-[80px] rounded-xl p-1.5 border transition-all cursor-pointer ${
                inMonth ? 'bg-white dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-gray-700 border-amber-100 dark:border-gray-700' : 'bg-gray-50/50 dark:bg-gray-900/30 border-transparent opacity-40'
              } ${today ? 'ring-2 ring-amber-400' : ''}`}
            >
              <p className={`text-right mb-1 ${today ? 'text-amber-600 font-bold' : 'text-gray-600 dark:text-gray-400'}`} style={{ fontSize: '0.75rem' }}>
                {format(day, 'd')}
              </p>
              {showMeals && inMonth && (
                <div className="space-y-0.5">
                  {bkf && <p className="truncate bg-orange-100 text-orange-700 rounded px-1" style={{ fontSize: '0.6rem' }}>{bkf.name}</p>}
                  {lnch && <p className="truncate bg-green-100 text-green-700 rounded px-1" style={{ fontSize: '0.6rem' }}>{lnch.name}</p>}
                  {din && <p className="truncate bg-blue-100 text-blue-700 rounded px-1" style={{ fontSize: '0.6rem' }}>{din.name}</p>}
                </div>
              )}
              {!showMeals && hasAny && inMonth && (
                <div className="flex flex-wrap gap-0.5 mt-0.5">
                  {bkf && <div className="w-2 h-2 rounded-full bg-orange-400" title="Breakfast" />}
                  {lnch && <div className="w-2 h-2 rounded-full bg-green-400" title="Lunch" />}
                  {din && <div className="w-2 h-2 rounded-full bg-blue-400" title="Dinner" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function MealPlannerPage() {
  const { aiGenerateMealPlan, saveWeekPlan } = useApp();
  const [view, setView] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [showMeals, setShowMeals] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showGenMenu, setShowGenMenu] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);

  const navigate = (dir: 1 | -1) => {
    if (view === 'week') setCurrentDate(d => addWeeks(d, dir));
    else setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + dir, 1));
  };

  const handleGeneratePlan = async (weeksAhead: 0 | 1 | 2) => {
    setGenerating(true);
    setErrorMsg('');
    try {
      const targetWeekStart = format(addWeeks(weekStart, weeksAhead), 'yyyy-MM-dd');
      const plan = await aiGenerateMealPlan(targetWeekStart);
      saveWeekPlan(plan);
      setSuccessMsg(`Meal plan generated for week of ${format(parseISO(targetWeekStart), 'MMM d')}!`);
      if (view === 'week') setCurrentDate(addWeeks(weekStart, weeksAhead));
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to generate meal plan';
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setGenerating(false);
    }
  };


  const handleMonthDayClick = (date: Date) => {
    const ws = startOfWeek(date, { weekStartsOn: 1 });
    setCurrentDate(ws);
    setView('week');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        {/* View Toggle */}
        <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700 shadow-sm">
          <button onClick={() => setView('week')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${view === 'week' ? 'bg-amber-400 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            <CalendarDays className="w-4 h-4" />
            Week
          </button>
          <button onClick={() => setView('month')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${view === 'month' ? 'bg-amber-400 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            <LayoutGrid className="w-4 h-4" />
            Month
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 shadow-sm">
          <button onClick={() => navigate(-1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="text-gray-800 dark:text-gray-200 min-w-[160px] text-center" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {view === 'week'
              ? `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`
              : format(monthStart, 'MMMM yyyy')
            }
          </span>
          <button onClick={() => navigate(1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Month view extra options */}
        {view === 'month' && (
          <button onClick={() => setShowMeals(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${showMeals ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-200 dark:hover:border-amber-700'}`}>
            <LayoutGrid className="w-4 h-4" />
            {showMeals ? 'Hide meal names' : 'Show meal names'}
          </button>
        )}

        {/* AI Generate */}
        <div className="relative ml-auto">
          <button
            onClick={() => setShowGenMenu(v => !v)}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm shadow-sm transition-colors disabled:opacity-60"
            style={{ fontWeight: 600 }}
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? 'Generating...' : 'AI Generate Plan'}
            {!generating && <ChevronRight className="w-4 h-4 rotate-90" />}
          </button>

          {showGenMenu && !generating && (
            <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-20 min-w-[260px]">
              <p className="px-4 py-1.5 text-gray-400 dark:text-gray-500" style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Select week</p>
              {(['This Week', 'Next Week', 'Week After Next'] as const).map((label, i) => (
                <button
                  key={label}
                  onClick={() => { setShowGenMenu(false); handleGeneratePlan(i as 0 | 1 | 2); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50 dark:hover:bg-violet-900/20 text-left transition-colors"
                >
                  <div className="w-7 h-7 bg-violet-100 dark:bg-violet-900/40 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-gray-200 text-sm" style={{ fontWeight: 500 }}>{label}</p>
                    <p className="text-gray-400 dark:text-gray-500" style={{ fontSize: '0.7rem' }}>
                      {format(addWeeks(weekStart, i), 'MMM d')} – {format(addDays(addWeeks(weekStart, i), 6), 'MMM d')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-3 h-3 text-white" />
          </div>
          <p className="text-green-700 text-sm">{successMsg}</p>
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <X className="w-3 h-3 text-white" />
          </div>
          <p className="text-red-700 text-sm">{errorMsg}</p>
        </div>
      )}

      {/* AI Loading Overlay */}
      {generating && (
        <div className="mb-4 p-4 bg-violet-50 border border-violet-200 rounded-2xl flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-violet-500 animate-spin flex-shrink-0" />
          <div>
            <p className="text-violet-700 text-sm" style={{ fontWeight: 600 }}>AI is crafting your meal plan...</p>
            <p className="text-violet-400 text-xs">Balancing nutrition and variety</p>
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-amber-50 dark:border-gray-700">
        {view === 'week' ? (
          <WeekView weekStart={weekStart} onMealClick={setSelectedMeal} />
        ) : (
          <MonthView currentDate={currentDate} showMeals={showMeals} onDayClick={handleMonthDayClick} />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {SLOTS.map(slot => (
          <div key={slot} className="flex items-center gap-1.5">
            <span style={{ fontSize: '0.8rem' }}>{SLOT_EMOJIS[slot]}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${TYPE_BADGE[SLOT_LABELS[slot]]}`}>{SLOT_LABELS[slot]}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2">
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="text-xs text-gray-500">Today</span>
        </div>
      </div>

      {showGenMenu && <div className="fixed inset-0 z-10" onClick={() => setShowGenMenu(false)} />}

      {selectedMeal && (
        <MealDetailModal
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
          onEdit={() => {}}
        />
      )}
    </div>
  );
}
