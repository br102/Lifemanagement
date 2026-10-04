import { useState, useMemo } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Schedule } from '../../types';

interface ChoreData {
  id?: string;
  name: string;
  interval: number;
  isDefault?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  schedules: Schedule[];
  onSave: (updates: {
    office?: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>;
    chores?: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>[];
  }) => Promise<void>;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAY_NUMBERS = [1, 2, 3, 4, 5, 6, 0]; // 1-6 = Mon-Sat, 0 = Sun

export function ManageSchedulesModal({ isOpen, onClose, schedules, onSave }: Props) {
  const [officeWeekdays, setOfficeWeekdays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri by default
  const [chores, setChores] = useState<ChoreData[]>([]);
  const [newChore, setNewChore] = useState({ name: '', interval: 0 });
  const [showAddChore, setShowAddChore] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize state on mount or when schedules change
  useMemo(() => {
    if (isOpen && schedules.length > 0) {
      // Find office schedule
      const officeSchedule = schedules.find(
        (s) => s.category === 'office' || s.title?.toLowerCase() === 'office'
      );
      if (officeSchedule && 'weekdays' in officeSchedule && Array.isArray((officeSchedule as any).weekdays)) {
        setOfficeWeekdays((officeSchedule as any).weekdays);
      }

      // Find chore schedules
      const choreSchedules = schedules.filter(
        (s) => s.category === 'chores' || (s.category as string) === 'CHORE'
      );
      const choreList = choreSchedules.map((s) => ({
        id: s.id,
        name: s.title,
        interval: (s as any).interval || (s as any).intervalDays || 0,
        isDefault: false,
      }));
      setChores(choreList);

      // If no chores exist, pre-populate defaults
      if (choreList.length === 0) {
        const today = format(new Date(), 'yyyy-MM-dd');
        setChores([
          { name: 'Vacuum', interval: 3, isDefault: true },
          { name: 'Clean bathroom', interval: 4, isDefault: true },
        ]);
      }
    }
  }, [isOpen, schedules]);

  if (!isOpen) return null;

  const toggleWeekday = (weekdayNum: number) => {
    setOfficeWeekdays((prev) => {
      if (prev.includes(weekdayNum)) {
        return prev.filter((w) => w !== weekdayNum);
      } else {
        return [...prev, weekdayNum].sort();
      }
    });
  };

  const handleRemoveChore = (index: number) => {
    setChores((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddChore = () => {
    const validationErrors: Record<string, string> = {};

    if (!newChore.name.trim()) {
      validationErrors.choreName = 'Chore name is required';
    }

    if (!newChore.interval || newChore.interval <= 0) {
      validationErrors.choreInterval = 'Interval must be greater than 0';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setChores((prev) => [
      ...prev,
      {
        name: newChore.name,
        interval: newChore.interval,
        isDefault: false,
      },
    ]);

    setNewChore({ name: '', interval: 0 });
    setShowAddChore(false);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (officeWeekdays.length === 0) {
      newErrors.office = 'Select at least one office day';
    }

    for (const chore of chores) {
      if (!chore.name.trim()) {
        newErrors.choresEmpty = 'All chores must have a name';
        break;
      }
      if (chore.interval <= 0) {
        newErrors.choresInterval = 'All chores must have a valid interval';
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const updates: {
        office?: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>;
        chores?: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>[];
      } = {};

      // Create office schedule update
      updates.office = {
        title: 'Office',
        category: 'office',
        description: `Office days: ${WEEKDAYS.filter((_, i) => officeWeekdays.includes(WEEKDAY_NUMBERS[i])).join(', ')}`,
        recurrencePattern: JSON.stringify({
          type: 'WEEKDAYS',
          weekdays: officeWeekdays,
        }),
      };

      // Create chore schedule updates
      updates.chores = chores.map((chore) => ({
        title: chore.name,
        category: 'chores',
        description: `Every ${chore.interval} days`,
        recurrencePattern: JSON.stringify({
          type: 'INTERVAL',
          interval: chore.interval,
          unit: 'days',
          startDate: today,
        }),
      }));

      await onSave(updates);
      onClose();
    } catch (error) {
      console.error('Failed to save schedules', error);
      setErrors({ submit: 'Failed to save schedules. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestClose = () => {
    if (window.confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={handleRequestClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-transparent dark:border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-gray-900 dark:text-gray-100 text-lg font-bold">
            Manage Schedules
          </h2>
          <button
            onClick={handleRequestClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Office Days Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Office Days
              </h3>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day, index) => {
                  const weekdayNum = WEEKDAY_NUMBERS[index];
                  const isSelected = officeWeekdays.includes(weekdayNum);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWeekday(weekdayNum)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-amber-400 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              {errors.office && (
                <p className="text-xs text-red-500 mt-1">{errors.office}</p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-gray-800" />

            {/* Chores Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Chores
                </h3>
                {chores.some((c) => c.isDefault) && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    (Default — save to confirm)
                  </span>
                )}
              </div>

              {/* Chores List */}
              <div className="space-y-2">
                {chores.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No chores added yet.
                  </p>
                ) : (
                  chores.map((chore, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                        {chore.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={chore.interval}
                          onChange={(e) => {
                            const newChores = [...chores];
                            newChores[index].interval = Math.max(1, parseInt(e.target.value) || 0);
                            setChores(newChores);
                          }}
                          disabled={chore.isDefault}
                          min="1"
                          className={`w-16 px-2 py-1 text-sm rounded border ${
                            chore.isDefault
                              ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-400'
                          }`}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">days</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChore(index)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {errors.choresEmpty && (
                <p className="text-xs text-red-500 mt-1">{errors.choresEmpty}</p>
              )}
              {errors.choresInterval && (
                <p className="text-xs text-red-500 mt-1">{errors.choresInterval}</p>
              )}

              {/* Add Chore Section */}
              {!showAddChore ? (
                <button
                  type="button"
                  onClick={() => setShowAddChore(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-300 rounded-lg text-xs hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Custom Chore
                </button>
              ) : (
                <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <input
                      type="text"
                      value={newChore.name}
                      onChange={(e) => setNewChore((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Chore name"
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    {errors.choreName && (
                      <p className="text-xs text-red-500 mt-0.5">{errors.choreName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newChore.interval || ''}
                      onChange={(e) =>
                        setNewChore((prev) => ({
                          ...prev,
                          interval: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      placeholder="Days"
                      min="1"
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    {errors.choreInterval && (
                      <p className="text-xs text-red-500 mt-0.5">{errors.choreInterval}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddChore(false);
                        setNewChore({ name: '', interval: 0 });
                        setErrors({});
                      }}
                      className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddChore}
                      className="flex-1 px-2 py-1.5 text-xs bg-amber-400 text-white rounded-lg hover:bg-amber-500 transition-colors font-medium"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-sm text-red-700 dark:text-red-400">
                {errors.submit}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button
            onClick={handleRequestClose}
            className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2.5 bg-amber-400 rounded-xl text-white text-sm hover:bg-amber-500 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
