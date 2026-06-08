import { PrismaClient, MealType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type SeedMeal = {
  name: string;
  score: number;
  category: string;
  image: string;
  types: MealType[];
  ingredients: Array<{ name: string; amount: string; unit: string }>;
  steps: string[];
  tags: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  nutritionalValue: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
};

const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1612974443475-c41cd8196b52?w=1200&q=80',
  'https://images.unsplash.com/photo-1622922229376-b25fec9357aa?w=1200&q=80',
  'https://images.unsplash.com/photo-1644704001249-0d9dbb842238?w=1200&q=80',
  'https://images.unsplash.com/photo-1717261592764-d09e0c1ba6c4?w=1200&q=80',
  'https://images.unsplash.com/photo-1762631934518-f75e233413ca?w=1200&q=80',
  'https://images.unsplash.com/photo-1541288097308-7b8e3f58c4c6?w=1200&q=80',
  'https://images.unsplash.com/photo-1766232563961-323612b37a6d?w=1200&q=80',
  'https://images.unsplash.com/photo-1625940947631-908aa92ef5e7?w=1200&q=80',
  'https://images.unsplash.com/photo-1561517146-dfbd99b0c14d?w=1200&q=80',
  'https://images.unsplash.com/photo-1641536885341-301aeb52f1c0?w=1200&q=80',
  'https://images.unsplash.com/photo-1611793413292-cf250cc04aa1?w=1200&q=80',
  'https://images.unsplash.com/photo-1652282557988-f19b23769c39?w=1200&q=80',
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80',
  'https://images.unsplash.com/photo-1606851091851-e8c8c0fca5ba?w=1200&q=80',
  'https://images.unsplash.com/photo-1775199603318-7f8a9a63b40d?w=1200&q=80',
];

const img = (index: number) => IMAGE_POOL[index - 1] ?? IMAGE_POOL[0];

