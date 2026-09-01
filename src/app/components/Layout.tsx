import { NavLink, Outlet, useLocation } from 'react-router';
import { Home, ChefHat, CalendarDays, ShoppingCart, CreditCard, Dumbbell, Sparkles, Menu, X, Leaf, Moon, Sun, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home, end: true },
  { path: '/meals', label: 'Meals', icon: ChefHat },
  { path: '/planner', label: 'Meal Planner', icon: CalendarDays },
  { path: '/groceries', label: 'Groceries', icon: ShoppingCart },
  { path: '/veggies', label: 'Veggie Recipes', icon: Leaf },
  { path: '/expenses', label: 'Expenses', icon: CreditCard },
  { path: '/exercise', label: 'Exercise', icon: Dumbbell },
  { path: '/letters', label: 'Letters', icon: Sparkles },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggle } = useTheme();
  const { currentUserName, logout } = useApp();

  const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/meals': 'My Meals',
    '/planner': 'Meal Planner',
    '/groceries': 'Grocery List',
    '/veggies': 'Veggie Recipes',
    '/expenses': 'Expenses',
    '/exercise': 'Training',
    '/letters': 'Letters',
  };
  const currentTitle = pageTitles[location.pathname] || 'LifeHub';

  return (
    <div className="flex h-screen bg-amber-50/40 dark:bg-gray-950 overflow-hidden transition-colors duration-200">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-amber-100 dark:border-gray-800
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-amber-100 dark:border-gray-800">
          <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-white" style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.2 }}>LifeHub</h1>
            <p style={{ fontSize: '0.7rem' }} className="text-amber-500 dark:text-amber-400">Your Life Manager</p>
          </div>
          <button className="ml-auto lg:hidden text-gray-400 dark:text-gray-500" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }} className="text-gray-400 dark:text-gray-600 uppercase px-3 mb-2">Menu</p>
          {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
                  ${isActive
                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 shadow-sm border border-amber-100 dark:border-amber-800/50'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-amber-500 dark:text-amber-400' : ''}`} />
                    <span style={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </>
                )}
              </NavLink>
            ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-amber-100 dark:border-gray-800 space-y-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 flex items-center justify-center transition-colors">
              {isDark
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-gray-500" />
              }
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }} className="text-gray-700 dark:text-gray-300">
              {isDark ? 'Modo claro' : 'Modo nocturno'}
            </span>
            {/* Toggle pill */}
            <div className={`ml-auto w-9 h-5 rounded-full flex items-center transition-colors px-0.5 ${isDark ? 'bg-amber-400' : 'bg-gray-200 dark:bg-gray-600'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isDark ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* User info */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-amber-50 dark:bg-gray-800">
            <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-900 flex items-center justify-center text-amber-700 dark:text-amber-300" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              {(currentUserName?.slice(0, 1) || 'U').toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600 }} className="text-gray-800 dark:text-gray-200">{currentUserName || 'User'}</p>
              <p style={{ fontSize: '0.7rem' }} className="text-gray-400 dark:text-gray-500">Health & Wellness</p>
            </div>
            <button
              onClick={logout}
              className="ml-auto p-2 rounded-lg text-gray-500 hover:bg-white/70 dark:hover:bg-gray-700"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-amber-100 dark:border-gray-800 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-gray-900 dark:text-white" style={{ fontSize: '1.125rem', fontWeight: 600 }}>{currentTitle}</h2>
            <p style={{ fontSize: '0.75rem' }} className="text-gray-400 dark:text-gray-500">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
