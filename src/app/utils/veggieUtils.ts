import type { Meal } from '../types';

export const MEAT_KEYWORDS = [
  'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'veal', 'bacon', 'ham',
  'sausage', 'mince', 'anchovy', 'salmon', 'tuna', 'shrimp', 'prawn', 'fish fillet',
  'seafood', 'crab', 'lobster', 'squid', 'octopus', 'clam', 'mussel', 'oyster',
  'meat', 'lard', 'gelatin',
];

export const NON_VEGAN_KEYWORDS = [
  'egg', 'milk', 'butter', 'cheese', 'parmesan', 'mozzarella', 'cheddar',
  'yogurt', 'cream', 'whey', 'honey', 'ghee', 'ricotta', 'feta',
];

export function getMealVeggieType(meal: Meal): 'vegan' | 'vegetarian' | 'none' {
  const allIngredients = meal.ingredients.map(i => i.name.toLowerCase()).join(' ');
  const hasMeat = MEAT_KEYWORDS.some(k => allIngredients.includes(k));
  if (hasMeat) return 'none';
  const hasNonVegan = NON_VEGAN_KEYWORDS.some(k => allIngredients.includes(k));
  return hasNonVegan ? 'vegetarian' : 'vegan';
}

export function isVeggieMeal(meal: Meal): boolean {
  return getMealVeggieType(meal) !== 'none';
}