const meals: SeedMeal[] = [
  {
    name: 'Pasta con pesto y garbanzos',
    score: 5,
    category: 'Italian',
    image: img(1),
    types: [MealType.LUNCH, MealType.DINNER],
    ingredients: [
      { name: 'Pasta', amount: '280', unit: 'g' },
      { name: 'Pesto', amount: '120', unit: 'g' },
      { name: 'Cooked chickpeas', amount: '250', unit: 'g' },
    ],
    steps: ['Boil pasta.', 'Warm chickpeas in a pan.', 'Mix pasta with pesto and chickpeas.'],
    tags: ['vegetarian', 'student-friendly', 'for-her', 'shared'],
    prepTime: 8,
    cookTime: 15,
    servings: 3,
    nutritionalValue: { calories: 620, protein: 22, carbs: 80, fat: 22, fiber: 10, sugar: 4, sodium: 520 },
  },
  {
    name: 'Arroz a la cubana',
    score: 5,
    category: 'Spanish',
    image: img(2),
    types: [MealType.LUNCH, MealType.DINNER],
    ingredients: [
      { name: 'Rice', amount: '220', unit: 'g' },
      { name: 'Eggs', amount: '2', unit: 'units' },
      { name: 'Tomato sauce', amount: '180', unit: 'g' },
      { name: 'Banana', amount: '1', unit: 'unit' },
    ],
    steps: ['Cook rice.', 'Fry eggs and sliced banana.', 'Serve with warm tomato sauce.'],
    tags: ['vegetarian', 'comfort-food', 'for-her', 'shared'],
    prepTime: 6,
    cookTime: 18,
    servings: 2,
    nutritionalValue: { calories: 640, protein: 18, carbs: 88, fat: 24, fiber: 4, sugar: 12, sodium: 620 },
  },
  {
    name: 'Pierogi ruskie',
    score: 5,
    category: 'Polish',
    image: img(3),
    types: [MealType.LUNCH, MealType.DINNER],
    ingredients: [
      { name: 'Pierogi dough', amount: '500', unit: 'g' },
      { name: 'Potato', amount: '400', unit: 'g' },
      { name: 'Cottage cheese', amount: '250', unit: 'g' },
      { name: 'Onion', amount: '1', unit: 'unit' },
    ],
    steps: ['Prepare potato-cheese filling.', 'Fill and shape pierogi.', 'Boil and pan-fry lightly with onion.'],
    tags: ['vegetarian', 'polish-classic', 'for-her', 'shared'],
    prepTime: 35,
    cookTime: 20,
    servings: 4,
    nutritionalValue: { calories: 540, protein: 19, carbs: 74, fat: 18, fiber: 5, sugar: 4, sodium: 560 },
  },
  {
    name: 'Zupa pomidorowa z ryzem',
    score: 4,
    category: 'Polish',
    image: img(4),
    types: [MealType.LUNCH, MealType.DINNER],
    ingredients: [
      { name: 'Tomato passata', amount: '500', unit: 'ml' },
      { name: 'Rice', amount: '120', unit: 'g' },
      { name: 'Vegetable broth', amount: '900', unit: 'ml' },
      { name: 'Cream', amount: '60', unit: 'ml' },
    ],
    steps: ['Cook rice separately.', 'Simmer passata with broth.', 'Add cream and serve with rice.'],
    tags: ['vegetarian', 'budget', 'for-her', 'shared'],
    prepTime: 8,
    cookTime: 25,
    servings: 4,
    nutritionalValue: { calories: 290, protein: 6, carbs: 42, fat: 11, fiber: 3, sugar: 8, sodium: 680 },
  },
  {
    name: 'Tortilla de patatas',
    score: 5,
    category: 'Spanish',
    image: img(5),
    types: [MealType.LUNCH, MealType.DINNER],
    ingredients: [
      { name: 'Potato', amount: '500', unit: 'g' },
      { name: 'Eggs', amount: '6', unit: 'units' },
      { name: 'Onion', amount: '1', unit: 'unit' },
      { name: 'Olive oil', amount: '80', unit: 'ml' },
    ],
    steps: ['Cook potato and onion slowly in oil.', 'Mix with beaten eggs.', 'Cook both sides until set.'],
    tags: ['vegetarian', 'meal-prep', 'for-her', 'shared'],
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    nutritionalValue: { calories: 380, protein: 14, carbs: 30, fat: 24, fiber: 3, sugar: 3, sodium: 420 },
  },
  {
    name: 'Lentejas estofadas vegetarianas',
    score: 5,
    category: 'Spanish',
    image: img(6),
    types: [MealType.LUNCH, MealType.DINNER],
    ingredients: [
      { name: 'Cooked lentils', amount: '600', unit: 'g' },
      { name: 'Carrot', amount: '2', unit: 'units' },
      { name: 'Onion', amount: '1', unit: 'unit' },
      { name: 'Paprika', amount: '1', unit: 'tsp' },
    ],
    steps: ['Saute vegetables.', 'Add lentils and water.', 'Simmer 20 minutes with paprika.'],
    tags: ['vegetarian', 'high-fiber', 'for-her', 'shared'],
    prepTime: 10,
    cookTime: 22,
    servings: 4,
    nutritionalValue: { calories: 340, protein: 18, carbs: 49, fat: 8, fiber: 14, sugar: 5, sodium: 390 },
  },
  {
    name: 'Kasza z pieczonymi warzywami i feta',
    score: 4,
    category: 'Polish',
    image: img(7),
    types: [MealType.LUNCH, MealType.DINNER],
    ingredients: [
      { name: 'Buckwheat', amount: '220', unit: 'g' },
      { name: 'Mixed vegetables', amount: '400', unit: 'g' },
      { name: 'Feta', amount: '120', unit: 'g' },
    ],
    steps: ['Roast vegetables.', 'Cook buckwheat.', 'Mix and top with feta.'],
    tags: ['vegetarian', 'for-her', 'shared'],
    prepTime: 10,
    cookTime: 25,
    servings: 3,
    nutritionalValue: { calories: 470, protein: 16, carbs: 56, fat: 20, fiber: 9, sugar: 7, sodium: 650 },
  },
  {
    name: 'Shakshuka',
    score: 4,
    category: 'Mediterranean',
    image: img(8),
    types: [MealType.BREAKFAST, MealType.DINNER],
    ingredients: [
      { name: 'Tomato sauce', amount: '300', unit: 'g' },
      { name: 'Eggs', amount: '3', unit: 'units' },
      { name: 'Pepper', amount: '1', unit: 'unit' },
      { name: 'Onion', amount: '1', unit: 'unit' },
    ],
    steps: ['Cook onion and pepper.', 'Add tomato sauce.', 'Crack eggs and cook until set.'],
    tags: ['vegetarian', 'quick', 'for-her', 'shared'],
    prepTime: 8,
    cookTime: 15,
    servings: 2,
    nutritionalValue: { calories: 320, protein: 17, carbs: 18, fat: 19, fiber: 4, sugar: 9, sodium: 540 },
  },
  {
    name: 'Owsianka z bananem i orzechami',
    score: 4,
    category: 'Polish',
    image: img(9),
    types: [MealType.BREAKFAST],
    ingredients: [
      { name: 'Oats', amount: '60', unit: 'g' },
      { name: 'Milk', amount: '220', unit: 'ml' },
      { name: 'Banana', amount: '1', unit: 'unit' },
      { name: 'Walnuts', amount: '20', unit: 'g' },
    ],
    steps: ['Cook oats with milk.', 'Top with sliced banana and walnuts.'],
    tags: ['vegetarian', 'breakfast', 'for-her', 'shared'],
    prepTime: 4,
    cookTime: 8,
    servings: 1,
    nutritionalValue: { calories: 460, protein: 14, carbs: 55, fat: 21, fiber: 8, sugar: 15, sodium: 110 },
  },
  {
    name: 'Pollo al horno con patatas',
    score: 5,
    category: 'Spanish',
    image: img(10),
    types: [MealType.LUNCH, MealType.DINNER],
    ingredients: [
      { name: 'Chicken thighs', amount: '700', unit: 'g' },
      { name: 'Potato', amount: '500', unit: 'g' },
      { name: 'Olive oil', amount: '2', unit: 'tbsp' },
      { name: 'Garlic', amount: '4', unit: 'cloves' },
    ],
    steps: ['Season chicken and potatoes.', 'Bake at 200C until golden and cooked through.'],
    tags: ['non-vegetarian', 'for-him', 'shared'],
    prepTime: 12,
    cookTime: 45,
    servings: 4,
    nutritionalValue: { calories: 620, protein: 42, carbs: 36, fat: 33, fiber: 4, sugar: 2, sodium: 580 },
  },
  {
    name: 'Kurczak z ryzem i mizeria',
    score: 4,
    category: 'Polish',
    image: img(11),
    types: [MealType.LUNCH, MealType.DINNER],
    ingredients: [
      { name: 'Chicken breast', amount: '300', unit: 'g' },
      { name: 'Rice', amount: '180', unit: 'g' },
      { name: 'Cucumber', amount: '1', unit: 'unit' },
      { name: 'Yogurt', amount: '100', unit: 'g' },
    ],
    steps: ['Grill chicken.', 'Cook rice.', 'Mix cucumber with yogurt for side salad.'],
    tags: ['non-vegetarian', 'meal-prep', 'for-him', 'shared'],
    prepTime: 10,
    cookTime: 18,
    servings: 2,
    nutritionalValue: { calories: 560, protein: 40, carbs: 62, fat: 14, fiber: 2, sugar: 4, sodium: 430 },
  },
  {
    name: 'Pasta con atun y tomate',
    score: 4,
    category: 'Spanish',
    image: img(12),
    types: [MealType.LUNCH, MealType.DINNER],
    ingredients: [
      { name: 'Pasta', amount: '300', unit: 'g' },
      { name: 'Canned tuna', amount: '2', unit: 'cans' },
      { name: 'Tomato sauce', amount: '250', unit: 'g' },
    ],
    steps: ['Boil pasta.', 'Heat tomato sauce.', 'Add tuna and combine.'],
    tags: ['non-vegetarian', 'quick', 'for-him', 'shared'],
    prepTime: 5,
    cookTime: 14,
    servings: 3,
    nutritionalValue: { calories: 520, protein: 30, carbs: 65, fat: 14, fiber: 4, sugar: 6, sodium: 640 },
  },
  {
    name: 'Gulasz z indyka',
    score: 4,
    category: 'Polish',
    image: img(13),
    types: [MealType.LUNCH, MealType.DINNER],
    ingredients: [
      { name: 'Turkey breast', amount: '400', unit: 'g' },
      { name: 'Onion', amount: '1', unit: 'unit' },
      { name: 'Carrot', amount: '1', unit: 'unit' },
      { name: 'Tomato passata', amount: '250', unit: 'ml' },
    ],
    steps: ['Brown turkey pieces.', 'Cook onion and carrot.', 'Add passata and simmer until tender.'],
    tags: ['non-vegetarian', 'for-him', 'shared'],
    prepTime: 12,
    cookTime: 35,
    servings: 3,
    nutritionalValue: { calories: 420, protein: 41, carbs: 17, fat: 20, fiber: 4, sugar: 8, sodium: 470 },
  },
  {
    name: 'Bigos',
    score: 4,
    category: 'Polish',
    image: img(14),
    types: [MealType.LUNCH, MealType.DINNER],
    ingredients: [
      { name: 'Sauerkraut', amount: '500', unit: 'g' },
      { name: 'Sausage', amount: '250', unit: 'g' },
      { name: 'Pork', amount: '250', unit: 'g' },
      { name: 'Tomato paste', amount: '2', unit: 'tbsp' },
    ],
    steps: ['Brown meats.', 'Add sauerkraut and tomato paste.', 'Simmer slowly for deep flavor.'],
    tags: ['non-vegetarian', 'batch-cook', 'for-him', 'shared'],
    prepTime: 15,
    cookTime: 90,
    servings: 5,
    nutritionalValue: { calories: 590, protein: 34, carbs: 18, fat: 42, fiber: 6, sugar: 7, sodium: 1200 },
  },
  {
    name: 'Kanapki z jajkiem i twarogiem',
    score: 4,
    category: 'Polish',
    image: img(15),
    types: [MealType.BREAKFAST, MealType.SNACK],
    ingredients: [
      { name: 'Whole grain bread', amount: '4', unit: 'slices' },
      { name: 'Eggs', amount: '2', unit: 'units' },
      { name: 'Cottage cheese', amount: '120', unit: 'g' },
      { name: 'Chives', amount: '10', unit: 'g' },
    ],
    steps: ['Boil eggs.', 'Spread cottage cheese on bread.', 'Top with egg slices and chives.'],
    tags: ['vegetarian', 'breakfast', 'for-her', 'shared'],
    prepTime: 8,
    cookTime: 10,
    servings: 2,
    nutritionalValue: { calories: 390, protein: 24, carbs: 35, fat: 17, fiber: 6, sugar: 4, sodium: 540 },
  },
  {
    name: 'Zapiekanka z pieczarkami i serem',
    score: 4,
    category: 'Polish',
    image: img(16),
    types: [MealType.LUNCH, MealType.DINNER],
    ingredients: [
      { name: 'Baguette bread', amount: '1', unit: 'unit' },
      { name: 'Mushroom', amount: '250', unit: 'g' },
      { name: 'Cheese', amount: '140', unit: 'g' },
      { name: 'Ketchup', amount: '40', unit: 'g' },
    ],
    steps: ['Saute mushrooms.', 'Top baguette with mushrooms and cheese.', 'Bake and finish with ketchup.'],
    tags: ['vegetarian', 'student-friendly', 'for-her', 'shared'],
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    nutritionalValue: { calories: 610, protein: 24, carbs: 60, fat: 31, fiber: 5, sugar: 8, sodium: 910 },
  },
];

