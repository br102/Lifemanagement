import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UploadReceiptModal } from './UploadReceiptModal';
import { BudgetPanel } from './BudgetPanel';
import { SpendingTrendChart } from './SpendingTrendChart';
import { EditableValue } from './EditableValue';
import { Upload, TrendingDown, Package, DollarSign, AlertCircle, Loader2, ChevronDown, ChevronUp, Trash2, ChefHat } from 'lucide-react';
import type { Receipt, IngredientPrice, MealCostEstimate, GroceryEstimate, Meal, MonthlySpendPoint, BudgetCategory } from '../../types';
import { format, parseISO } from 'date-fns';

export function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'meals' | 'receipts'>('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [ingredientPrices, setIngredientPrices] = useState<IngredientPrice[]>([]);
  const [mealCosts, setMealCosts] = useState<MealCostEstimate[]>([]);
  const [groceryEstimate, setGroceryEstimate] = useState<GroceryEstimate | null>(null);
  const [monthlySpending, setMonthlySpending] = useState<MonthlySpendPoint[]>([]);
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [expandedReceipt, setExpandedReceipt] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { loadReceiptHistory, loadIngredientPrices, loadMealCosts, getGroceryEstimate, meals, updateIngredientPrice, deleteIngredientPrice, updateReceipt, deleteReceipt, loadMonthlySpending, loadBudgets } = useApp();

  const loadData = async () => {
    try {
      setLoading(true);
      const [r, p, m, spend, budg] = await Promise.all([
        loadReceiptHistory(),
        loadIngredientPrices(),
        loadMealCosts(),
        loadMonthlySpending(6),
        loadBudgets(selectedMonth),
      ]);
      setReceipts(r);
      setIngredientPrices(p);
      setMealCosts(m);
      setMonthlySpending(spend);
      setBudgets(budg);

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
  }, [selectedWeek, selectedMonth]);

  const totalSpent = receipts.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const avgPrice = ingredientPrices.length > 0 ? ingredientPrices.reduce((sum, p) => sum + p.unitPrice, 0) / ingredientPrices.length : 0;
  const mealsWithCosts = mealCosts.filter((m) => m.estimatedCost > 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);

  const handleDeleteIngredientPrice = async (priceId: string) => {
    if (window.confirm('Delete this ingredient price?')) {
      try {
        await deleteIngredientPrice(priceId);
        setIngredientPrices((prev) => prev.filter((p) => p.priceId !== priceId));
      } catch (err) {
        console.error('Failed to delete ingredient price:', err);
        alert('Failed to delete price');
      }
    }
  };

  const handleUpdateIngredientPrice = async (priceId: string, updates: any) => {
    try {
      await updateIngredientPrice(priceId, updates);
      setIngredientPrices((prev) => prev.map((p) => (p.priceId === priceId ? { ...p, ...updates } : p)));
    } catch (err) {
      console.error('Failed to update price:', err);
    }
  };

  const handleDeleteReceipt = async (receiptId: string) => {
    if (window.confirm('Delete this receipt?')) {
      try {
        setDeletingId(receiptId);
        await deleteReceipt(receiptId);
        setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
      } catch (err) {
        console.error('Failed to delete receipt:', err);
        alert('Failed to delete receipt');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleUpdateReceipt = async (receiptId: string, updates: any) => {
    try {
      await updateReceipt(receiptId, updates);
      const updated = receipts.map((r) => (r.id === receiptId ? { ...r, ...updates } : r));
      setReceipts(updated);
    } catch (err) {
      console.error('Failed to update receipt:', err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {['overview', 'ingredients', 'meals', 'receipts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-3 text-sm font-semibold capitalize transition-colors whitespace-nowrap ${
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

          {/* Spending Trend & Budgets */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
            </div>
          ) : (
            <>
              <SpendingTrendChart data={monthlySpending} budgetLimit={totalBudget} />
              <BudgetPanel month={selectedMonth} />
            </>
          )}

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

            {groceryEstimate ? (
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
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Category</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Unit Price</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Unit</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Last Purchase</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {ingredientPrices.map((price) => (
                    <tr key={price.priceId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{price.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                          {price.category || 'Other'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <EditableValue
                          value={price.unitPrice}
                          type="number"
                          onSave={(v) => handleUpdateIngredientPrice(price.priceId!, { unitPrice: v })}
                          displayFormat={(v) => `${(v as number).toFixed(2)} ${price.currency}`}
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{price.unit}</td>
                      <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{format(parseISO(price.purchaseDate), 'MMM d')}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDeleteIngredientPrice(price.priceId!)}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
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
            mealsWithCosts.map((meal) => {
              const mealDetail = meals.find((m) => m.id === meal.mealId);
              return (
                <div
                  key={meal.mealId}
                  onClick={() => mealDetail && setSelectedMeal(mealDetail)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4"
                >
                  {mealDetail?.image ? (
                    <img src={mealDetail.image} alt={meal.mealName} className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <ChefHat className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
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
              );
            })
          )}

          {/* Meal Detail Modal */}
          {selectedMeal && <MealDetailCard meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
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
                <div
                  key={receipt.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Receipt Header */}
                  <button
                    onClick={() => setExpandedReceipt(expandedReceipt === receipt.id ? null : receipt.id)}
                    className="w-full p-4 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 text-left">
                      {receipt.imageUrl && (
                        <img
                          src={receipt.imageUrl}
                          alt="Receipt"
                          className="w-12 h-12 rounded object-cover cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagePreview(receipt.imageUrl);
                          }}
                        />
                      )}
                      <div>
                        <p className="text-gray-900 dark:text-white font-semibold">{receipt.store}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{format(parseISO(receipt.purchaseDate), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {receipt.totalAmount && (
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">{receipt.totalAmount.toFixed(2)} {receipt.currency}</p>
                      )}
                      {expandedReceipt === receipt.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {/* Receipt Details (Expanded) */}
                  {expandedReceipt === receipt.id && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Items ({receipt.items.length})</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {receipt.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/30 rounded text-sm gap-2">
                              <div className="flex-1">
                                <p className="text-gray-900 dark:text-white">{item.name}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{item.quantity}{item.unit} @ {item.price.toFixed(2)}{receipt.currency}</p>
                              </div>
                              <button
                                onClick={() => {
                                  const updated = receipt.items.filter((_, i) => i !== idx);
                                  handleUpdateReceipt(receipt.id, { items: updated });
                                }}
                                className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delete Receipt */}
                      <button
                        onClick={() => handleDeleteReceipt(receipt.id)}
                        disabled={deletingId === receipt.id}
                        className="w-full py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-semibold"
                      >
                        {deletingId === receipt.id ? 'Deleting...' : 'Delete Receipt'}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Image Preview Lightbox */}
      {imagePreview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setImagePreview(null)}
        >
          <img src={imagePreview} alt="Receipt Preview" className="max-w-full max-h-[90vh] rounded-lg" />
        </div>
      )}

      {/* Upload Modal */}
      <UploadReceiptModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onSuccess={loadData} />
    </div>
  );
}

// Simple meal detail inline display
function MealDetailCard({ meal, onClose }: { meal: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{meal.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {meal.image && <img src={meal.image} alt={meal.name} className="w-full h-64 object-cover rounded-lg" />}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Prep Time</p>
              <p className="font-semibold text-gray-900 dark:text-white">{meal.prepTime || 'N/A'} min</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cook Time</p>
              <p className="font-semibold text-gray-900 dark:text-white">{meal.cookTime || 'N/A'} min</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Servings</p>
              <p className="font-semibold text-gray-900 dark:text-white">{meal.servings || 'N/A'}</p>
            </div>
          </div>

          {meal.steps && meal.steps.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Instructions</h3>
              <ol className="list-decimal list-inside space-y-2">
                {meal.steps.map((step: string, idx: number) => (
                  <li key={idx} className="text-gray-700 dark:text-gray-300">{step}</li>
                ))}
              </ol>
            </div>
          )}

          {meal.ingredients && meal.ingredients.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Ingredients</h3>
              <ul className="space-y-2">
                {meal.ingredients.map((ing: any, idx: number) => (
                  <li key={idx} className="text-gray-700 dark:text-gray-300">• {ing.amount} {ing.unit} {ing.name}</li>
                ))}
              </ul>
            </div>
          )}

          {meal.nutritionalValue && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Nutrition (per serving)</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-600 dark:text-gray-400">Calories</p><p className="font-semibold text-gray-900 dark:text-white">{meal.nutritionalValue.calories}</p></div>
                <div><p className="text-gray-600 dark:text-gray-400">Protein</p><p className="font-semibold text-gray-900 dark:text-white">{meal.nutritionalValue.protein}g</p></div>
                <div><p className="text-gray-600 dark:text-gray-400">Carbs</p><p className="font-semibold text-gray-900 dark:text-white">{meal.nutritionalValue.carbs}g</p></div>
                <div><p className="text-gray-600 dark:text-gray-400">Fat</p><p className="font-semibold text-gray-900 dark:text-white">{meal.nutritionalValue.fat}g</p></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
