import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { X, Building, Dumbbell, UtensilsCrossed, CheckSquare, Calendar, Link as LinkIcon, Edit2, Trash2 } from 'lucide-react';
import { getCategoryConfig } from './calendarCategories';
import type { CalendarEvent, Schedule, ScheduleOccurrence, TrainingDay, WeekPlan, Meal, CalendarCategory } from '../../types';

interface DayDetailPanelProps {
  selectedDay: string | null;
  onClose: () => void;
  onNavigate?: (path: string) => void;
  filters: Record<CalendarCategory, boolean>;
  calendarEvents: CalendarEvent[];
  schedules: Schedule[];
  scheduleOccurrences: ScheduleOccurrence[];
  trainingDays: TrainingDay[];
  weekPlans: WeekPlan[];
  meals: Meal[];
  onCompleteSchedule?: (occurrenceId: string) => void;
  onSetScheduleOverride?: (occurrenceId: string, overrideStatus: boolean) => void;
  onEditEvent?: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export function DayDetailPanel({
  selectedDay,
  onClose,
  onNavigate,
  filters,
  calendarEvents,
  schedules,
  scheduleOccurrences,
  trainingDays,
  weekPlans,
  meals,
  onCompleteSchedule,
  onSetScheduleOverride,
  onEditEvent,
  onDeleteEvent,
}: DayDetailPanelProps) {
  if (!selectedDay) return null;

  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  // Parse the selected day
  const selectedDate = parseISO(selectedDay);
  const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');

  // Find all items for this day
  const dayOfficeOccurrences = scheduleOccurrences.filter(
    (occ) => occ.date === selectedDay && schedules.find((s) => s.id === occ.scheduleId && s.category === 'office')
  );

  const dayChoreOccurrences = scheduleOccurrences.filter(
    (occ) => occ.date === selectedDay && schedules.find((s) => s.id === occ.scheduleId && s.category === 'chores')
  );

  const dayTrainingData = trainingDays.find((t) => t.date === selectedDay);

  const dayMeals = (() => {
    const weekPlan = weekPlans.find((wp) => {
      const dayPlan = wp.days.find((d) => d.date === selectedDay);
      return !!dayPlan;
    });
    if (!weekPlan) return { breakfast: [], lunch: [], dinner: [], snack: [], proteinShake: [] };

    const dayPlan = weekPlan.days.find((d) => d.date === selectedDay);
    if (!dayPlan) return { breakfast: [], lunch: [], dinner: [], snack: [], proteinShake: [] };

    return {
      breakfast: dayPlan.breakfast ? [meals.find((m) => m.id === dayPlan.breakfast)].filter(Boolean) : [],
      lunch: dayPlan.lunch ? [meals.find((m) => m.id === dayPlan.lunch)].filter(Boolean) : [],
      dinner: dayPlan.dinner ? [meals.find((m) => m.id === dayPlan.dinner)].filter(Boolean) : [],
      snack: dayPlan.snack ? [meals.find((m) => m.id === dayPlan.snack)].filter(Boolean) : [],
      proteinShake: dayPlan.proteinShake ? [meals.find((m) => m.id === dayPlan.proteinShake)].filter(Boolean) : [],
    };
  })();

  const dayEvents = calendarEvents.filter((e) => e.startDate === selectedDay);

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70 transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="fixed right-0 top-0 h-screen w-96 max-w-[calc(100vw-1rem)] bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto transition-transform duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-gradient-to-b from-white to-transparent dark:from-gray-900 dark:to-transparent border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{formattedDate}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedDay}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Office Section */}
          {filters.office && dayOfficeOccurrences.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Building className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Office</h3>
              </div>
              <div className="space-y-2 ml-10">
                {dayOfficeOccurrences.map((occ) => (
                  <div key={occ.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">In Office</span>
                    {onSetScheduleOverride && (
                      <button
                        onClick={() => onSetScheduleOverride(occ.id, true)}
                        className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50 transition-colors"
                      >
                        Mark as WFH
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Training Section */}
          {filters.training && dayTrainingData && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <Dumbbell className="w-4 h-4 text-red-700 dark:text-red-300" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Training</h3>
              </div>
              <div className="space-y-2 ml-10">
                {dayTrainingData.exercises.length > 0 ? (
                  <>
                    <div className="space-y-1">
                      {dayTrainingData.exercises.map((ex, idx) => (
                        <div key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                          {ex.exercise.name}
                          {ex.sets && ex.reps && ` - ${ex.sets}x${ex.reps}`}
                          {ex.durationMin && ` - ${ex.durationMin}min`}
                        </div>
                      ))}
                    </div>
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('/exercise')}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-2"
                      >
                        <LinkIcon className="w-3 h-3" />
                        View in Training
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">No exercises scheduled</div>
                )}
              </div>
            </section>
          )}

          {/* Meals Section */}
          {filters.meals && (
            (() => {
              const hasMeals =
                dayMeals.breakfast.length +
                  dayMeals.lunch.length +
                  dayMeals.dinner.length +
                  dayMeals.snack.length +
                  dayMeals.proteinShake.length >
                0;

              if (!hasMeals) return null;

              return (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <UtensilsCrossed className="w-4 h-4 text-orange-700 dark:text-orange-300" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Meals</h3>
                  </div>
                  <div className="space-y-2 ml-10">
                    {dayMeals.breakfast.map((m) => (
                      <div key={m.id} className="text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Breakfast:</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">{m.name}</span>
                      </div>
                    ))}
                    {dayMeals.lunch.map((m) => (
                      <div key={m.id} className="text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Lunch:</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">{m.name}</span>
                      </div>
                    ))}
                    {dayMeals.dinner.map((m) => (
                      <div key={m.id} className="text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Dinner:</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">{m.name}</span>
                      </div>
                    ))}
                    {dayMeals.snack.map((m) => (
                      <div key={m.id} className="text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Snack:</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">{m.name}</span>
                      </div>
                    ))}
                    {dayMeals.proteinShake.map((m) => (
                      <div key={m.id} className="text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Protein Shake:</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">{m.name}</span>
                      </div>
                    ))}
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('/planner')}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-2"
                      >
                        <LinkIcon className="w-3 h-3" />
                        View in Planner
                      </button>
                    )}
                  </div>
                </section>
              );
            })()
          )}

          {/* Chores Section */}
          {filters.chores && dayChoreOccurrences.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckSquare className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Chores</h3>
              </div>
              <div className="space-y-2 ml-10">
                {dayChoreOccurrences.map((occ) => {
                  const schedule = schedules.find((s) => s.id === occ.scheduleId);
                  return (
                    <div key={occ.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{schedule?.title}</span>
                      {onCompleteSchedule && (
                        <button
                          onClick={() => onCompleteSchedule(occ.id)}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            occ.completed
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          {occ.completed ? 'Done' : 'Mark Done'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Events Section */}
          {filters.events && dayEvents.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Calendar className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Events</h3>
              </div>
              <div className="space-y-2 ml-10">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group"
                    onMouseEnter={() => setHoveredEventId(event.id)}
                    onMouseLeave={() => setHoveredEventId(null)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {event.title}
                        </h4>
                        {event.startTime && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {event.startTime}
                            {event.endTime && ` - ${event.endTime}`}
                          </p>
                        )}
                        {event.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                      {hoveredEventId === event.id && (
                        <div className="flex gap-1 flex-shrink-0">
                          {onEditEvent && (
                            <button
                              onClick={() => onEditEvent(event.id)}
                              className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteEvent && (
                            <button
                              onClick={() => onDeleteEvent(event.id)}
                              className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {!(
            (filters.office && dayOfficeOccurrences.length > 0) ||
            (filters.training && dayTrainingData) ||
            (filters.meals &&
              (dayMeals.breakfast.length +
                dayMeals.lunch.length +
                dayMeals.dinner.length +
                dayMeals.snack.length +
                dayMeals.proteinShake.length >
                0)) ||
            (filters.chores && dayChoreOccurrences.length > 0) ||
            (filters.events && dayEvents.length > 0)
          ) && (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No items for this day</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
