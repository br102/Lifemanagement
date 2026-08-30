import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './components/home/HomePage';
import { MealsPage } from './components/meals/MealsPage';
import { MealPlannerPage } from './components/planner/MealPlannerPage';
import { GroceriesPage } from './components/groceries/GroceriesPage';
import { VeggiesPage } from './components/veggies/VeggiesPage';
import { TrainingPage } from './components/training/TrainingPage';
import { ExpensesPage } from './components/expenses/ExpensesPage';

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
      { path: 'expenses', Component: ExpensesPage },
      { path: 'exercise', Component: TrainingPage },
    ],
  },
]);
