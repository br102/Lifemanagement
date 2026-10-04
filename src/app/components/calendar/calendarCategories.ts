import { Building, Dumbbell, UtensilsCrossed, CheckSquare, Calendar } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CalendarCategoryConfig {
  key: 'office' | 'training' | 'meals' | 'chores' | 'events';
  label: string;
  color: string;
  icon: LucideIcon;
}

export const CALENDAR_CATEGORIES: CalendarCategoryConfig[] = [
  {
    key: 'office',
    label: 'Office',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    icon: Building,
  },
  {
    key: 'training',
    label: 'Training',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    icon: Dumbbell,
  },
  {
    key: 'meals',
    label: 'Meals',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    icon: UtensilsCrossed,
  },
  {
    key: 'chores',
    label: 'Chores',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    icon: CheckSquare,
  },
  {
    key: 'events',
    label: 'Events',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    icon: Calendar,
  },
];

export function getCategoryConfig(key: string): CalendarCategoryConfig | undefined {
  return CALENDAR_CATEGORIES.find((cat) => cat.key === key);
}
