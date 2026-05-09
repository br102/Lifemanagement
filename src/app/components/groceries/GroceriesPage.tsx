import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ShoppingCart, Sparkles, Loader2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Check, Clock, AlertCircle, CheckCircle2, Leaf, Package, Fish, Milk, Wheat, Snowflake, Coffee, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useApp } from '../../context/AppContext';
import type { GroceryItem } from '../../types';

const WEEK_STARTS = [
  '2026-04-27',
  '2026-05-04',
  '2026-05-11',
  '2026-04-20',
];

const CATEGORY_ICONS: Record<string, ReactNode> = {
  'Produce': <Leaf className="w-4 h-4 text-green-500" />,
  'Meat & Seafood': <Fish className="w-4 h-4 text-red-500" />,
  'Dairy & Eggs': <Milk className="w-4 h-4 text-blue-500" />,
  'Bakery & Grains': <Wheat className="w-4 h-4 text-amber-500" />,
  'Pantry & Spices': <Package className="w-4 h-4 text-purple-500" />,
  'Frozen': <Snowflake className="w-4 h-4 text-sky-500" />,
  'Beverages': <Coffee className="w-4 h-4 text-orange-500" />,
};

const URGENCY_STYLES: Record<string, { badge: string; dot: string; label: string }> = {
  today: { badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800', dot: 'bg-red-500', label: 'Buy Today!' },
  'this-week': { badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', dot: 'bg-amber-400', label: 'This Week' },
  anytime: { badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800', dot: 'bg-green-400', label: 'Anytime' },
};

function GroceryItemRow({ item, listId }: { item: GroceryItem; listId: string }) {
  const { toggleGroceryItem } = useApp();
  const urgency = URGENCY_STYLES[item.urgency || 'anytime'];

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${item.checked ? 'opacity-50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
      <button
        onClick={() => toggleGroceryItem(listId, item.id)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600 hover:border-green-400'}`}>
        {item.checked && <Check className="w-3 h-3 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm ${item.checked ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-200'}`} style={{ fontWeight: 500 }}>
            {item.name}
          </span>
          {!item.checked && (
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-xs ${urgency.badge}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
              {urgency.label}
            </span>
          )}
        </div>
        {item.forMeals && item.forMeals.length > 0 && (
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5 truncate">For: {item.forMeals.join(', ')}</p>
        )}
        {item.notes && !item.checked && (
          <p className="text-amber-600 dark:text-amber-400 text-xs mt-0.5">{item.notes}</p>
        )}
        {item.buyByDate && !item.checked && (
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Buy by {format(parseISO(item.buyByDate), 'MMM d')}
          </p>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-gray-700 dark:text-gray-300 text-sm" style={{ fontWeight: 500 }}>{item.quantity} {item.unit}</p>
      </div>
    </div>
  );
}

interface CategorySectionProps {
  category: string;
  items: GroceryItem[];
  listId: string;
}

function CategorySection({ category, items, listId }: CategorySectionProps) {
  const [expanded, setExpanded] = useState(true);
  const checkedCount = items.filter(i => i.checked).length;
  const urgentCount = items.filter(i => !i.checked && i.urgency === 'today').length;

  return (
    <div className="mb-3">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left">
        <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 flex items-center justify-center flex-shrink-0">
          {CATEGORY_ICONS[category] || <Package className="w-4 h-4 text-gray-400" />}
        </div>
        <span className="flex-1 text-gray-800 dark:text-gray-200" style={{ fontWeight: 600, fontSize: '0.9rem' }}>{category}</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 dark:text-gray-500 text-xs">{checkedCount}/{items.length}</span>
          {urgentCount > 0 && (
            <span className="flex items-center gap-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full text-xs">
              <AlertCircle className="w-3 h-3" />
              {urgentCount} urgent
            </span>
          )}
          {checkedCount === items.length && (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
        </div>
      </button>

      {expanded && (
        <div className="ml-4 border-l-2 border-gray-100 dark:border-gray-700 pl-3">
          {items.map(item => (
            <GroceryItemRow key={item.id} item={item} listId={listId} />
          ))}
        </div>
      )}
    </div>
  );
}

export function GroceriesPage() {
  const { weekPlans, groceryLists, getGroceryList, saveGroceryList, aiGenerateGroceryList } = useApp();
  const [selectedWeek, setSelectedWeek] = useState('2026-04-27');
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const availableWeeks = [...new Set([...WEEK_STARTS, ...weekPlans.map(p => p.startDate)])].sort();
  const groceryList = getGroceryList(selectedWeek);

  const categorized = useMemo(() => {
    if (!groceryList) return {};
    const categoryOrder = ['Meat & Seafood', 'Produce', 'Dairy & Eggs', 'Bakery & Grains', 'Pantry & Spices', 'Frozen', 'Beverages'];
    const map: Record<string, GroceryItem[]> = {};
    groceryList.items.forEach(item => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    Object.values(map).forEach(items => {
      items.sort((a, b) => {
        const order = { today: 0, 'this-week': 1, anytime: 2 };
        return (order[a.urgency || 'anytime']) - (order[b.urgency || 'anytime']);
      });
    });
    const sorted: Record<string, GroceryItem[]> = {};
    categoryOrder.forEach(cat => { if (map[cat]) sorted[cat] = map[cat]; });
    Object.keys(map).forEach(cat => { if (!sorted[cat]) sorted[cat] = map[cat]; });
    return sorted;
  }, [groceryList]);

  const filteredCategorized = useMemo(() => {
    if (filter === 'all') return categorized;
    const result: Record<string, GroceryItem[]> = {};
    Object.entries(categorized).forEach(([cat, items]) => {
      const filtered = items.filter(item => filter === 'pending' ? !item.checked : item.checked);
      if (filtered.length > 0) result[cat] = filtered;
    });
    return result;
  }, [categorized, filter]);

  const stats = useMemo(() => {
    if (!groceryList) return null;
    const total = groceryList.items.length;
    const checked = groceryList.items.filter(i => i.checked).length;
    const urgent = groceryList.items.filter(i => !i.checked && i.urgency === 'today').length;
    const thisWeek = groceryList.items.filter(i => !i.checked && i.urgency === 'this-week').length;
    return { total, checked, urgent, thisWeek, remaining: total - checked };
  }, [groceryList]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const list = await aiGenerateGroceryList(selectedWeek);
      saveGroceryList(list);
    } finally {
      setGenerating(false);
    }
  };

  const weekHasPlan = weekPlans.some(p => p.startDate === selectedWeek);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Week Selector + Generate */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 shadow-sm">
          <button onClick={() => {
            const idx = availableWeeks.indexOf(selectedWeek);
            if (idx > 0) setSelectedWeek(availableWeeks[idx - 1]);
          }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="text-gray-800 dark:text-gray-200 min-w-[180px] text-center" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            Week of {format(parseISO(selectedWeek), 'MMM d, yyyy')}
          </span>
          <button onClick={() => {
            const idx = availableWeeks.indexOf(selectedWeek);
            if (idx < availableWeeks.length - 1) setSelectedWeek(availableWeeks[idx + 1]);
          }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <button onClick={handleGenerate} disabled={generating || !weekHasPlan}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-sm shadow-sm transition-colors ml-auto"
          style={{ fontWeight: 600 }}>
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? 'Generating...' : groceryList ? 'Regenerate List' : 'Generate AI List'}
        </button>
      </div>

      {/* AI Loading */}
      {generating && (
        <div className="mb-4 p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-violet-500 animate-spin flex-shrink-0" />
          <div>
            <p className="text-violet-700 dark:text-violet-300 text-sm" style={{ fontWeight: 600 }}>AI is building your grocery list...</p>
            <p className="text-violet-400 dark:text-violet-500 text-xs">Analysing meal plan, checking expiry dates & planning optimal purchase times</p>
          </div>
        </div>
      )}

      {!weekHasPlan && !groceryList && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-700 dark:text-amber-300 text-sm" style={{ fontWeight: 500 }}>No meal plan for this week</p>
            <p className="text-amber-600 dark:text-amber-400 text-xs">Go to the Meal Planner to create a plan first, then generate your grocery list.</p>
          </div>
        </div>
      )}

      {groceryList ? (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Total', value: stats?.total, color: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' },
              { label: 'Pending', value: stats?.remaining, color: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300' },
              { label: 'Urgent', value: stats?.urgent, color: stats!.urgent > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800', text: stats!.urgent > 0 ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300' },
              { label: 'Done', value: stats?.checked, color: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300' },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
                <p className={`${s.text}`} style={{ fontSize: '1.3rem', fontWeight: 700 }}>{s.value}</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-gray-500 dark:text-gray-400 text-xs">Shopping progress</span>
              <span className="text-gray-600 dark:text-gray-300 text-xs" style={{ fontWeight: 600 }}>{Math.round((stats!.checked / stats!.total) * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full transition-all duration-500" style={{ width: `${(stats!.checked / stats!.total) * 100}%` }} />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-5">
            {(['all', 'pending', 'done'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-sm capitalize transition-all ${filter === f ? 'bg-amber-400 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700'}`}>
                {f}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1 text-gray-400 dark:text-gray-500 text-xs">
              <Clock className="w-3 h-3" />
              Generated {format(parseISO(groceryList.generatedAt), 'MMM d, HH:mm')}
            </div>
          </div>

          {/* Urgency Legend */}
          {stats!.urgent > 0 && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300 text-sm">
                <span style={{ fontWeight: 600 }}>{stats!.urgent} item{stats!.urgent > 1 ? 's' : ''} need to be purchased TODAY</span> for scheduled meals.
              </p>
            </div>
          )}

          {/* Category Sections */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-amber-50 dark:border-gray-700">
            {Object.keys(filteredCategorized).length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {filter === 'pending' ? 'No pending items.' : filter === 'done' ? 'No checked items yet.' : 'All items checked off!'}
                </p>
              </div>
            ) : (
              Object.entries(filteredCategorized).map(([cat, items]) => (
                <CategorySection key={cat} category={cat} items={items} listId={groceryList.id} />
              ))
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 mt-4">
            {stats!.checked > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Trash2 className="w-4 h-4" />
                Clear checked
              </button>
            )}
          </div>
        </>
      ) : !generating && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-amber-200 dark:border-amber-800/50">
          <ShoppingCart className="w-12 h-12 text-amber-200 dark:text-amber-800 mx-auto mb-3" />
          <h3 className="text-gray-700 dark:text-gray-300 mb-2" style={{ fontWeight: 600 }}>No grocery list yet</h3>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-5 max-w-xs mx-auto">
            {weekHasPlan
              ? "Click 'Generate AI List' to create a smart grocery list based on your meal plan."
              : "Create a meal plan for this week first, then generate your grocery list."
            }
          </p>
          {weekHasPlan && (
            <button onClick={handleGenerate}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm mx-auto transition-colors"
              style={{ fontWeight: 600 }}>
              <Sparkles className="w-4 h-4" />
              Generate AI List
            </button>
          )}
        </div>
      )}

      {/* Clear Confirm Modal */}
      {showClearConfirm && groceryList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-gray-900 dark:text-white mb-1" style={{ fontWeight: 600 }}>Clear Checked Items?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">Remove {stats?.checked} checked items from the list.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-2.5 bg-amber-400 text-white rounded-xl text-sm hover:bg-amber-500" style={{ fontWeight: 600 }}>Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
