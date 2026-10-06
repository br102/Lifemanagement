import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MonthlySpendPoint } from '../../types';

interface SpendingTrendChartProps {
  data: MonthlySpendPoint[];
  budgetLimit?: number;
  currency?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Produce': '#ef4444',
  'Dairy': '#f97316',
  'Meat': '#eab308',
  'Bakery': '#22c55e',
  'Frozen': '#06b6d4',
  'Beverages': '#0ea5e9',
  'Household': '#8b5cf6',
  'Snacks': '#ec4899',
  'Pantry & Spices': '#6366f1',
  'Other': '#64748b',
};

const getCategoryColor = (category: string): string => CATEGORY_COLORS[category] || '#94a3b8';

export function SpendingTrendChart({ data, budgetLimit, currency = 'PLN' }: SpendingTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/30 rounded-xl">
        <p className="text-gray-500 dark:text-gray-400">No spending data available</p>
      </div>
    );
  }

  const currentMonth = data[data.length - 1];
  const categoryBreakdown = Object.entries(currentMonth.byCategory)
    .map(([category, amount]) => ({
      name: category,
      value: Math.round(amount * 100) / 100,
    }))
    .sort((a, b) => b.value - a.value);

  const trendData = data.map((d) => ({
    month: new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    total: Math.round(d.total * 100) / 100,
  }));

  return (
    <div className="space-y-6">
      {/* Trend Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Spending Trend</h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value) => `${value} ${currency}`}
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#f59e0b"
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
            {budgetLimit && (
              <ReferenceLine
                y={budgetLimit}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{ value: `Budget: ${budgetLimit} ${currency}`, position: 'right', fill: '#ef4444', fontSize: 12 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending by Category (Current Month)</h4>
          <div className="flex flex-col lg:flex-row gap-6">
            <ResponsiveContainer width="100%" height={300} minWidth={300}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} ${currency}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {categoryBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor(item.name) }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value.toFixed(2)} {currency}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
