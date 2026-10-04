import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CALENDAR_CATEGORIES } from './calendarCategories';
import { MonthGrid } from './MonthGrid';
import { WeekStrip } from './WeekStrip';
import { DayDetailPanel } from './DayDetailPanel';
import { AddEventModal, type CalendarEventFormData } from './AddEventModal';
import { ManageSchedulesModal } from './ManageSchedulesModal';
import type { CalendarCategory } from '../../types';

type ViewMode = 'month' | 'week';

export function CalendarPage() {
  const {
    calendarEvents,
    schedules,
    scheduleOccurrences,
    trainingDays,
    weekPlans,
    meals,
    saveCalendarEvent,
    saveSchedule,
    completeSchedule,
    setScheduleOverride,
    deleteCalendarEvent,
  } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<CalendarCategory, boolean>>(() => {
    const stored = localStorage.getItem('calendar.filters');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      office: true,
      training: true,
      meals: true,
      chores: true,
      events: true,
    };
  });
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isManageSchedulesModalOpen, setIsManageSchedulesModalOpen] = useState(false);

  // Persist filters to localStorage
  useEffect(() => {
    localStorage.setItem('calendar.filters', JSON.stringify(filters));
  }, [filters]);

  const toggleFilter = (category: CalendarCategory) => {
    setFilters((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handlePrevious = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setDate(newDate.getDate() - 7);
      }
      return newDate;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      return newDate;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-amber-50/50 to-transparent dark:from-gray-950 dark:to-transparent">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-amber-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{monthYear}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {viewMode === 'month' ? 'Month View' : 'Week View'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded transition-all text-sm font-medium ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded transition-all text-sm font-medium ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Week
              </button>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={handlePrevious}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Action Buttons */}
            <button
              onClick={() => setIsAddEventModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors text-sm"
              title="New event"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
            <button
              onClick={() => setIsManageSchedulesModalOpen(true)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Manage schedules"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Filter:</span>
          {CALENDAR_CATEGORIES.map((category) => (
            <button
              key={category.key}
              onClick={() => toggleFilter(category.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                filters[category.key]
                  ? category.color
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}
            >
              <category.icon className="w-3.5 h-3.5" />
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === 'month' ? (
          <MonthGrid
            currentDate={currentDate}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            filters={filters}
            calendarEvents={calendarEvents}
            schedules={schedules}
            scheduleOccurrences={scheduleOccurrences}
            trainingDays={trainingDays}
            weekPlans={weekPlans}
            meals={meals}
          />
        ) : (
          <WeekStrip
            currentDate={currentDate}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            filters={filters}
            calendarEvents={calendarEvents}
            schedules={schedules}
            scheduleOccurrences={scheduleOccurrences}
            trainingDays={trainingDays}
            weekPlans={weekPlans}
            meals={meals}
          />
        )}
      </div>

      {/* Day Detail Panel */}
      {selectedDay && (
        <DayDetailPanel
          selectedDay={selectedDay}
          onClose={() => setSelectedDay(null)}
          onNavigate={(path) => window.location.hash = path}
          filters={filters}
          calendarEvents={calendarEvents}
          schedules={schedules}
          scheduleOccurrences={scheduleOccurrences}
          trainingDays={trainingDays}
          weekPlans={weekPlans}
          meals={meals}
          onCompleteSchedule={completeSchedule}
          onSetScheduleOverride={setScheduleOverride}
          onDeleteEvent={deleteCalendarEvent}
        />
      )}

      {/* Modals */}
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        onSave={async (eventData: CalendarEventFormData) => {
          await saveCalendarEvent({
            title: eventData.title,
            startDate: eventData.startDate,
            startTime: eventData.allDay ? undefined : eventData.startTime,
            endDate: eventData.endDate,
            endTime: eventData.allDay ? undefined : eventData.endTime,
            location: eventData.location,
            allDay: eventData.allDay,
            category: 'events',
            notes: eventData.notes,
          });
        }}
      />
      <ManageSchedulesModal
        isOpen={isManageSchedulesModalOpen}
        onClose={() => setIsManageSchedulesModalOpen(false)}
        schedules={schedules}
        onSave={async (updates) => {
          if (updates.office) {
            await saveSchedule(updates.office);
          }
          if (updates.chores) {
            for (const chore of updates.chores) {
              await saveSchedule(chore);
            }
          }
        }}
      />
    </div>
  );
}
