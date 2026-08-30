import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UploadReceiptModal } from './UploadReceiptModal';
import { Upload, TrendingDown, Package, DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import type { Receipt, IngredientPrice, MealCostEstimate, GroceryEstimate } from '../../types';
import { format, parseISO } from 'date-fns';

export function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'meals' | 'receipts'>('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [ingredientPrices, setIngredientPrices] = useState<IngredientPrice[]>([]);
  const [mealCosts, setMealCosts] = useState<MealCostEstimate[]>([]);
  const [groceryEstimate, setGroceryEstimate] = useState<GroceryEstimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(new Date().toISOString().split('T')[0]);

  const { loadReceiptHistory, loadIngredientPrices, loadMealCosts, getGroceryEstimate, weekPlans } = useApp();

  const loadData = async () => {
    try {
      setLoading(true);
      const [r, p, m] = await Promise.all([loadReceiptHistory(), loadIngredientPrices(), loadMealCosts()]);
      setReceipts(r);
      setIngredientPrices(p);
      setMealCosts(m);

      try {
        const est = await getGroceryEstimate(selectedWeek);
        setGroceryEstimate(est);
      } catch {
        setGroceryEstimate(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedWeek]);

  const totalSpent = receipts.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const avgPrice = ingredientPrices.length > 0 ? ingredientPrices.reduce((sum, p) => sum + p.unitPrice, 0) / ingredientPrices.length : 0;
  const mealsWithCosts = mealCosts.filter((m) => m.estimatedCost > 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {['overview', 'ingredients', 'meals', 'receipts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-3 text-sm font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Spent', value: `${totalSpent.toFixed(2)} PLN`, icon: DollarSign, color: 'text-green-500' },
              { label: 'Receipts', value: receipts.length.toString(), icon: Package, color: 'text-blue-500' },
              { label: 'Ingredients', value: ingredientPrices.length.toString(), icon: TrendingDown, color: 'text-purple-500' },
              { label: 'Avg Unit Price', value: `${avgPrice.toFixed(2)} PLN`, icon: DollarSign, color: 'text-orange-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className={`${stat.color} mb-2`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold mb-1">{stat.label}</p>
                <p className="text-gray-900 dark:text-white text-lg font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Grocery Estimate */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Grocery Budget</h3>
              <input
                type="date"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
              </div>
            ) : groceryEstimate ? (
              <div>
                <div className="text-4xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                  {groceryEstimate.totalCost.toFixed(2)} {groceryEstimate.currency}
                </div>
                {groceryEstimate.missingItems.length > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-300">
                    Missing prices for: {groceryEstimate.missingItems.join(', ')}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No grocery list for this week or all items missing price data</p>
            )}
          </div>
        </div>
      )}

      {/* Ingredients Tab */}
      {activeTab === 'ingredients' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {ingredientPrices.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No ingredient prices tracked yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Ingredient</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Unit Price</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Unit</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Last Purchase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {ingredientPrices.map((price) => (
                    <tr key={`${price.ingredientId}-${price.purchaseDate}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{price.name}</td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 font-semibold">
                        {price.unitPrice.toFixed(2)} {price.currency}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{price.unit}</td>
                      <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{format(parseISO(price.purchaseDate), 'MMM d')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Meals Tab */}
      {activeTab === 'meals' && (
        <div className="space-y-3">
          {mealCosts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No meals tracked yet</p>
            </div>
          ) : (
            mealsWithCosts.map((meal) => (
              <div key={meal.mealId} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <p className="text-gray-900 dark:text-white font-semibold">{meal.mealName}</p>
                  {meal.missingIngredients.length > 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Missing: {meal.missingIngredients.slice(0, 2).join(', ')}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {meal.estimatedCost.toFixed(2)} {meal.currency}
                  </p>
                  {meal.missingIngredients.length > 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">partial estimate</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Receipts Tab */}
      {activeTab === 'receipts' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowUploadModal(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-500 text-white rounded-xl font-semibold transition-colors"
          >
            <Upload className="w-5 h-5" />
            Upload Receipt
          </button>

          <div className="space-y-3">
            {receipts.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-amber-200 dark:border-amber-800/50">
                <Upload className="w-10 h-10 text-amber-200 dark:text-amber-800 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No receipts uploaded yet</p>
              </div>
            ) : (
              receipts.map((receipt) => (
                <div key={receipt.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-gray-900 dark:text-white font-semibold">{receipt.store}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{format(parseISO(receipt.purchaseDate), 'MMM d, yyyy')}</p>
                    </div>
                    {receipt.totalAmount && (
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{receipt.totalAmount.toFixed(2)} {receipt.currency}</p>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    {receipt.items.slice(0, 3).map((item, i) => (
                      <p key={i} className="text-gray-600 dark:text-gray-400">
                        {item.name} — {item.quantity}{item.unit} @ {item.price.toFixed(2)}{receipt.currency}
                      </p>
                    ))}
                    {receipt.items.length > 3 && (
                      <p className="text-gray-400 dark:text-gray-500 text-xs">+{receipt.items.length - 3} more items</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadReceiptModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onSuccess={loadData} />
    </div>
  );
}
