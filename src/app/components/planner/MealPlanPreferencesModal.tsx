import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface MealPlanPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (preferences: {
    dietaryRestrictions?: string;
    cuisinePreferences?: string;
    ingredientsToAvoid?: string;
    cookingLevel?: 'quick' | 'moderate' | 'advanced';
    mealRepetition?: number;
    notes?: string;
  }) => Promise<void>;
  isGenerating?: boolean;
  weekStartDate: string;
}

export function MealPlanPreferencesModal({
  isOpen,
  onClose,
  onGenerate,
  isGenerating = false,
  weekStartDate,
}: MealPlanPreferencesModalProps) {
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [cuisinePreferences, setCuisinePreferences] = useState('');
  const [ingredientsToAvoid, setIngredientsToAvoid] = useState('');
  const [cookingLevel, setCookingLevel] = useState<'quick' | 'moderate' | 'advanced'>('moderate');
  const [mealRepetition, setMealRepetition] = useState(2);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onGenerate({
        dietaryRestrictions: dietaryRestrictions || undefined,
        cuisinePreferences: cuisinePreferences || undefined,
        ingredientsToAvoid: ingredientsToAvoid || undefined,
        cookingLevel,
        mealRepetition,
        notes: notes || undefined,
      });
      onClose();
      // Reset form
      setDietaryRestrictions('');
      setCuisinePreferences('');
      setIngredientsToAvoid('');
      setCookingLevel('moderate');
      setMealRepetition(2);
      setNotes('');
    } catch (err) {
      console.error('Failed to generate meal plan:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Generate Meal Plan</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Week starting {weekStartDate}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Meal Repetition */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Meal Repetition (times per week)
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Since you live alone, each meal will appear this many times in the week (e.g., Monday lunch + Wednesday dinner + Friday snack). This is realistic meal prep.
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="4"
                value={mealRepetition}
                onChange={(e) => setMealRepetition(parseInt(e.target.value))}
                disabled={isGenerating}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-lg font-semibold text-gray-900 dark:text-white w-12 text-center">{mealRepetition}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {mealRepetition === 1 && 'Each meal once (no repeats)'}
              {mealRepetition === 2 && 'Each meal twice (cook once, eat twice)'}
              {mealRepetition === 3 && 'Each meal 3 times (cook once, eat three meals)'}
              {mealRepetition === 4 && 'Each meal 4 times (very efficient meal prep)'}
            </p>
          </div>

          {/* Cooking Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Cooking Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['quick', 'moderate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setCookingLevel(level)}
                  disabled={isGenerating}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    cookingLevel === level
                      ? 'bg-amber-400 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  } disabled:opacity-50`}
                >
                  {level === 'quick' && '⚡ Quick (<30 min)'}
                  {level === 'moderate' && '⏱️ Moderate (30-60 min)'}
                  {level === 'advanced' && '👨‍🍳 Advanced (60+ min)'}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Dietary Restrictions (optional)
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              e.g., "vegetarian", "vegan", "gluten-free", "dairy-free"
            </p>
            <input
              type="text"
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              placeholder="e.g., vegetarian, gluten-free"
              disabled={isGenerating}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
            />
          </div>

          {/* Cuisine Preferences */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Cuisine Preferences (optional)
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              e.g., "Italian, Asian", "Mediterranean", "Mexican"
            </p>
            <input
              type="text"
              value={cuisinePreferences}
              onChange={(e) => setCuisinePreferences(e.target.value)}
              placeholder="e.g., Italian, Asian, Mediterranean"
              disabled={isGenerating}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
            />
          </div>

          {/* Ingredients to Avoid */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Ingredients to Avoid (optional)
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              e.g., "shellfish, peanuts, soy"
            </p>
            <input
              type="text"
              value={ingredientsToAvoid}
              onChange={(e) => setIngredientsToAvoid(e.target.value)}
              placeholder="e.g., shellfish, peanuts, soy"
              disabled={isGenerating}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Additional Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any other preferences or special requests..."
              disabled={isGenerating}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
            />
          </div>

          {/* Info Box */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              <strong>💡 Tip:</strong> The AI will use your preferences to generate a meal plan that repeats meals intelligently. This makes shopping more efficient and cooking more realistic for one person.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Meal Plan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
