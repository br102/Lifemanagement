import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './components/home/HomePage';
import { MealsPage } from './components/meals/MealsPage';
import { MealPlannerPage } from './components/planner/MealPlannerPage';
import { GroceriesPage } from './components/groceries/GroceriesPage';
import { VeggiesPage } from './components/veggies/VeggiesPage';

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
        <span style={{ fontSize: '2rem' }}>🚧</span>
      </div>
      <h2 className="text-gray-700 mb-2" style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h2>
      <p className="text-gray-400 text-sm">This section is coming soon!</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'meals', Component: MealsPage },
      { path: 'planner', Component: MealPlannerPage },
      { path: 'groceries', Component: GroceriesPage },
      { path: 'veggies', Component: VeggiesPage },
      { path: 'expenses', element: <ComingSoon title="Expenses" /> },
      { path: 'exercise', element: <ComingSoon title="Exercise" /> },
    ],
  },
]);