import { useState, useMemo } from 'react';
import { Search, Star, Clock, Flame, Leaf, Eye, Pencil, Trash2, X, Sprout, ChefHat } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getMealVeggieType } from '../../utils/veggieUtils';
import type { Meal } from '../../types';
import { MealDetailModal } from '../meals/MealDetailModal';
import { AddMealModal } from '../meals/AddMealModal';

const CATEGORY_COLORS: Record<string, string> = {
  Mediterranean: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  Italian: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  Asian: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  Mexican: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  American: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Healthy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  default: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

type VeggieFilter = 'All' | 'Vegan' | 'Vegetarian';

function VeggieCard({
  meal,
  veggieType,
  onView,
  onEdit,
  onDelete,
}: {
  meal: Meal;
  veggieType: 'vegan' | 'vegetarian';
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const catColor = CATEGORY_COLORS[meal.category] || CATEGORY_COLORS.default;
  const isVegan = veggieType === 'vegan';

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-green-50 dark:bg-gray-700">
        {meal.image ? (
          <img
            src={meal.image}
            alt={meal.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf className="w-12 h-12 text-green-200" />
          </div>
        )}
        {/* Vegan / Vegetarian badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full backdrop-blur-sm ${
              isVegan
                ? 'bg-green-500/90 text-white'
                : 'bg-lime-400/90 text-green-900'
            }`}
            style={{ fontSize: '0.65rem', fontWeight: 600 }}
          >
            {isVegan ? <Sprout className="w-2.5 h-2.5" /> : <Leaf className="w-2.5 h-2.5" />}
            {isVegan ? 'Vegan' : 'Vegetarian'}
          </span>
        </div>
        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
          <button
            onClick={onView}
            className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-green-50 dark:hover:bg-gray-700 shadow-md transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4 text-gray-700 dark:text-gray-200" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-green-50 dark:hover:bg-gray-700 shadow-md transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4 text-gray-700 dark:text-gray-200" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 shadow-md transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
      {/* Info */}
      <div className="p-3">
        <h3 className="text-gray-900 dark:text-white mb-1.5 truncate" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
          {meal.name}
        </h3>
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-xs px-2 py-0.5 rounded-full ${catColor}`}>{meal.category}</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
              <Star
                key={s}
                className={`w-3 h-3 ${s <= meal.score ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500" style={{ fontSize: '0.75rem' }}>
          <span className="flex items-center gap-0.5">
            <Flame className="w-3 h-3 text-orange-400" />
            {meal.nutritionalValue.calories} kcal
          </span>
          {meal.prepTime !== undefined && (
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {meal.prepTime + (meal.cookTime || 0)}min
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <Leaf className="w-3 h-3 text-green-400" />
            {meal.nutritionalValue.fiber}g fiber
          </span>
        </div>
      </div>
    </div>
  );
}

export function VeggiesPage() {
  const { meals, deleteMeal } = useApp();
  const [search, setSearch] = useState('');
  const [veggieFilter, setVeggieFilter] = useState<VeggieFilter>('All');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'calories' | 'fiber'>('score');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [editMeal, setEditMeal] = useState<Meal | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Classify all meals
  const classifiedMeals = useMemo(
    () =>
      meals
        .map(m => ({ meal: m, veggieType: getMealVeggieType(m) }))
        .filter(({ veggieType }) => veggieType !== 'none'),
    [meals],
  );

  const veganCount = useMemo(() => classifiedMeals.filter(x => x.veggieType === 'vegan').length, [classifiedMeals]);
  const vegCount = useMemo(() => classifiedMeals.filter(x => x.veggieType === 'vegetarian').length, [classifiedMeals]);

  const filtered = useMemo(() => {
    let result = [...classifiedMeals];
    if (search) {
      result = result.filter(
        ({ meal: m }) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.category.toLowerCase().includes(search.toLowerCase()) ||
          m.tags?.some(t => t.toLowerCase().includes(search.toLowerCase())),
      );
    }
    if (veggieFilter === 'Vegan') result = result.filter(x => x.veggieType === 'vegan');
    if (veggieFilter === 'Vegetarian') result = result.filter(x => x.veggieType === 'vegetarian');
    result.sort((a, b) => {
      if (sortBy === 'name') return a.meal.name.localeCompare(b.meal.name);
      if (sortBy === 'score') return b.meal.score - a.meal.score;
      if (sortBy === 'calories') return a.meal.nutritionalValue.calories - b.meal.nutritionalValue.calories;
      if (sortBy === 'fiber') return b.meal.nutritionalValue.fiber - a.meal.nutritionalValue.fiber;
      return 0;
    });
    return result;
  }, [classifiedMeals, search, veggieFilter, sortBy]);

  const avgCalories = useMemo(() => {
    if (classifiedMeals.length === 0) return 0;
    return Math.round(classifiedMeals.reduce((acc, { meal: m }) => acc + m.nutritionalValue.calories, 0) / classifiedMeals.length);
  }, [classifiedMeals]);

  const avgFiber = useMemo(() => {
    if (classifiedMeals.length === 0) return 0;
    return (classifiedMeals.reduce((acc, { meal: m }) => acc + m.nutritionalValue.fiber, 0) / classifiedMeals.length).toFixed(1);
  }, [classifiedMeals]);

  const FILTERS: VeggieFilter[] = ['All', 'Vegan', 'Vegetarian'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-100 dark:border-green-900/50 shadow-sm">
          <p className="text-gray-400 dark:text-gray-500" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Recipes</p>
          <p className="text-gray-900 dark:text-white mt-0.5" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{classifiedMeals.length}</p>
          <p className="text-green-600 dark:text-green-400 flex items-center gap-1 mt-0.5" style={{ fontSize: '0.7rem' }}>
            <Leaf className="w-3 h-3" /> Plant-based
          </p>
        </div>
        <div className="bg-green-500 dark:bg-green-700 rounded-xl p-4 shadow-sm">
          <p className="text-green-100" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vegan</p>
          <p className="text-white mt-0.5" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{veganCount}</p>
          <p className="text-green-200 flex items-center gap-1 mt-0.5" style={{ fontSize: '0.7rem' }}>
            <Sprout className="w-3 h-3" /> 100% plant
          </p>
        </div>
        <div className="bg-lime-400 dark:bg-lime-700 rounded-xl p-4 shadow-sm">
          <p className="text-lime-900 dark:text-lime-100" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vegetarian</p>
          <p className="text-lime-900 dark:text-lime-100 mt-0.5" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{vegCount}</p>
          <p className="text-lime-800 dark:text-lime-200 flex items-center gap-1 mt-0.5" style={{ fontSize: '0.7rem' }}>
            <Leaf className="w-3 h-3" /> With dairy/eggs
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-100 dark:border-green-900/50 shadow-sm">
          <p className="text-gray-400 dark:text-gray-500" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avg. Fiber</p>
          <p className="text-gray-900 dark:text-white mt-0.5" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{avgFiber}g</p>
          <p className="text-green-600 dark:text-green-400 flex items-center gap-1 mt-0.5" style={{ fontSize: '0.7rem' }}>
            <Flame className="w-3 h-3 text-orange-400" /> ~{avgCalories} kcal avg
          </p>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search veggie recipes, categories, tags..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-400 dark:focus:border-green-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-green-400 text-gray-600 dark:text-gray-300"
        >
          <option value="score">Top Rated</option>
          <option value="name">A–Z</option>
          <option value="calories">Lowest Cal</option>
          <option value="fiber">Most Fiber</option>
        </select>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setVeggieFilter(f)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-all ${
              veggieFilter === f
                ? f === 'Vegan'
                  ? 'bg-green-500 text-white shadow-sm'
                  : f === 'Vegetarian'
                  ? 'bg-lime-400 text-green-900 shadow-sm'
                  : 'bg-green-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
            }`}
            style={{ fontWeight: veggieFilter === f ? 600 : 400 }}
          >
            {f === 'Vegan' && <Sprout className="w-3.5 h-3.5" />}
            {f === 'Vegetarian' && <Leaf className="w-3.5 h-3.5" />}
            {f === 'All' && <Leaf className="w-3.5 h-3.5" />}
            {f}
            {f !== 'All' && (
              <span className="opacity-70" style={{ fontSize: '0.7rem' }}>
                ({f === 'Vegan' ? veganCount : vegCount})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-green-400 dark:text-green-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-1">No veggie recipes found</p>
          {search && (
            <button onClick={() => setSearch('')} className="mt-1 text-green-500 text-sm hover:underline">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
            Showing {filtered.length} plant-based recipe{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(({ meal, veggieType }) => (
              <VeggieCard
                key={meal.id}
                meal={meal}
                veggieType={veggieType}
                onView={() => setSelectedMeal(meal)}
                onEdit={() => { setEditMeal(meal); setShowAdd(true); }}
                onDelete={() => setDeleteConfirm(meal.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-gray-900 dark:text-white mb-1" style={{ fontWeight: 600 }}>Delete Recipe?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => { deleteMeal(deleteConfirm); setDeleteConfirm(null); }}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600"
                style={{ fontWeight: 600 }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meal Detail Modal */}
      {selectedMeal && (
        <MealDetailModal
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
          onEdit={() => {
            setEditMeal(selectedMeal);
            setShowAdd(true);
            setSelectedMeal(null);
          }}
        />
      )}

      {/* Edit Modal */}
      {showAdd && (
        <AddMealModal
          meal={editMeal ?? undefined}
          onClose={() => { setShowAdd(false); setEditMeal(null); }}
          onSaved={() => { setShowAdd(false); setEditMeal(null); }}
        />
      )}
    </div>
  );
}