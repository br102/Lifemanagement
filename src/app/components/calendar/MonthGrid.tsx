import React from 'react';
import { startOfMonth, endOfMonth, startOfWeek, addDays, format, parseISO, isSameMonth } from 'date-fns';
import { CALENDAR_CATEGORIES, getCategoryConfig } from './calendarCategories';
import type { CalendarEvent, Schedule, ScheduleOccurrence, TrainingDay, WeekPlan, Meal, CalendarCategory } from '../../types';

interface DayItem {
  category: CalendarCategory;
  title: string;
  id: string;
}

interface MonthGridProps {
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

export function MonthGrid({
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
}: MonthGridProps) {
  // Get all days to display in the calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday-based week
  const gridEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 0 }), 34); // 5 weeks of rows

  // Build a map of date -> items for easy lookup
  const itemsPerDay = new Map<string, DayItem[]>();

  const addItemToDay = (date: string, item: DayItem) => {
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
        title: event.title,
        id: event.id,
      });
    }
  }

  // Process schedules (office, chores, training, meals)
  if (filters.office || filters.chores) {
    for (const occurrence of scheduleOccurrences) {
      const schedule = schedules.find((s) => s.id === occurrence.scheduleId);
      if (!schedule) continue;

      const shouldFilter =
        (schedule.category === 'office' && !filters.office) ||
        (schedule.category === 'chores' && !filters.chores) ||
        (schedule.category === 'training' && !filters.training) ||
        (schedule.category === 'meals' && !filters.meals);

      if (shouldFilter) continue;

      addItemToDay(occurrence.date, {
        category: schedule.category,
        title: schedule.title,
        id: schedule.id,
      });
    }
  }

  // Process training days
  if (filters.training) {
    for (const trainingDay of trainingDays) {
      addItemToDay(trainingDay.date, {
        category: 'training',
        title: `${trainingDay.exercises.length} exercises`,
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
            title: `${mealCount} meals`,
            id: weekPlan.id,
          });
        }
      }
    }
  }

  // Generate calendar days
  const days: Date[] = [];
  let current = new Date(gridStart);
  while (current <= gridEnd) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Prepare unique categories per day (max 4 visible)
  const getCategoriesForDay = (dateStr: string): CalendarCategory[] => {
    const items = itemsPerDay.get(dateStr) || [];
    const categories = new Set<CalendarCategory>();
    for (const item of items) {
      categories.add(item.category);
    }
    return Array.from(categories).slice(0, 4);
  };

  const getItemCountForDay = (dateStr: string): number => {
    return itemsPerDay.get(dateStr)?.length || 0;
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Day headers (Sun-Sat) */}
      <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = dateStr === selectedDay;
          const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
          const categories = getCategoriesForDay(dateStr);
          const itemCount = getItemCountForDay(dateStr);
          const moreCount = itemCount - categories.length;

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDay(dateStr)}
              className={`
                min-h-24 p-2 border-r border-b border-gray-200 dark:border-gray-700 cursor-pointer
                transition-colors duration-150
                ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900'}
                ${isSelected ? 'bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-400' : ''}
                ${isToday && !isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''}
                hover:bg-gray-100 dark:hover:bg-gray-800
              `}
            >
              {/* Date number */}
              <div className={`
                text-xs font-semibold mb-1
                ${isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}
                ${isToday && !isSelected ? 'text-blue-600 dark:text-blue-400' : ''}
                ${isSelected ? 'text-amber-600 dark:text-amber-400' : ''}
              `}>
                {format(day, 'd')}
              </div>

              {/* Category indicators (colored dots) */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {categories.map((category) => {
                    const config = getCategoryConfig(category);
                    if (!config) return null;
                    const Icon = config.icon;
                    return (
                      <div
                        key={category}
                        className={`
                          w-5 h-5 rounded flex items-center justify-center
                          ${config.color}
                        `}
                        title={config.label}
                      >
                        <Icon className="w-3 h-3" />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* More items indicator */}
              {moreCount > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  +{moreCount} more
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
