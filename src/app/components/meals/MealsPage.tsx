import { useState, useMemo } from 'react';
import { Plus, Search, Star, Clock, Flame, ChefHat, Eye, Pencil, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Meal, MealType } from '../../types';
import { MealDetailModal } from './MealDetailModal';
import { AddMealModal } from './AddMealModal';

const TYPE_COLORS: Record<string, string> = {
  Breakfast: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Lunch: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Dinner: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Snack: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

const CATEGORY_COLORS: Record<string, string> = {
  Mediterranean: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  Italian: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  Asian: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  Mexican: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  American: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Healthy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  default: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const ALL_FILTER: MealType | 'All' = 'All';
const MEAL_TYPES: (MealType | 'All')[] = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];

function MealCard({ meal, onView, onEdit, onDelete }: { meal: Meal; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const catColor = CATEGORY_COLORS[meal.category] || CATEGORY_COLORS.default;
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-amber-50 dark:bg-gray-700">
        {meal.image ? (
          <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="w-12 h-12 text-amber-200 dark:text-amber-800" />
          </div>
        )}
        {/* Type badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {meal.types.slice(0, 2).map(type => (
            <span key={type} className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[type]} backdrop-blur-sm`} style={{ fontSize: '0.65rem' }}>
              {type}
            </span>
          ))}
        </div>
        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
          <button onClick={onView} className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-amber-50 dark:hover:bg-gray-700 shadow-md transition-colors" title="View">
            <Eye className="w-4 h-4 text-gray-700 dark:text-gray-200" />
          </button>
          <button onClick={onEdit} className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-amber-50 dark:hover:bg-gray-700 shadow-md transition-colors" title="Edit">
            <Pencil className="w-4 h-4 text-gray-700 dark:text-gray-200" />
          </button>
          <button onClick={onDelete} className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 shadow-md transition-colors" title="Delete">
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
      {/* Info */}
      <div className="p-3">
        <h3 className="text-gray-900 dark:text-white mb-1.5 truncate" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{meal.name}</h3>
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-xs px-2 py-0.5 rounded-full ${catColor}`}>{meal.category}</span>
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`w-3 h-3 ${s <= meal.score ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-600 fill-gray-200 dark:fill-gray-600'}`} />
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
        </div>
      </div>
    </div>
  );
}

export function MealsPage() {
  const { meals, deleteMeal } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MealType | 'All'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'calories' | 'date'>('date');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [editMeal, setEditMeal] = useState<Meal | null | 'new'>('new' as const);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...meals];
    if (search) result = result.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()) || m.tags?.some(t => t.toLowerCase().includes(search.toLowerCase())));
    if (typeFilter !== 'All') result = result.filter(m => m.types.includes(typeFilter));
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'calories') return a.nutritionalValue.calories - b.nutritionalValue.calories;
      return b.createdAt.localeCompare(a.createdAt);
    });
    return result;
  }, [meals, search, typeFilter, sortBy]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '0.875rem' }}>
            {filtered.length} meal{filtered.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-white rounded-xl shadow-sm transition-colors"
          style={{ fontWeight: 600, fontSize: '0.875rem' }}>
          <Plus className="w-4 h-4" />
          Add Meal
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search meals, categories, tags..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-amber-400 text-gray-600 dark:text-gray-300">
            <option value="date">Newest</option>
            <option value="score">Top Rated</option>
            <option value="name">A-Z</option>
            <option value="calories">Calories</option>
          </select>
        </div>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {MEAL_TYPES.map(type => (
          <button key={type} onClick={() => setTypeFilter(type)}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${typeFilter === type ? 'bg-amber-400 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700'}`}
            style={{ fontWeight: typeFilter === type ? 600 : 400 }}>
            {type}
            {type !== 'All' && <span className="ml-1.5 opacity-70" style={{ fontSize: '0.7rem' }}>({meals.filter(m => m.types.includes(type as MealType)).length})</span>}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <ChefHat className="w-12 h-12 text-amber-200 dark:text-amber-800 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No meals found</p>
          {search && <button onClick={() => setSearch('')} className="mt-2 text-amber-500 text-sm hover:underline">Clear search</button>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(meal => (
            <MealCard
              key={meal.id}
              meal={meal}
              onView={() => setSelectedMeal(meal)}
              onEdit={() => { setEditMeal(meal); setShowAdd(true); }}
              onDelete={() => setDeleteConfirm(meal.id)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-gray-900 dark:text-white mb-1" style={{ fontWeight: 600 }}>Delete Meal?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={() => { deleteMeal(deleteConfirm); setDeleteConfirm(null); }} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600" style={{ fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Meal Detail Modal */}
      {selectedMeal && (
        <MealDetailModal
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
          onEdit={() => { setEditMeal(selectedMeal); setShowAdd(true); setSelectedMeal(null); }}
        />
      )}

      {/* Add/Edit Modal */}
      {showAdd && (
        <AddMealModal
          meal={editMeal !== 'new' && editMeal ? editMeal : undefined}
          onClose={() => { setShowAdd(false); setEditMeal('new'); }}
          onSaved={() => { setShowAdd(false); setEditMeal('new'); }}
        />
      )}
    </div>
  );
}
