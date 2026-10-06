import { useApp } from '../../context/AppContext';
import { Link } from 'react-router';
import { ChefHat, CalendarDays, ShoppingCart, Star, Clock, Flame, TrendingUp, CheckCircle2, Check, AlertCircle } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';

const TYPE_COLORS: Record<string, string> = {
  Breakfast: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Lunch: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Dinner: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Snack: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

export function HomePage() {
  const { meals, weekPlans, groceryLists, todayNutrition, logMealEaten, calendarEvents, scheduleOccurrences } = useApp();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const currentWeekStart = '2026-04-27';
  const currentPlan = weekPlans.find(p => p.startDate === currentWeekStart);
  const todayPlan = currentPlan?.days.find(d => d.date === todayStr);
  const currentGrocery = groceryLists.find(l => l.weekStartDate === currentWeekStart);
  const uncheckedItems = currentGrocery?.items.filter(i => !i.checked).length || 0;
  const urgentItems = currentGrocery?.items.filter(i => !i.checked && i.urgency === 'today').length || 0;

  const getMeal = (id?: string) => meals.find(m => m.id === id);
  const recentMeals = [...meals].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  const eatenMealIds = new Set(todayNutrition?.entries.filter(e => e.mealId).map(e => e.mealId));

  const todayEvents = calendarEvents.filter(e => e.startDate === todayStr).sort((a, b) => {
    const aTime = a.startTime || '00:00';
    const bTime = b.startTime || '00:00';
    return aTime.localeCompare(bTime);
  });

  const todaySchedules = scheduleOccurrences.filter(s => s.date === todayStr && !s.completed);

  const stats = [
    { label: 'Total Meals', value: meals.length, icon: ChefHat, color: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-100 dark:bg-amber-900/40' },
    { label: 'Weekly Plan', value: `${currentPlan?.days.filter(d => d.breakfast || d.lunch || d.dinner).length || 0}/7 days`, icon: CalendarDays, color: 'text-green-600 dark:text-green-400', iconBg: 'bg-green-100 dark:bg-green-900/40' },
    { label: 'To Buy', value: uncheckedItems, icon: ShoppingCart, color: urgentItems > 0 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400', iconBg: urgentItems > 0 ? 'bg-red-100 dark:bg-red-900/40' : 'bg-blue-100 dark:bg-blue-900/40' },
    { label: 'Avg Score', value: (meals.reduce((s, m) => s + m.score, 0) / meals.length).toFixed(1), icon: Star, color: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-100 dark:bg-purple-900/40' },
  ];

  const todayMeals = [
    { label: 'Breakfast', slot: 'breakfast' as const, emoji: '🌅' },
    { label: 'Lunch', slot: 'lunch' as const, emoji: '☀️' },
    { label: 'Snack', slot: 'snack' as const, emoji: '🍎' },
    { label: 'Dinner', slot: 'dinner' as const, emoji: '🌙' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-gray-900 dark:text-white mb-1" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}! 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '0.95rem' }}>Here's your overview for today</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow-sm border border-amber-100 dark:border-gray-700">
            <Flame className="w-4 h-4 text-orange-500" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }} className="text-gray-700 dark:text-gray-200">7-day streak</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-amber-50 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-gray-900 dark:text-white mb-0.5" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</p>
            <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '0.78rem' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Today's Schedule - if there are events/tasks */}
      {(todayEvents.length > 0 || todaySchedules.length > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-amber-50 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-gray-900 dark:text-white" style={{ fontWeight: 600 }}>Today's Schedule</h3>
            </div>
            <Link to="/calendar" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1" style={{ fontSize: '0.8rem' }}>
              View Calendar →
            </Link>
          </div>
          <div className="space-y-2">
            {todayEvents.map(event => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <span style={{ fontSize: '0.75rem' }} className="font-semibold text-gray-600 dark:text-gray-300">
                    {event.startTime ? event.startTime.split(':')[0] : '—'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{event.title}</p>
                  {event.location && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{event.location}</p>}
                </div>
              </div>
            ))}
            {todaySchedules.map(schedule => (
              <div key={schedule.id} className="flex items-start gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50">
                <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-gray-100 font-medium">Recurring Task</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Due today</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Plan and Nutrition */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Meals */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-amber-50 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 dark:text-white" style={{ fontWeight: 600 }}>Today's Meals</h3>
              <Link to="/planner" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1" style={{ fontSize: '0.8rem' }}>
                View Planner →
              </Link>
            </div>
            <div className="space-y-3">
              {todayMeals.map(({ label, slot, emoji }) => {
                const meal = getMeal(todayPlan?.[slot]);
                const isEaten = meal && eatenMealIds.has(meal.id);
                return (
                  <div key={slot} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isEaten ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-amber-50/50 dark:hover:bg-gray-700'}`}>
                    <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '0.75rem' }} className="text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
                      {meal ? (
                        <p className="text-gray-800 dark:text-gray-200 truncate" style={{ fontSize: '0.9rem', fontWeight: 500 }}>{meal.name}</p>
                      ) : (
                        <p className="text-gray-300 dark:text-gray-600" style={{ fontSize: '0.85rem' }}>Not planned</p>
                      )}
                    </div>
                    {meal && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-gray-400 dark:text-gray-500" style={{ fontSize: '0.75rem' }}>{meal.nutritionalValue.calories} kcal</span>
                        <button
                          onClick={() => logMealEaten(meal.id, label as any)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isEaten
                              ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500 hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/40 dark:hover:text-amber-400'
                          }`}
                          title={isEaten ? 'Marked as eaten' : 'Mark as eaten'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        {meal.image && (
                          <img src={meal.image} alt={meal.name} className="w-10 h-10 rounded-lg object-cover" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {!todayPlan?.breakfast && !todayPlan?.lunch && !todayPlan?.dinner && (
              <Link to="/planner" className="mt-3 flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" style={{ fontSize: '0.85rem' }}>
                <CalendarDays className="w-4 h-4" />
                Plan today's meals
              </Link>
            )}
          </div>

          {/* Today's Nutrition */}
          {todayNutrition && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-amber-50 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 dark:text-white" style={{ fontWeight: 600 }}>Nutrition Summary</h3>
                <Link to="/nutrition" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1" style={{ fontSize: '0.8rem' }}>
                  Details →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-2 flex justify-between items-center">
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }} className="text-gray-600 dark:text-gray-300">Calories</span>
                    <span style={{ fontSize: '0.8rem' }} className="text-gray-400">{todayNutrition.totals.calories}/{todayNutrition.targets.calories || '—'}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        todayNutrition.totals.calories > (todayNutrition.targets.calories || 0)
                          ? 'bg-red-400'
                          : 'bg-amber-400'
                      }`}
                      style={{
                        width: `${Math.min(
                          (todayNutrition.totals.calories / (todayNutrition.targets.calories || 1)) * 100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between items-center">
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }} className="text-gray-600 dark:text-gray-300">Protein</span>
                    <span style={{ fontSize: '0.8rem' }} className="text-gray-400">{todayNutrition.totals.protein}g/{todayNutrition.targets.protein || '—'}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        todayNutrition.totals.protein > (todayNutrition.targets.protein || 0)
                          ? 'bg-green-400'
                          : 'bg-green-300'
                      }`}
                      style={{
                        width: `${Math.min(
                          (todayNutrition.totals.protein / (todayNutrition.targets.protein || 1)) * 100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grocery Urgency */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-amber-50 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 dark:text-white" style={{ fontWeight: 600 }}>Shopping List</h3>
            <Link to="/groceries" className="text-amber-600 dark:text-amber-400 hover:text-amber-700" style={{ fontSize: '0.8rem' }}>View all →</Link>
          </div>
          {currentGrocery ? (
            <div className="space-y-2">
              {currentGrocery.items.filter(i => !i.checked).slice(0, 6).map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.urgency === 'today' ? 'bg-red-400' : item.urgency === 'this-week' ? 'bg-amber-400' : 'bg-green-400'}`} />
                  <span className="text-gray-700 dark:text-gray-300 flex-1 truncate" style={{ fontSize: '0.85rem' }}>{item.name}</span>
                  <span className="text-gray-400 dark:text-gray-500" style={{ fontSize: '0.75rem' }}>{item.quantity} {item.unit}</span>
                </div>
              ))}
              {uncheckedItems > 6 && (
                <p className="text-gray-400 dark:text-gray-500 text-center pt-1" style={{ fontSize: '0.78rem' }}>+{uncheckedItems - 6} more items</p>
              )}
              <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span style={{ fontSize: '0.8rem' }} className="text-gray-500 dark:text-gray-400">{currentGrocery.items.filter(i => i.checked).length} done</span>
                </div>
                {urgentItems > 0 && (
                  <span className="bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {urgentItems} urgent!
                  </span>
                )}
              </div>
            </div>
          ) : (
            <Link to="/groceries" className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-center">
              <ShoppingCart className="w-8 h-8 mb-2 opacity-50" />
              <span style={{ fontSize: '0.85rem' }}>Generate grocery list</span>
            </Link>
          )}
        </div>

        {/* Recent Meals */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-amber-50 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 dark:text-white" style={{ fontWeight: 600 }}>Recently Added Meals</h3>
            <Link to="/meals" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1" style={{ fontSize: '0.8rem' }}>
              View all {meals.length} meals →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentMeals.map(meal => (
              <Link key={meal.id} to="/meals" className="group block">
                <div className="aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-amber-50 dark:bg-gray-700">
                  {meal.image ? (
                    <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="w-8 h-8 text-amber-200 dark:text-amber-700" />
                    </div>
                  )}
                </div>
                <p className="text-gray-800 dark:text-gray-200 truncate" style={{ fontSize: '0.85rem', fontWeight: 500 }}>{meal.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-2.5 h-2.5 ${s <= meal.score ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-600 fill-gray-200 dark:fill-gray-600'}`} />
                    ))}
                  </div>
                  <span className="text-gray-400 dark:text-gray-500" style={{ fontSize: '0.7rem' }}>{meal.nutritionalValue.calories} kcal</span>
                </div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {meal.types.slice(0, 2).map(t => (
                    <span key={t} className={`px-1.5 py-0.5 rounded-full ${TYPE_COLORS[t]}`} style={{ fontSize: '0.65rem' }}>{t}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
