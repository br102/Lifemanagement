import React from 'react';
import { startOfWeek, format, addDays, parseISO, isSameDay } from 'date-fns';
import { getCategoryConfig } from './calendarCategories';
import type { CalendarEvent, Schedule, ScheduleOccurrence, TrainingDay, WeekPlan, Meal, CalendarCategory } from '../../types';

interface WeekItemDisplay {
  category: CalendarCategory;
  label: string;
  id: string;
}

interface WeekStripProps {
  currentDate: Date;
  selectedDay: string | null;
  onSelectDay: (date: string) => void;
  filters: Record<CalendarCategory, boolean>;
  calendarEvents: CalendarEvent[];
  schedules: Schedule[];
  scheduleOccurrences: ScheduleOccurrence[];
  trainingDays: TrainingDay[];
  weekPlans: WeekPlan[];
  meals: Meal[];
}

export function WeekStrip({
  currentDate,
  selectedDay,
  onSelectDay,
  filters,
  calendarEvents,
  schedules,
  scheduleOccurrences,
  trainingDays,
  weekPlans,
  meals,
}: WeekStripProps) {
  // Get the week starting from Monday
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday-based week

  // Build a map of date -> items for easy lookup
  const itemsPerDay = new Map<string, WeekItemDisplay[]>();

  const addItemToDay = (date: string, item: WeekItemDisplay) => {
    if (!itemsPerDay.has(date)) {
      itemsPerDay.set(date, []);
    }
    itemsPerDay.get(date)!.push(item);
  };

  // Process calendar events
  if (filters.events) {
    for (const event of calendarEvents) {
      const dateStr = event.startDate;
      addItemToDay(dateStr, {
        category: 'events',
        label: event.title,
        id: event.id,
      });
    }
  }

  // Process schedules and occurrences
  for (const occurrence of scheduleOccurrences) {
    const schedule = schedules.find((s) => s.id === occurrence.scheduleId);
    if (!schedule) continue;

    const shouldFilter =
      (schedule.category === 'office' && !filters.office) ||
      (schedule.category === 'chores' && !filters.chores) ||
      (schedule.category === 'training' && !filters.training) ||
      (schedule.category === 'meals' && !filters.meals);

    if (shouldFilter) continue;

    if (schedule.category === 'office' && filters.office) {
      addItemToDay(occurrence.date, {
        category: 'office',
        label: 'Office',
        id: schedule.id,
      });
    } else if (schedule.category === 'chores' && filters.chores) {
      addItemToDay(occurrence.date, {
        category: 'chores',
        label: schedule.title,
        id: schedule.id,
      });
    }
  }

  // Process training days
  if (filters.training) {
    for (const trainingDay of trainingDays) {
      addItemToDay(trainingDay.date, {
        category: 'training',
        label: `${trainingDay.exercises.length} exercise${trainingDay.exercises.length !== 1 ? 's' : ''}`,
        id: trainingDay.id,
      });
    }
  }

  // Process week plans (meals)
  if (filters.meals) {
    for (const weekPlan of weekPlans) {
      for (const dayPlan of weekPlan.days) {
        const mealCount = [dayPlan.breakfast, dayPlan.lunch, dayPlan.snack, dayPlan.proteinShake, dayPlan.dinner].filter(Boolean).length;
        if (mealCount > 0) {
          addItemToDay(dayPlan.date, {
            category: 'meals',
            label: `${mealCount} meal${mealCount !== 1 ? 's' : ''}`,
            id: weekPlan.id,
          });
        }
      }
    }
  }

  // Generate 7 days starting from Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="grid grid-cols-7 gap-0">
        {weekDays.map((day, index) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isSelected = dateStr === selectedDay;
          const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
          const dayItems = itemsPerDay.get(dateStr) || [];
          const dayName = format(day, 'EEE');
          const dayNum = format(day, 'd');

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDay(dateStr)}
              className={`
                flex flex-col min-h-64 p-3 border-r border-gray-200 dark:border-gray-700 cursor-pointer
                transition-colors duration-150
                ${isSelected ? 'bg-amber-50 dark:bg-amber-900/20 ring-2 ring-inset ring-amber-400' : ''}
                ${isToday && !isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-white dark:bg-gray-900'}
                hover:bg-gray-100 dark:hover:bg-gray-800
                ${index === 6 ? 'border-r-0' : ''}
              `}
            >
              {/* Day header */}
              <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className={`
                  text-xs font-semibold uppercase tracking-wider mb-1
                  ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}
                  ${isSelected ? 'text-amber-600 dark:text-amber-400' : ''}
                `}>
                  {dayName}
                </div>
                <div className={`
                  text-lg font-bold
                  ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}
                  ${isSelected ? 'text-amber-600 dark:text-amber-400' : ''}
                `}>
                  {dayNum}
                </div>
              </div>

              {/* Items list */}
              <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                {dayItems.length === 0 ? (
                  <div className="text-xs text-gray-400 dark:text-gray-500 italic">
                    No items
                  </div>
                ) : (
                  dayItems.map((item, idx) => {
                    const config = getCategoryConfig(item.category);
                    if (!config) return null;

                    return (
                      <div
                        key={idx}
                        className={`
                          text-xs p-2 rounded-md truncate
                          ${config.color}
                        `}
                        title={item.label}
                      >
                        {item.label}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
