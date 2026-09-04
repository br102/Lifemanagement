import { useState, useEffect } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MealPlanningProfileModalProps {
  onClose: () => void;
}

export function MealPlanningProfileModal({ onClose }: MealPlanningProfileModalProps) {
  const { userProfile, saveUserProfile } = useApp();
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [profileDraft, setProfileDraft] = useState({
    displayName: '',
    weightKg: '',
    heightCm: '',
    age: '',
    sex: '',
    activityLevel: '',
    fitnessGoal: '',
    goalNotes: '',
    dietaryPreferences: '',
    allergies: '',
    dislikes: '',
    targetCalories: '',
    targetProtein: '',
    targetCarbs: '',
    targetFat: '',
    mealsPerDay: '',
  });

  useEffect(() => {
    if (!userProfile) return;
    setProfileDraft({
      displayName: userProfile.displayName ?? '',
      weightKg: userProfile.weightKg?.toString() ?? '',
      heightCm: userProfile.heightCm?.toString() ?? '',
      age: userProfile.age?.toString() ?? '',
      sex: userProfile.sex ?? '',
      activityLevel: userProfile.activityLevel ?? '',
      fitnessGoal: userProfile.fitnessGoal ?? '',
      goalNotes: userProfile.goalNotes ?? '',
      dietaryPreferences: userProfile.dietaryPreferences?.join(', ') ?? '',
      allergies: userProfile.allergies?.join(', ') ?? '',
      dislikes: userProfile.dislikes?.join(', ') ?? '',
      targetCalories: userProfile.targetCalories?.toString() ?? '',
      targetProtein: userProfile.targetProtein?.toString() ?? '',
      targetCarbs: userProfile.targetCarbs?.toString() ?? '',
      targetFat: userProfile.targetFat?.toString() ?? '',
      mealsPerDay: userProfile.mealsPerDay?.toString() ?? '',
    });
  }, [userProfile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await saveUserProfile({
        displayName: profileDraft.displayName || undefined,
        weightKg: profileDraft.weightKg ? Number(profileDraft.weightKg) : undefined,
        heightCm: profileDraft.heightCm ? Number(profileDraft.heightCm) : undefined,
        age: profileDraft.age ? Number(profileDraft.age) : undefined,
        sex: profileDraft.sex || undefined,
        activityLevel: profileDraft.activityLevel || undefined,
        fitnessGoal: profileDraft.fitnessGoal || undefined,
        goalNotes: profileDraft.goalNotes || undefined,
        dietaryPreferences: profileDraft.dietaryPreferences.split(',').map((v) => v.trim()).filter(Boolean),
        allergies: profileDraft.allergies.split(',').map((v) => v.trim()).filter(Boolean),
        dislikes: profileDraft.dislikes.split(',').map((v) => v.trim()).filter(Boolean),
        targetCalories: profileDraft.targetCalories ? Number(profileDraft.targetCalories) : undefined,
        targetProtein: profileDraft.targetProtein ? Number(profileDraft.targetProtein) : undefined,
        targetCarbs: profileDraft.targetCarbs ? Number(profileDraft.targetCarbs) : undefined,
        targetFat: profileDraft.targetFat ? Number(profileDraft.targetFat) : undefined,
        mealsPerDay: profileDraft.mealsPerDay ? Number(profileDraft.mealsPerDay) : undefined,
      });
      setSuccessMsg('Profile saved successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-gray-900 dark:text-white text-xl" style={{ fontWeight: 700 }}>Meal Planning Profile</h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">These fields help the AI shape meals around your goal, body stats, and dietary constraints.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-xl flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-white" />
            </div>
            <p className="text-green-700 dark:text-green-300 text-sm">{successMsg}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {[
              ['displayName', 'Display name'],
              ['weightKg', 'Weight kg'],
              ['heightCm', 'Height cm'],
              ['age', 'Age'],
              ['sex', 'Sex'],
              ['activityLevel', 'Activity level'],
              ['fitnessGoal', 'Fitness goal'],
              ['targetCalories', 'Target calories'],
              ['mealsPerDay', 'Meals/day'],
            ].map(([key, label]) => (
              <label key={key} className="text-sm">
                <span className="block mb-1 text-gray-500 dark:text-gray-400 font-medium">{label}</span>
                <input
                  value={(profileDraft as any)[key]}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </label>
            ))}
            <label className="md:col-span-3 text-sm">
              <span className="block mb-1 text-gray-500 dark:text-gray-400 font-medium">Goal notes</span>
              <textarea
                value={profileDraft.goalNotes}
                onChange={(e) => setProfileDraft((prev) => ({ ...prev, goalNotes: e.target.value }))}
                className="w-full min-h-[88px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Example: 3 training days/week, prefer simple lunches, no fish."
              />
            </label>
            <label className="md:col-span-3 text-sm">
              <span className="block mb-1 text-gray-500 dark:text-gray-400 font-medium">Dietary preferences, allergies and dislikes</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  value={profileDraft.dietaryPreferences}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, dietaryPreferences: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="vegetarian, high protein"
                />
                <input
                  value={profileDraft.allergies}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, allergies: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="peanuts, shellfish"
                />
                <input
                  value={profileDraft.dislikes}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, dislikes: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="mushrooms, olives"
                />
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            style={{ fontWeight: 600 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ fontWeight: 600 }}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
