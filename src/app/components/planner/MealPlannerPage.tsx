import { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Sparkles, Loader2, Plus, X, Search,
  CalendarDays, LayoutGrid, Check, Pencil, Leaf, Sprout,
} from 'lucide-react';
import {
  format, addDays, addWeeks, startOfWeek, parseISO,
  isSameMonth, getDay, startOfMonth, endOfMonth, eachDayOfInterval, isToday,
} from 'date-fns';
import { useApp } from '../../context/AppContext';
import { getMealVeggieType, isVeggieMeal } from '../../utils/veggieUtils';
import type { Meal, MealType } from '../../types';

const TYPE_COLORS: Record<string, string> = {
  Breakfast: 'border-l-orange-400 bg-orange-50 dark:bg-orange-900/20',
  Lunch: 'border-l-green-400 bg-green-50 dark:bg-green-900/20',
  Dinner: 'border-l-blue-400 bg-blue-50 dark:bg-blue-900/20',
  Snack: 'border-l-purple-400 bg-purple-50 dark:bg-purple-900/20',
};

const TYPE_BADGE: Record<string, string> = {
  Breakfast: 'bg-orange-100 text-orange-700',
  Lunch: 'bg-green-100 text-green-700',
  Dinner: 'bg-blue-100 text-blue-700',
  Snack: 'bg-purple-100 text-purple-700',
};

const SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'] as const;
type Slot = typeof SLOTS[number];
const SLOT_LABELS: Record<Slot, string> = { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack', dinner: 'Dinner' };
const SLOT_EMOJIS: Record<Slot, string> = { breakfast: '🌅', lunch: '☀️', snack: '🍎', dinner: '🌙' };
const SLOT_TYPES: Record<Slot, MealType> = { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack', dinner: 'Dinner' };
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
  const [veggieOnly, setVeggieOnly] = useState(false);
  const slotType = SLOT_TYPES[slot];
  const relevant = meals.filter(m => m.types.includes(slotType));
  const filtered = relevant.filter(m => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (veggieOnly && !isVeggieMeal(m)) return false;
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
          <button
            onClick={() => setVeggieOnly(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all border ${veggieOnly ? 'bg-green-500 text-white border-green-500' : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-green-300'}`}
            style={{ fontWeight: veggieOnly ? 600 : 400 }}
          >
            <Leaf className="w-3 h-3" />
            Veggie only
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {mealId && (
            <button onClick={() => { removeMealFromSlot(weekStart, date, slot); onClose(); }}
              className="w-full p-2.5 rounded-xl border-2 border-dashed border-red-200 dark:border-red-800 text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              Remove current meal
            </button>
          )}
          {filtered.map(meal => {
            const vt = getMealVeggieType(meal);
            return (
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
                    {vt === 'vegan' && (
                      <span className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full" style={{ fontSize: '0.6rem', fontWeight: 600 }}>
                        <Sprout className="w-2 h-2" /> V
                      </span>
                    )}
                    {vt === 'vegetarian' && (
                      <span className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 bg-lime-100 text-lime-700 rounded-full" style={{ fontSize: '0.6rem', fontWeight: 600 }}>
                        <Leaf className="w-2 h-2" /> V
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 dark:text-gray-500 text-xs">{meal.nutritionalValue.calories} kcal · {meal.category}</p>
                </div>
                {meal.id === mealId && <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-4">
              {veggieOnly ? 'No veggie meals found for this slot' : `No ${slotType} meals found`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Veggie Preferences Modal ─────────────────────────────────────────────────

interface VeggiePrefsModalProps {
  weeksAhead: 0 | 1 | 2;
  weekStart: Date;
  onGenerate: (veggiePrefs: Set<string>) => void;
  onClose: () => void;
}

type Preset = 'all' | 'dinners' | 'lunches-dinners' | 'weekdays' | 'none';

function VeggiePrefsModal({ weeksAhead, weekStart, onGenerate, onClose }: VeggiePrefsModalProps) {
  const targetWeekStart = addWeeks(weekStart, weeksAhead);
  const targetWeekEnd = addDays(targetWeekStart, 6);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (dayIdx: number, slot: Slot) => {
    const key = `${dayIdx}-${slot}`;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const toggleDay = (dayIdx: number) => {
    const keys = SLOTS.map(s => `${dayIdx}-${s}`);
    const allSel = keys.every(k => selected.has(k));
    setSelected(prev => {
      const next = new Set(prev);
      if (allSel) keys.forEach(k => next.delete(k));
      else keys.forEach(k => next.add(k));
      return next;
    });
  };

  const toggleSlot = (slot: Slot) => {
    const keys = DAY_LABELS.map((_, i) => `${i}-${slot}`);
    const allSel = keys.every(k => selected.has(k));
    setSelected(prev => {
      const next = new Set(prev);
      if (allSel) keys.forEach(k => next.delete(k));
      else keys.forEach(k => next.add(k));
      return next;
    });
  };

  const applyPreset = (preset: Preset) => {
    const next = new Set<string>();
    if (preset === 'all') {
      SLOTS.forEach(s => DAY_LABELS.forEach((_, i) => next.add(`${i}-${s}`)));
    } else if (preset === 'dinners') {
      DAY_LABELS.forEach((_, i) => next.add(`${i}-dinner`));
    } else if (preset === 'lunches-dinners') {
      DAY_LABELS.forEach((_, i) => { next.add(`${i}-lunch`); next.add(`${i}-dinner`); });
    } else if (preset === 'weekdays') {
      // Mon–Fri (indices 0–4)
      for (let i = 0; i < 5; i++) SLOTS.forEach(s => next.add(`${i}-${s}`));
    }
    // 'none' → empty set (already empty)
    setSelected(next);
  };

  const isDayFullySelected = (dayIdx: number) => SLOTS.every(s => selected.has(`${dayIdx}-${s}`));
  const isDayPartial = (dayIdx: number) => !isDayFullySelected(dayIdx) && SLOTS.some(s => selected.has(`${dayIdx}-${s}`));
  const isSlotFullySelected = (slot: Slot) => DAY_LABELS.every((_, i) => selected.has(`${i}-${slot}`));

  const presets: { label: string; icon: string; preset: Preset }[] = [
    { label: 'Full veggie week', icon: '🌿', preset: 'all' },
    { label: 'Veggie dinners', icon: '🌙', preset: 'dinners' },
    { label: 'Lunches & dinners', icon: '☀️', preset: 'lunches-dinners' },
    { label: 'Weekdays only', icon: '📅', preset: 'weekdays' },
    { label: 'No preference', icon: '✕', preset: 'none' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
        style={{ maxWidth: '680px', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-gray-900 dark:text-white" style={{ fontWeight: 700, fontSize: '1.05rem' }}>Veggie Meal Preferences</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-0.5">
                Select which slots should use <span className="text-green-600 dark:text-green-400" style={{ fontWeight: 500 }}>plant-based recipes only</span>
              </p>
              <p className="text-amber-600 dark:text-amber-400 mt-1" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                📅 {format(targetWeekStart, 'MMM d')} – {format(targetWeekEnd, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Presets */}
        <div className="px-6 py-3 border-b border-gray-50 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40">
          <p className="text-gray-400 dark:text-gray-500 mb-2" style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Quick Presets</p>
          <div className="flex flex-wrap gap-2">
            {presets.map(({ label, icon, preset }) => (
              <button
                key={preset}
                onClick={() => applyPreset(preset)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-700 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                style={{ fontSize: '0.78rem', fontWeight: 500 }}
              >
                <span style={{ fontSize: '0.8rem' }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="px-6 py-4 overflow-auto flex-1">
          <div style={{ minWidth: '520px' }}>
            {/* Day column headers */}
            <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: '110px repeat(7, 1fr)' }}>
              <div className="flex items-end pb-1">
                <span className="text-gray-300 dark:text-gray-600" style={{ fontSize: '0.65rem' }}>Tap to select all</span>
              </div>
              {DAY_LABELS.map((day, i) => {
                const date = addDays(targetWeekStart, i);
                const fullySelected = isDayFullySelected(i);
                const partial = isDayPartial(i);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(i)}
                    title={`Toggle all meals on ${day}`}
                    className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                      fullySelected
                        ? 'bg-green-500 text-white shadow-sm'
                        : partial
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400'
                    }`}
                  >
                    <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{day}</span>
                    <span style={{ fontSize: '0.62rem' }} className="opacity-75">{format(date, 'MMM d')}</span>
                    {fullySelected && <Leaf className="w-2.5 h-2.5 mt-0.5 opacity-80" />}
                  </button>
                );
              })}
            </div>

            {/* Slot rows */}
            {SLOTS.map(slot => {
              const slotFull = isSlotFullySelected(slot);
              return (
                <div key={slot} className="grid gap-2 mb-2" style={{ gridTemplateColumns: '110px repeat(7, 1fr)' }}>
                  {/* Row header — click to toggle entire row */}
                  <button
                    onClick={() => toggleSlot(slot)}
                    title={`Toggle ${SLOT_LABELS[slot]} for all days`}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-left ${
                      slotFull
                        ? 'bg-green-500 text-white shadow-sm'
                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400'
                    }`}
                  >
                    <span style={{ fontSize: '1rem' }}>{SLOT_EMOJIS[slot]}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{SLOT_LABELS[slot]}</span>
                  </button>

                  {/* Day cells */}
                  {DAY_LABELS.map((_, i) => {
                    const key = `${i}-${slot}`;
                    const active = selected.has(key);
                    return (
                      <button
                        key={i}
                        onClick={() => toggle(i, slot)}
                        className={`h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all border-2 ${
                          active
                            ? 'bg-green-500 border-green-500 shadow-sm'
                            : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                      >
                        {active ? (
                          <>
                            <Leaf className="w-3.5 h-3.5 text-white" />
                            <span className="text-white" style={{ fontSize: '0.55rem', fontWeight: 600 }}>Veggie</span>
                          </>
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-green-500 flex items-center justify-center">
                <Leaf className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-gray-500 dark:text-gray-400" style={{ fontSize: '0.72rem' }}>AI picks veggie recipe</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-500" />
              </div>
              <span className="text-gray-500 dark:text-gray-400" style={{ fontSize: '0.72rem' }}>AI picks freely</span>
            </div>
          </div>
        </div>

        {/* Footer summary + actions */}
        <div className="px-6 pb-5 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 dark:text-gray-500" style={{ fontSize: '0.78rem' }}>
              {selected.size > 0 ? (
                <span>
                  <span className="text-green-600 dark:text-green-400" style={{ fontWeight: 600 }}>{selected.size} slot{selected.size !== 1 ? 's' : ''}</span>
                  {' '}will use veggie recipes
                </span>
              ) : (
                'No veggie preference — AI picks freely from all recipes'
              )}
            </p>
            {selected.size > 0 && (
              <button onClick={() => setSelected(new Set())} className="text-gray-400 hover:text-red-400 transition-colors" style={{ fontSize: '0.72rem' }}>
                Clear all
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onGenerate(selected)}
              className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              style={{ fontWeight: 600 }}
            >
              <Sparkles className="w-4 h-4" />
              Generate Plan
              {selected.size > 0 && (
                <span className="bg-white/20 px-1.5 py-0.5 rounded-full" style={{ fontSize: '0.65rem' }}>
                  {selected.size} veggie
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Week View ─────────────────────────────────────────────────────────────────

function WeekView({ weekStart }: { weekStart: Date }) {
  const { meals, getWeekPlan } = useApp();
  const [pickerInfo, setPickerInfo] = useState<{ slot: Slot; date: string; mealId?: string } | null>(null);

  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const plan = getWeekPlan(weekStartStr);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getMeal = (id?: string) => id ? meals.find(m => m.id === id) : undefined;
  const getDayPlan = (date: Date) => plan?.days.find(d => d.date === format(date, 'yyyy-MM-dd'));

  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Day headers */}
          <div className="grid grid-cols-8 gap-2 mb-3">
            <div />
            {days.map(day => (
              <div key={day.toISOString()} className={`text-center rounded-xl py-2 ${isToday(day) ? 'bg-amber-400 text-white' : 'bg-white dark:bg-gray-700/50 text-gray-600 dark:text-gray-400'}`}>
                <p style={{ fontSize: '0.7rem' }} className="opacity-70">{DAY_LABELS[getDay(day) === 0 ? 6 : getDay(day) - 1]}</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{format(day, 'd')}</p>
                {isToday(day) && <p style={{ fontSize: '0.55rem' }} className="opacity-80">TODAY</p>}
              </div>
            ))}
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
                const vt = meal ? getMealVeggieType(meal) : null;

                return (
                  <div
                    key={dateStr}
                    onClick={() => setPickerInfo({ slot, date: dateStr, mealId })}
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
                          {vt === 'vegan' && (
                            <span className="flex items-center gap-0.5 bg-green-100 text-green-600 px-1 rounded" style={{ fontSize: '0.55rem', fontWeight: 600 }}>
                              <Sprout className="w-2 h-2" />V
                            </span>
                          )}
                          {vt === 'vegetarian' && (
                            <span className="flex items-center gap-0.5 bg-lime-100 text-lime-700 px-1 rounded" style={{ fontSize: '0.55rem', fontWeight: 600 }}>
                              <Leaf className="w-2 h-2" />V
                            </span>
                          )}
                        </div>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-5 h-5 bg-white dark:bg-gray-700 rounded-full shadow flex items-center justify-center">
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
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 3, 27));
  const [showMeals, setShowMeals] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showGenMenu, setShowGenMenu] = useState(false);
  const [veggieModal, setVeggieModal] = useState<{ weeksAhead: 0 | 1 | 2 } | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);

  const navigate = (dir: 1 | -1) => {
    if (view === 'week') setCurrentDate(d => addWeeks(d, dir));
    else setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + dir, 1));
  };

  const handleGeneratePlan = async (weeksAhead: 0 | 1 | 2, veggiePrefs: Set<string>) => {
    setVeggieModal(null);
    setGenerating(true);
    try {
      const targetWeekStart = format(addWeeks(weekStart, weeksAhead), 'yyyy-MM-dd');
      const plan = await aiGenerateMealPlan(targetWeekStart, veggiePrefs);
      saveWeekPlan(plan);
      const veggieCount = veggiePrefs.size;
      const veggieNote = veggieCount > 0 ? ` · ${veggieCount} veggie slot${veggieCount !== 1 ? 's' : ''}` : '';
      setSuccessMsg(`Meal plan generated for week of ${format(parseISO(targetWeekStart), 'MMM d')}!${veggieNote}`);
      if (view === 'week') setCurrentDate(addWeeks(weekStart, weeksAhead));
      setTimeout(() => setSuccessMsg(''), 4000);
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
                  onClick={() => { setShowGenMenu(false); setVeggieModal({ weeksAhead: i as 0 | 1 | 2 }); }}
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
                  <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-lg" style={{ fontSize: '0.65rem', fontWeight: 600 }}>
                    <Leaf className="w-2.5 h-2.5" />
                    Veggie opts
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

      {/* AI Loading Overlay */}
      {generating && (
        <div className="mb-4 p-4 bg-violet-50 border border-violet-200 rounded-2xl flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-violet-500 animate-spin flex-shrink-0" />
          <div>
            <p className="text-violet-700 text-sm" style={{ fontWeight: 600 }}>AI is crafting your meal plan...</p>
            <p className="text-violet-400 text-xs">Balancing nutrition, variety, and your veggie preferences</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-amber-50 dark:border-gray-700">
        {view === 'week' ? (
          <WeekView weekStart={weekStart} />
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
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-0.5 bg-green-100 text-green-600 px-2 py-0.5 rounded-full" style={{ fontSize: '0.7rem' }}>
            <Sprout className="w-2.5 h-2.5" /> Vegan
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-0.5 bg-lime-100 text-lime-700 px-2 py-0.5 rounded-full" style={{ fontSize: '0.7rem' }}>
            <Leaf className="w-2.5 h-2.5" /> Vegetarian
          </span>
        </div>
      </div>

      {/* Veggie Preferences Modal */}
      {veggieModal && (
        <VeggiePrefsModal
          weeksAhead={veggieModal.weeksAhead}
          weekStart={weekStart}
          onGenerate={(prefs) => handleGeneratePlan(veggieModal.weeksAhead, prefs)}
          onClose={() => setVeggieModal(null)}
        />
      )}

      {showGenMenu && <div className="fixed inset-0 z-10" onClick={() => setShowGenMenu(false)} />}
    </div>
  );
}
