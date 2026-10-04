import { useState } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';

export interface CalendarEventFormData {
  title: string;
  startDate: string;
  startTime?: string;
  endDate: string;
  endTime?: string;
  allDay: boolean;
  location?: string;
  notes?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialEvent?: CalendarEventFormData;
  onSave: (event: CalendarEventFormData) => Promise<void>;
}

export function AddEventModal({ isOpen, onClose, initialEvent, onSave }: Props) {
  const [formData, setFormData] = useState<CalendarEventFormData>(
    initialEvent || {
      title: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endDate: format(new Date(), 'yyyy-MM-dd'),
      endTime: '10:00',
      allDay: false,
      location: '',
      notes: '',
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (
    field: keyof CalendarEventFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      if (formData.endDate < formData.startDate) {
        newErrors.endDate = 'End date must be equal to or after start date';
      } else if (formData.endDate === formData.startDate && !formData.allDay) {
        if (formData.startTime && formData.endTime && formData.endTime <= formData.startTime) {
          newErrors.endTime = 'End time must be after start time';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save event', error);
      setErrors({ submit: 'Failed to save event. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestClose = () => {
    if (
      formData.title.trim() ||
      formData.location?.trim() ||
      formData.notes?.trim()
    ) {
      if (window.confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
        onClose();
      }
    } else {
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
            {initialEvent ? 'Edit Event' : 'Add New Event'}
          </h2>
          <button
            onClick={handleRequestClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Team Meeting"
                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                  errors.title
                    ? 'border-red-400 dark:border-red-600 focus:border-red-400'
                    : 'border-gray-200 dark:border-gray-700 focus:border-amber-400 dark:focus:border-amber-500'
                }`}
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            {/* All-day Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="allDay"
                checked={formData.allDay}
                onChange={(e) => handleInputChange('allDay', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="allDay" className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                All-day event
              </label>
            </div>

            {/* Start Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    errors.startDate
                      ? 'border-red-400 dark:border-red-600 focus:border-red-400'
                      : 'border-gray-200 dark:border-gray-700 focus:border-amber-400 dark:focus:border-amber-500'
                  }`}
                />
                {errors.startDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
                )}
              </div>

              {!formData.allDay && (
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                    Start Time (optional)
                  </label>
                  <input
                    type="time"
                    value={formData.startTime || ''}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              )}
            </div>

            {/* End Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    errors.endDate
                      ? 'border-red-400 dark:border-red-600 focus:border-red-400'
                      : 'border-gray-200 dark:border-gray-700 focus:border-amber-400 dark:focus:border-amber-500'
                  }`}
                />
                {errors.endDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>
                )}
              </div>

              {!formData.allDay && (
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                    End Time (optional)
                  </label>
                  <input
                    type="time"
                    value={formData.endTime || ''}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      errors.endTime
                        ? 'border-red-400 dark:border-red-600 focus:border-red-400'
                        : 'border-gray-200 dark:border-gray-700 focus:border-amber-400 dark:focus:border-amber-500'
                    }`}
                  />
                  {errors.endTime && (
                    <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>
                  )}
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                Location (optional)
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Conference Room A"
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional details..."
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              />
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
            {isSaving ? 'Saving...' : 'Save Event'}
          </button>
        </div>
      </div>
    </div>
  );
}
