import { PrismaClient, MealType } from '@prisma/client';

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

const img = (seed: number) => `https://picsum.photos/seed/spanish-student-${seed}/1200/800`;

const meals: SeedMeal[] = [
  { name: 'Tortilla de Patatas', score: 5, category: 'Spanish', image: img(1), types: [MealType.DINNER, MealType.LUNCH], ingredients: [{ name: 'Potato', amount: '500', unit: 'g' }, { name: 'Eggs', amount: '6', unit: 'units' }, { name: 'Onion', amount: '1', unit: 'unit' }, { name: 'Olive oil', amount: '80', unit: 'ml' }], steps: ['Slice potatoes and onion.', 'Cook in olive oil slowly.', 'Mix with beaten eggs.', 'Cook both sides until set.'], tags: ['student', 'classic'], prepTime: 15, cookTime: 25, servings: 4, nutritionalValue: { calories: 380, protein: 14, carbs: 30, fat: 24, fiber: 3, sugar: 3, sodium: 420 } },
  { name: 'Pasta con Atun y Tomate', score: 5, category: 'Spanish', image: img(2), types: [MealType.LUNCH, MealType.DINNER], ingredients: [{ name: 'Pasta', amount: '300', unit: 'g' }, { name: 'Canned tuna', amount: '2', unit: 'cans' }, { name: 'Tomato sauce', amount: '250', unit: 'g' }], steps: ['Boil pasta.', 'Heat tomato sauce.', 'Add tuna and mix pasta.'], tags: ['quick', 'budget'], prepTime: 5, cookTime: 15, servings: 3, nutritionalValue: { calories: 520, protein: 30, carbs: 65, fat: 14, fiber: 4, sugar: 6, sodium: 640 } },
  { name: 'Lentejas Guisadas Rapidas', score: 4, category: 'Spanish', image: img(3), types: [MealType.LUNCH, MealType.DINNER], ingredients: [{ name: 'Cooked lentils', amount: '500', unit: 'g' }, { name: 'Carrot', amount: '1', unit: 'unit' }, { name: 'Onion', amount: '1', unit: 'unit' }], steps: ['Saute veggies.', 'Add lentils and water.', 'Simmer 20 minutes.'], tags: ['batch-cook'], prepTime: 10, cookTime: 25, servings: 4, nutritionalValue: { calories: 340, protein: 18, carbs: 48, fat: 8, fiber: 13, sugar: 5, sodium: 380 } },
  { name: 'Bocadillo de Pollo y Queso', score: 4, category: 'Spanish', image: img(4), types: [MealType.LUNCH], ingredients: [{ name: 'Baguette bread', amount: '1', unit: 'unit' }, { name: 'Chicken breast', amount: '150', unit: 'g' }, { name: 'Cheese', amount: '40', unit: 'g' }], steps: ['Grill chicken.', 'Fill bread with chicken and cheese.', 'Toast lightly.'], tags: ['portable'], prepTime: 8, cookTime: 10, servings: 1, nutritionalValue: { calories: 560, protein: 36, carbs: 52, fat: 22, fiber: 3, sugar: 4, sodium: 710 } },
  { name: 'Arroz a la Cubana', score: 5, category: 'Spanish', image: img(5), types: [MealType.LUNCH, MealType.DINNER], ingredients: [{ name: 'Rice', amount: '200', unit: 'g' }, { name: 'Eggs', amount: '2', unit: 'units' }, { name: 'Tomato sauce', amount: '150', unit: 'g' }, { name: 'Banana', amount: '1', unit: 'unit' }], steps: ['Cook rice.', 'Fry eggs and banana.', 'Serve with tomato sauce.'], tags: ['comfort'], prepTime: 5, cookTime: 20, servings: 2, nutritionalValue: { calories: 610, protein: 18, carbs: 82, fat: 22, fiber: 4, sugar: 12, sodium: 590 } },
  { name: 'Ensalada de Garbanzos', score: 4, category: 'Mediterranean', image: img(6), types: [MealType.LUNCH, MealType.DINNER], ingredients: [{ name: 'Cooked chickpeas', amount: '400', unit: 'g' }, { name: 'Tomato', amount: '2', unit: 'units' }, { name: 'Cucumber', amount: '1', unit: 'unit' }], steps: ['Chop veggies.', 'Mix with chickpeas.', 'Dress and chill.'], tags: ['no-cook'], prepTime: 12, cookTime: 0, servings: 3, nutritionalValue: { calories: 390, protein: 16, carbs: 42, fat: 16, fiber: 11, sugar: 6, sodium: 360 } },
  { name: 'Tostadas con Tomate y Jamon', score: 4, category: 'Spanish', image: img(7), types: [MealType.BREAKFAST, MealType.SNACK], ingredients: [{ name: 'Bread', amount: '2', unit: 'slices' }, { name: 'Tomato', amount: '1', unit: 'unit' }, { name: 'Serrano ham', amount: '40', unit: 'g' }], steps: ['Toast bread.', 'Spread grated tomato.', 'Top with ham and oil.'], tags: ['breakfast'], prepTime: 5, cookTime: 3, servings: 1, nutritionalValue: { calories: 320, protein: 14, carbs: 27, fat: 17, fiber: 2, sugar: 3, sodium: 760 } },
  { name: 'Yogur con Avena y Platano', score: 4, category: 'Healthy', image: img(8), types: [MealType.BREAKFAST, MealType.SNACK], ingredients: [{ name: 'Greek yogurt', amount: '200', unit: 'g' }, { name: 'Oats', amount: '40', unit: 'g' }, { name: 'Banana', amount: '1', unit: 'unit' }], steps: ['Add yogurt.', 'Top with oats and banana.', 'Drizzle honey.'], tags: ['fast'], prepTime: 4, cookTime: 0, servings: 1, nutritionalValue: { calories: 340, protein: 18, carbs: 48, fat: 8, fiber: 5, sugar: 20, sodium: 90 } },
  { name: 'Pechuga a la Plancha con Arroz', score: 4, category: 'Spanish', image: img(9), types: [MealType.LUNCH, MealType.DINNER], ingredients: [{ name: 'Chicken breast', amount: '180', unit: 'g' }, { name: 'Rice', amount: '120', unit: 'g' }], steps: ['Cook rice.', 'Grill chicken with salt and pepper.', 'Serve together.'], tags: ['gym'], prepTime: 5, cookTime: 18, servings: 1, nutritionalValue: { calories: 520, protein: 42, carbs: 52, fat: 12, fiber: 1, sugar: 1, sodium: 410 } },
  { name: 'Macarrones con Chorizo', score: 5, category: 'Spanish', image: img(10), types: [MealType.LUNCH, MealType.DINNER], ingredients: [{ name: 'Pasta', amount: '300', unit: 'g' }, { name: 'Chorizo', amount: '120', unit: 'g' }, { name: 'Tomato sauce', amount: '220', unit: 'g' }], steps: ['Cook pasta.', 'Saute chorizo.', 'Add tomato sauce and pasta.'], tags: ['comfort'], prepTime: 8, cookTime: 18, servings: 3, nutritionalValue: { calories: 690, protein: 24, carbs: 72, fat: 34, fiber: 4, sugar: 7, sodium: 980 } },
  { name: 'Salmorejo Cordobes', score: 4, category: 'Spanish', image: img(11), types: [MealType.LUNCH], ingredients: [{ name: 'Tomato', amount: '700', unit: 'g' }, { name: 'Bread', amount: '120', unit: 'g' }, { name: 'Olive oil', amount: '70', unit: 'ml' }], steps: ['Blend all ingredients.', 'Chill well.', 'Top with egg and ham if desired.'], tags: ['summer'], prepTime: 10, cookTime: 0, servings: 3, nutritionalValue: { calories: 360, protein: 8, carbs: 24, fat: 26, fiber: 3, sugar: 7, sodium: 520 } },
  { name: 'Gazpacho Andaluz', score: 4, category: 'Spanish', image: img(12), types: [MealType.LUNCH], ingredients: [{ name: 'Tomato', amount: '800', unit: 'g' }, { name: 'Cucumber', amount: '1', unit: 'unit' }, { name: 'Pepper', amount: '1', unit: 'unit' }], steps: ['Blend vegetables.', 'Add olive oil and vinegar.', 'Serve cold.'], tags: ['summer', 'healthy'], prepTime: 12, cookTime: 0, servings: 4, nutritionalValue: { calories: 170, protein: 4, carbs: 12, fat: 12, fiber: 3, sugar: 8, sodium: 300 } },
  { name: 'Huevos Rotos con Patatas', score: 5, category: 'Spanish', image: img(13), types: [MealType.DINNER], ingredients: [{ name: 'Potato', amount: '400', unit: 'g' }, { name: 'Eggs', amount: '3', unit: 'units' }, { name: 'Olive oil', amount: '60', unit: 'ml' }], steps: ['Fry potatoes.', 'Fry eggs.', 'Serve eggs over potatoes and break yolks.'], tags: ['classic'], prepTime: 10, cookTime: 20, servings: 2, nutritionalValue: { calories: 620, protein: 20, carbs: 44, fat: 38, fiber: 4, sugar: 2, sodium: 530 } },
  { name: 'Croquetas de Jamon', score: 4, category: 'Spanish', image: img(14), types: [MealType.DINNER, MealType.SNACK], ingredients: [{ name: 'Milk', amount: '500', unit: 'ml' }, { name: 'Flour', amount: '80', unit: 'g' }, { name: 'Serrano ham', amount: '120', unit: 'g' }], steps: ['Make thick bechamel with ham.', 'Chill and shape.', 'Bread and fry croquetas.'], tags: ['tapas'], prepTime: 30, cookTime: 20, servings: 4, nutritionalValue: { calories: 430, protein: 16, carbs: 28, fat: 28, fiber: 1, sugar: 5, sodium: 840 } },
  { name: 'Empanada de Atun Rapida', score: 4, category: 'Spanish', image: img(15), types: [MealType.LUNCH, MealType.DINNER], ingredients: [{ name: 'Puff pastry', amount: '2', unit: 'sheets' }, { name: 'Canned tuna', amount: '2', unit: 'cans' }, { name: 'Tomato sauce', amount: '150', unit: 'g' }], steps: ['Mix tuna and tomato sauce.', 'Fill pastry and close.', 'Bake until golden.'], tags: ['batch-cook'], prepTime: 12, cookTime: 25, servings: 4, nutritionalValue: { calories: 510, protein: 20, carbs: 36, fat: 30, fiber: 2, sugar: 4, sodium: 760 } },
  { name: 'Paella de Verduras Facil', score: 4, category: 'Spanish', image: img(16), types: [MealType.LUNCH, MealType.DINNER], ingredients: [{ name: 'Rice', amount: '300', unit: 'g' }, { name: 'Mixed vegetables', amount: '350', unit: 'g' }, { name: 'Vegetable broth', amount: '900', unit: 'ml' }], steps: ['Saute vegetables.', 'Add rice and broth.', 'Cook until rice is tender.'], tags: ['vegetarian'], prepTime: 10, cookTime: 30, servings: 4, nutritionalValue: { calories: 410, protein: 10, carbs: 72, fat: 9, fiber: 6, sugar: 6, sodium: 540 } },
  { name: 'Arroz Tres Delicias Casero', score: 4, category: 'Asian', image: img(17), types: [MealType.LUNCH, MealType.DINNER], ingredients: [{ name: 'Rice', amount: '250', unit: 'g' }, { name: 'Eggs', amount: '2', unit: 'units' }, { name: 'Peas', amount: '100', unit: 'g' }, { name: 'Ham', amount: '100', unit: 'g' }], steps: ['Cook rice and cool.', 'Scramble eggs.', 'Stir-fry all with soy sauce.'], tags: ['leftovers'], prepTime: 8, cookTime: 15, servings: 3, nutritionalValue: { calories: 470, protein: 19, carbs: 67, fat: 13, fiber: 3, sugar: 3, sodium: 720 } },
  { name: 'Sandwich Mixto con Tomate', score: 4, category: 'Spanish', image: img(18), types: [MealType.BREAKFAST, MealType.SNACK], ingredients: [{ name: 'Bread', amount: '2', unit: 'slices' }, { name: 'Cheese', amount: '40', unit: 'g' }, { name: 'Ham', amount: '40', unit: 'g' }], steps: ['Assemble sandwich.', 'Toast on pan both sides.', 'Serve with tomato slices.'], tags: ['quick'], prepTime: 3, cookTime: 6, servings: 1, nutritionalValue: { calories: 390, protein: 19, carbs: 31, fat: 20, fiber: 2, sugar: 3, sodium: 890 } },
  { name: 'Patatas Bravas Caseras', score: 4, category: 'Spanish', image: img(19), types: [MealType.SNACK, MealType.DINNER], ingredients: [{ name: 'Potato', amount: '500', unit: 'g' }, { name: 'Paprika', amount: '1', unit: 'tsp' }, { name: 'Tomato sauce', amount: '120', unit: 'g' }], steps: ['Bake or fry potato cubes.', 'Mix spicy sauce.', 'Serve potatoes with sauce.'], tags: ['tapas'], prepTime: 10, cookTime: 25, servings: 3, nutritionalValue: { calories: 330, protein: 5, carbs: 45, fat: 14, fiber: 4, sugar: 4, sodium: 560 } },
  { name: 'Ensaladilla Rusa Ligera', score: 4, category: 'Spanish', image: img(20), types: [MealType.LUNCH, MealType.DINNER], ingredients: [{ name: 'Potato', amount: '400', unit: 'g' }, { name: 'Carrot', amount: '2', unit: 'units' }, { name: 'Peas', amount: '120', unit: 'g' }, { name: 'Tuna', amount: '1', unit: 'can' }], steps: ['Boil veggies.', 'Mix with tuna.', 'Add mayo and chill.'], tags: ['meal-prep'], prepTime: 15, cookTime: 20, servings: 4, nutritionalValue: { calories: 360, protein: 15, carbs: 34, fat: 18, fiber: 5, sugar: 5, sodium: 610 } },
  { name: 'Pollo al Ajillo', score: 5, category: 'Spanish', image: img(21), types: [MealType.DINNER], ingredients: [{ name: 'Chicken thighs', amount: '500', unit: 'g' }, { name: 'Garlic', amount: '6', unit: 'cloves' }, { name: 'Olive oil', amount: '3', unit: 'tbsp' }], steps: ['Brown chicken.', 'Add garlic and cook gently.', 'Finish with parsley and serve.'], tags: ['classic'], prepTime: 10, cookTime: 25, servings: 3, nutritionalValue: { calories: 490, protein: 38, carbs: 4, fat: 35, fiber: 0, sugar: 0, sodium: 460 } },
  { name: 'Fabada Estudiantil Rapida', score: 4, category: 'Spanish', image: img(22), types: [MealType.LUNCH, MealType.DINNER], ingredients: [{ name: 'Cooked white beans', amount: '500', unit: 'g' }, { name: 'Chorizo', amount: '100', unit: 'g' }, { name: 'Paprika', amount: '1', unit: 'tsp' }], steps: ['Saute chorizo.', 'Add beans and spices.', 'Simmer 15 minutes.'], tags: ['winter'], prepTime: 8, cookTime: 20, servings: 3, nutritionalValue: { calories: 540, protein: 24, carbs: 42, fat: 30, fiber: 12, sugar: 2, sodium: 980 } },
  { name: 'Crema de Calabacin', score: 4, category: 'Healthy', image: img(23), types: [MealType.DINNER, MealType.LUNCH], ingredients: [{ name: 'Zucchini', amount: '600', unit: 'g' }, { name: 'Potato', amount: '200', unit: 'g' }, { name: 'Onion', amount: '1', unit: 'unit' }], steps: ['Cook vegetables until soft.', 'Blend until creamy.', 'Season and serve.'], tags: ['light'], prepTime: 10, cookTime: 25, servings: 4, nutritionalValue: { calories: 210, protein: 5, carbs: 30, fat: 7, fiber: 4, sugar: 6, sodium: 320 } },
  { name: 'Merluza al Horno con Patata', score: 4, category: 'Spanish', image: img(24), types: [MealType.DINNER], ingredients: [{ name: 'Hake fillet', amount: '350', unit: 'g' }, { name: 'Potato', amount: '300', unit: 'g' }, { name: 'Olive oil', amount: '2', unit: 'tbsp' }], steps: ['Slice potatoes and pre-bake.', 'Add fish on top.', 'Bake until fish is done.'], tags: ['fish'], prepTime: 10, cookTime: 30, servings: 2, nutritionalValue: { calories: 420, protein: 36, carbs: 28, fat: 18, fiber: 3, sugar: 2, sodium: 410 } },
  { name: 'Pisto con Huevo', score: 4, category: 'Spanish', image: img(25), types: [MealType.LUNCH, MealType.DINNER], ingredients: [{ name: 'Zucchini', amount: '1', unit: 'unit' }, { name: 'Pepper', amount: '1', unit: 'unit' }, { name: 'Tomato sauce', amount: '250', unit: 'g' }, { name: 'Eggs', amount: '2', unit: 'units' }], steps: ['Saute vegetables.', 'Add tomato sauce and simmer.', 'Top with fried eggs.'], tags: ['vegetarian'], prepTime: 12, cookTime: 22, servings: 2, nutritionalValue: { calories: 330, protein: 14, carbs: 20, fat: 20, fiber: 5, sugar: 10, sodium: 520 } },
  { name: 'Tosta de Aguacate y Huevo', score: 4, category: 'Healthy', image: img(26), types: [MealType.BREAKFAST, MealType.SNACK], ingredients: [{ name: 'Bread', amount: '2', unit: 'slices' }, { name: 'Avocado', amount: '1', unit: 'unit' }, { name: 'Eggs', amount: '1', unit: 'unit' }], steps: ['Toast bread.', 'Mash avocado on toast.', 'Top with poached egg.'], tags: ['trendy'], prepTime: 6, cookTime: 5, servings: 1, nutritionalValue: { calories: 410, protein: 14, carbs: 28, fat: 26, fiber: 8, sugar: 2, sodium: 330 } },
  { name: 'Avena Nocturna con Fruta', score: 4, category: 'Healthy', image: img(27), types: [MealType.BREAKFAST], ingredients: [{ name: 'Oats', amount: '50', unit: 'g' }, { name: 'Milk', amount: '180', unit: 'ml' }, { name: 'Apple', amount: '1', unit: 'unit' }], steps: ['Mix oats and milk.', 'Refrigerate overnight.', 'Add fruit before eating.'], tags: ['meal-prep'], prepTime: 4, cookTime: 0, servings: 1, nutritionalValue: { calories: 320, protein: 12, carbs: 48, fat: 9, fiber: 6, sugar: 14, sodium: 120 } },
  { name: 'Revuelto de Champinones', score: 4, category: 'Spanish', image: img(28), types: [MealType.BREAKFAST, MealType.DINNER], ingredients: [{ name: 'Eggs', amount: '3', unit: 'units' }, { name: 'Mushroom', amount: '200', unit: 'g' }, { name: 'Olive oil', amount: '1', unit: 'tbsp' }], steps: ['Cook mushrooms.', 'Add beaten eggs.', 'Stir until creamy.'], tags: ['protein'], prepTime: 5, cookTime: 8, servings: 1, nutritionalValue: { calories: 290, protein: 22, carbs: 6, fat: 20, fiber: 2, sugar: 2, sodium: 300 } },
  { name: 'Wrap de Atun y Lechuga', score: 4, category: 'Mediterranean', image: img(29), types: [MealType.LUNCH], ingredients: [{ name: 'Tortilla wrap', amount: '1', unit: 'unit' }, { name: 'Canned tuna', amount: '1', unit: 'can' }, { name: 'Lettuce', amount: '40', unit: 'g' }], steps: ['Mix tuna with yogurt or mayo.', 'Fill wrap with lettuce and tuna.', 'Roll and serve.'], tags: ['portable'], prepTime: 6, cookTime: 0, servings: 1, nutritionalValue: { calories: 360, protein: 26, carbs: 30, fat: 14, fiber: 3, sugar: 2, sodium: 540 } },
  { name: 'Burrito de Arroz y Frijoles', score: 4, category: 'Mexican', image: img(30), types: [MealType.LUNCH, MealType.DINNER], ingredients: [{ name: 'Tortilla wrap', amount: '2', unit: 'units' }, { name: 'Rice', amount: '140', unit: 'g' }, { name: 'Cooked beans', amount: '200', unit: 'g' }], steps: ['Cook rice.', 'Warm beans.', 'Fill tortillas and roll.'], tags: ['cheap'], prepTime: 8, cookTime: 15, servings: 2, nutritionalValue: { calories: 590, protein: 20, carbs: 96, fat: 14, fiber: 14, sugar: 4, sodium: 620 } },
  { name: 'Pollo al Curry con Arroz', score: 4, category: 'Asian', image: img(31), types: [MealType.DINNER, MealType.LUNCH], ingredients: [{ name: 'Chicken breast', amount: '250', unit: 'g' }, { name: 'Curry powder', amount: '1', unit: 'tbsp' }, { name: 'Rice', amount: '160', unit: 'g' }], steps: ['Cook chicken pieces.', 'Add curry and a splash of milk.', 'Serve with rice.'], tags: ['batch-cook'], prepTime: 10, cookTime: 20, servings: 2, nutritionalValue: { calories: 640, protein: 44, carbs: 62, fat: 22, fiber: 2, sugar: 3, sodium: 530 } },
  { name: 'Berenjena Rellena de Carne', score: 4, category: 'Spanish', image: img(32), types: [MealType.DINNER], ingredients: [{ name: 'Eggplant', amount: '2', unit: 'units' }, { name: 'Ground beef', amount: '250', unit: 'g' }, { name: 'Tomato sauce', amount: '160', unit: 'g' }], steps: ['Roast eggplant halves.', 'Cook beef with tomato.', 'Fill eggplants and bake.'], tags: ['oven'], prepTime: 15, cookTime: 30, servings: 2, nutritionalValue: { calories: 480, protein: 32, carbs: 20, fat: 30, fiber: 7, sugar: 9, sodium: 620 } },
  { name: 'Pizza Casera de Sarten', score: 4, category: 'Italian', image: img(33), types: [MealType.DINNER], ingredients: [{ name: 'Flour', amount: '180', unit: 'g' }, { name: 'Tomato sauce', amount: '100', unit: 'g' }, { name: 'Cheese', amount: '100', unit: 'g' }], steps: ['Make quick dough.', 'Cook base in pan.', 'Add toppings and cover to melt cheese.'], tags: ['comfort'], prepTime: 15, cookTime: 15, servings: 2, nutritionalValue: { calories: 700, protein: 24, carbs: 84, fat: 28, fiber: 4, sugar: 6, sodium: 980 } },
  { name: 'Sopa de Fideos con Pollo', score: 4, category: 'Spanish', image: img(34), types: [MealType.DINNER], ingredients: [{ name: 'Chicken broth', amount: '900', unit: 'ml' }, { name: 'Noodles', amount: '120', unit: 'g' }, { name: 'Chicken', amount: '100', unit: 'g' }], steps: ['Heat broth.', 'Add noodles and chicken.', 'Cook until noodles are tender.'], tags: ['winter'], prepTime: 5, cookTime: 12, servings: 2, nutritionalValue: { calories: 340, protein: 24, carbs: 32, fat: 12, fiber: 1, sugar: 2, sodium: 780 } },
  { name: 'Hamburguesa Casera con Patatas', score: 4, category: 'American', image: img(35), types: [MealType.DINNER], ingredients: [{ name: 'Ground beef', amount: '300', unit: 'g' }, { name: 'Burger bun', amount: '2', unit: 'units' }, { name: 'Potato', amount: '300', unit: 'g' }], steps: ['Shape and grill burgers.', 'Bake or fry potatoes.', 'Assemble burgers and serve.'], tags: ['weekend'], prepTime: 12, cookTime: 20, servings: 2, nutritionalValue: { calories: 780, protein: 38, carbs: 56, fat: 44, fiber: 4, sugar: 5, sodium: 860 } },
];

async function upsertMeal(userId: string, meal: SeedMeal) {
  const existing = await prisma.meal.findFirst({ where: { userId, name: meal.name } });
  if (existing) {
    if (!existing.image) {
      await prisma.meal.update({ where: { id: existing.id }, data: { image: meal.image } });
    }
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

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'demo@lifemanagement.local' } });
  if (!user) {
    throw new Error('Demo user not found. Open the frontend once first so it auto-registers.');
  }

  for (const meal of meals) {
    await upsertMeal(user.id, meal);
  }

  console.log(`Seeded/updated ${meals.length} Spanish student-friendly meals.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
