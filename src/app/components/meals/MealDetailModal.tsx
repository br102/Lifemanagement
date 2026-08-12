import { X, Star, Clock, Users, ExternalLink, Flame, Zap, Droplets, Leaf, ChefHat, Sparkles } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { Meal } from '../../types';

const TYPE_COLORS: Record<string, string> = {
  Breakfast: 'bg-orange-100 text-orange-700',
  Lunch: 'bg-green-100 text-green-700',
  Dinner: 'bg-blue-100 text-blue-700',
  Snack: 'bg-purple-100 text-purple-700',
};

const CATEGORY_COLORS: Record<string, string> = {
  Mediterranean: 'bg-teal-100 text-teal-700',
  Italian: 'bg-red-100 text-red-700',
  Asian: 'bg-yellow-100 text-yellow-700',
  Mexican: 'bg-green-100 text-green-700',
  American: 'bg-blue-100 text-blue-700',
  Healthy: 'bg-emerald-100 text-emerald-700',
  default: 'bg-amber-100 text-amber-700',
};

interface Props {
  meal: Meal;
  onClose: () => void;
  onEdit: () => void;
}

const PIE_COLORS = ['#6366f1', '#f59e0b', '#ef4444'];

export function MealDetailModal({ meal, onClose, onEdit }: Props) {
  const { calories, protein, carbs, fat, fiber, sugar, sodium } = meal.nutritionalValue;

  const radarData = [
    { subject: 'Protein', value: Math.min(100, (protein / 50) * 100) },
    { subject: 'Carbs', value: Math.min(100, (carbs / 100) * 100) },
    { subject: 'Fat', value: Math.min(100, (fat / 50) * 100) },
    { subject: 'Fiber', value: Math.min(100, (fiber / 15) * 100) },
    { subject: 'Sugar', value: Math.min(100, (sugar / 40) * 100) },
  ];

  const pieData = [
    { name: 'Protein', value: protein * 4, color: '#6366f1' },
    { name: 'Carbs', value: carbs * 4, color: '#f59e0b' },
    { name: 'Fat', value: fat * 9, color: '#ef4444' },
  ];

  const catColor = CATEGORY_COLORS[meal.category] || CATEGORY_COLORS.default;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-transparent dark:border-gray-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-56 overflow-hidden rounded-t-3xl bg-amber-50 dark:bg-gray-800">
          {meal.image ? (
            <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat className="w-16 h-16 text-amber-200 dark:text-amber-900" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-5 right-16">
            <h2 className="text-white" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{meal.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs ${catColor}`}>{meal.category}</span>
              {meal.types.map(t => (
                <span key={t} className={`px-2.5 py-0.5 rounded-full text-xs ${TYPE_COLORS[t]}`}>{t}</span>
              ))}
              {meal.aiCategorized && (
                <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 flex items-center gap-1 text-xs">
                  <Sparkles className="w-3 h-3" /> AI tagged
                </span>
              )}
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={onEdit} className="px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 text-sm transition-colors border border-white/40 dark:border-gray-700">
              Edit
            </button>
            <button onClick={onClose} className="w-8 h-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-colors border border-white/40 dark:border-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Meta Info */}
          <div className="flex items-center gap-4 mb-5 flex-wrap">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= meal.score ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700 fill-gray-200 dark:fill-gray-700'}`} />
              ))}
              <span className="ml-1 text-gray-500 dark:text-gray-400 text-sm">{meal.score}/5</span>
            </div>
            {meal.prepTime !== undefined && (
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                <Clock className="w-4 h-4" />
                {meal.prepTime + (meal.cookTime || 0)}min
              </div>
            )}
            {meal.servings && (
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                <Users className="w-4 h-4" />
                {meal.servings} servings
              </div>
            )}
            {meal.link && (
              <a href={meal.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-sm">
                <ExternalLink className="w-4 h-4" />
                Recipe link
              </a>
            )}
            {meal.tags?.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs">#{tag}</span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ingredients */}
            <div>
              <h3 className="text-gray-800 dark:text-gray-100 mb-3" style={{ fontWeight: 600 }}>Ingredients</h3>
              <ul className="space-y-2">
                {meal.ingredients.map(ing => (
                  <li key={ing.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="flex-1">{ing.name}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs">{ing.amount} {ing.unit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div>
              <h3 className="text-gray-800 dark:text-gray-100 mb-3" style={{ fontWeight: 600 }}>Instructions</h3>
              <ol className="space-y-3">
                {meal.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center" style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                      {i + 1}
                    </span>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Nutrition Section */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-gray-800 dark:text-gray-100" style={{ fontWeight: 600 }}>Nutritional Values</h3>
              {meal.aiNutrition && (
                <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 flex items-center gap-1 text-xs">
                  <Sparkles className="w-3 h-3" /> AI calculated
                </span>
              )}
            </div>

            {/* Macro Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-orange-50 dark:bg-orange-950/30 rounded-2xl p-3 text-center border border-orange-100 dark:border-orange-900/40">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-orange-700 dark:text-orange-300" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{calories}</p>
                <p className="text-orange-500 dark:text-orange-400 text-xs">Calories</p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-3 text-center border border-indigo-100 dark:border-indigo-900/40">
                <Zap className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                <p className="text-indigo-700 dark:text-indigo-300" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{protein}g</p>
                <p className="text-indigo-500 dark:text-indigo-400 text-xs">Protein</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-3 text-center border border-amber-100 dark:border-amber-900/40">
                <Droplets className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-amber-700 dark:text-amber-300" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{carbs}g</p>
                <p className="text-amber-500 dark:text-amber-400 text-xs">Carbs</p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-3 text-center border border-red-100 dark:border-red-900/40">
                <Leaf className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <p className="text-red-700 dark:text-red-300" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{fat}g</p>
                <p className="text-red-500 dark:text-red-400 text-xs">Fat</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Radar */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-2 text-center">Nutrient Profile</p>
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <Radar dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              {/* Pie */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-2 text-center">Calorie Distribution</p>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                      {pieData.map((entry, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${Math.round((v / (protein * 4 + carbs * 4 + fat * 9)) * 100)}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-3 mt-1">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Extra stats */}
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5 text-center border border-gray-100 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-200" style={{ fontWeight: 600 }}>{fiber}g</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">Fiber</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5 text-center border border-gray-100 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-200" style={{ fontWeight: 600 }}>{sugar}g</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">Sugar</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5 text-center border border-gray-100 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-200" style={{ fontWeight: 600 }}>{sodium}mg</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">Sodium</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
