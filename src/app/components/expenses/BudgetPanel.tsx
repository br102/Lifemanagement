import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BudgetCategory } from '../../types';
import { EditableValue } from './EditableValue';

interface BudgetPanelProps {
  month: string;
}

export function BudgetPanel({ month }: BudgetPanelProps) {
  const { loadBudgets, saveBudgets } = useApp();
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await loadBudgets(month);
        setBudgets(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [month, loadBudgets]);

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remaining = totalBudget - totalSpent;
  const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const handleUpdateBudget = async (category: string, newLimit: number) => {
    const updated = budgets.map((b) => (b.category === category ? { ...b, limit: newLimit } : b));
    setBudgets(updated);
    try {
      setIsSaving(true);
      await saveBudgets(
        month,
        updated.map((b) => ({ category: b.category, amountLimit: b.limit })),
      );
    } catch (err) {
      setBudgets(budgets);
      console.error('Failed to save budget:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim() || !newAmount) return;

    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) return;

    const updated = [...budgets, { category: newCategory, limit: amount, spent: 0, currency: 'PLN' }];
    setBudgets(updated);
    setNewCategory('');
    setNewAmount('');

    try {
      setIsSaving(true);
      await saveBudgets(
        month,
        updated.map((b) => ({ category: b.category, amountLimit: b.limit })),
      );
    } catch (err) {
      setBudgets(budgets);
      console.error('Failed to add budget:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveCategory = async (category: string) => {
    const updated = budgets.filter((b) => b.category !== category);
    setBudgets(updated);

    try {
      setIsSaving(true);
      await saveBudgets(
        month,
        updated.map((b) => ({ category: b.category, amountLimit: b.limit })),
      );
    } catch (err) {
      setBudgets(budgets);
      console.error('Failed to remove budget:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Monthly Budget — {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>

        {/* Overall Summary */}
        {budgets.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Budget</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSpent.toFixed(2)} / {totalBudget.toFixed(2)} PLN</p>
              </div>
              <div className={`text-right font-semibold ${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {remaining >= 0 ? '+' : ''}{remaining.toFixed(2)} PLN
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all ${percentSpent <= 75 ? 'bg-green-500' : percentSpent <= 100 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(percentSpent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">{percentSpent.toFixed(1)}% of budget spent</p>
          </div>
        )}
      </div>

      {/* Category Budget Items */}
      <div className="space-y-3">
        {budgets.map((budget) => {
          const spent = budget.spent;
          const limit = budget.limit;
          const percentCategory = (spent / limit) * 100;
          const isOver = spent > limit;

          return (
            <div key={budget.category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{budget.category}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{spent.toFixed(2)} / <EditableValue value={limit} type="number" onSave={(v) => handleUpdateBudget(budget.category, v as number)} className="inline" /> PLN</p>
                </div>
                <button
                  onClick={() => handleRemoveCategory(budget.category)}
                  disabled={isSaving}
                  className="px-2 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  Remove
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${isOver ? 'bg-red-500' : percentCategory <= 75 ? 'bg-green-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(percentCategory, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Category */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Add Budget Category</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category name"
            className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          <input
            type="number"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="Limit"
            step="0.01"
            className="w-24 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          <button
            onClick={handleAddCategory}
            disabled={isSaving || !newCategory.trim() || !newAmount}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