async function upsertMeal(userId: string, meal: SeedMeal) {
  const existing = await prisma.meal.findFirst({ where: { userId, name: meal.name } });
  if (existing) {
    await prisma.meal.update({
      where: { id: existing.id },
      data: {
        image: meal.image,
      },
    });
    return;
  }

  const category = await prisma.mealCategory.upsert({
    where: { name: meal.category },
    create: { name: meal.category },
    update: {},
  });

  const created = await prisma.meal.create({
    data: {
      userId,
      name: meal.name,
      score: meal.score,
      categoryId: category.id,
      image: meal.image,
      prepTime: meal.prepTime,
      cookTime: meal.cookTime,
      servings: meal.servings,
      aiCategorized: false,
      aiNutrition: false,
    },
  });

  await prisma.nutrition.create({ data: { mealId: created.id, ...meal.nutritionalValue } });

  for (const type of meal.types) {
    await prisma.mealTypeOnMeal.create({ data: { mealId: created.id, type } });
  }

  for (const [index, step] of meal.steps.entries()) {
    await prisma.mealStep.create({ data: { mealId: created.id, orderNo: index + 1, text: step } });
  }

  for (const ing of meal.ingredients) {
    const ingredient = await prisma.ingredient.upsert({
      where: { name: ing.name },
      create: { name: ing.name },
      update: {},
    });

    await prisma.mealIngredient.create({
      data: {
        mealId: created.id,
        ingredientId: ingredient.id,
        amount: ing.amount,
        unit: ing.unit,
      },
    });
  }

  for (const tagName of meal.tags) {
    const tag = await prisma.mealTag.upsert({
      where: { name: tagName },
      create: { name: tagName },
      update: {},
    });

    await prisma.mealTagOnMeal.create({ data: { mealId: created.id, tagId: tag.id } });
  }
}

async function ensureSingleUser() {
  const email = process.env.SINGLE_USER_EMAIL ?? 'borja@lifemanagement.local';
  const password = process.env.SINGLE_USER_PASSWORD ?? '22Comida79';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });
}

async function main() {
  const user = await ensureSingleUser();

  for (const meal of meals) {
    await upsertMeal(user.id, meal);
  }

  console.log(`Seeded ${meals.length} couple-friendly meals for ${user.email}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
