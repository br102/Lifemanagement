import { Injectable } from '@nestjs/common';
import { AiProvider, GrocerySuggestion, MealClassification, NutritionResult, PlannerInput } from './ai-provider.interface';

@Injectable()
export class OpenAiProvider implements AiProvider {
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  private readonly baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  async classifyMeal(name: string, ingredients: string[]): Promise<MealClassification> {
    // eslint-disable-next-line no-console
    console.log('[AI][OpenAI] classifyMeal called', { name, ingredientCount: ingredients.length });
    const prompt = `Classify this meal focusing on cuisine/style and dietary properties.
Return strict JSON object:
{"primaryCategory":"string","categories":["string", ...],"types":["Breakfast"|"Lunch"|"Dinner"|"Snack"|"Protein Shake", ...],"vegetarian":true|false,"lactoseFree":true|false}
Rules:
- primaryCategory should be cuisine/style (examples: "Spanish", "Italian", "Mexican", "Mediterranean", "Asian").
- categories should include primaryCategory plus complementary labels (for example "Traditional", "Home Cooking", "High Protein", etc.) when they are strongly applicable.
- vegetarian=true only if no meat/fish/seafood is present.
- lactoseFree=true only if no dairy/lactose ingredients are present.
Meal: ${name}
Ingredients: ${ingredients.join(', ')}`;
    const json = await this.askJson(prompt);
    const primaryCategory = this.optionalString(json, 'primaryCategory') ?? this.requiredString(json, 'category');
    const categoriesRaw = Array.isArray(json?.categories)
      ? json.categories
      : [primaryCategory];
    const categories = categoriesRaw
      .filter((value: unknown) => typeof value === 'string' && value.trim().length > 0)
      .map((value: string) => value.trim());
    if (!categories.includes(primaryCategory)) categories.unshift(primaryCategory);
    const typesRaw = json?.types;
    if (!Array.isArray(typesRaw) || !typesRaw.length) {
      throw new Error('OpenAI classifyMeal returned invalid "types"');
    }
    const allowed = new Set(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Protein Shake']);
    const types = typesRaw.filter((value: unknown) => typeof value === 'string' && allowed.has(value)) as string[];
    if (!types.length) {
      throw new Error('OpenAI classifyMeal returned unsupported meal types');
    }
    return {
      primaryCategory,
      categories,
      category: primaryCategory,
      types,
      vegetarian: this.requiredBoolean(json, 'vegetarian'),
      lactoseFree: this.requiredBoolean(json, 'lactoseFree'),
    };
  }

  async estimateNutrition(name: string, ingredients: Array<{ name: string; amount: string; unit: string }>): Promise<NutritionResult> {
    // eslint-disable-next-line no-console
    console.log('[AI][OpenAI] estimateNutrition called', { name, ingredientCount: ingredients.length });
    const prompt = `Estimate nutrition for one serving.
Return strict JSON object with integer fields:
{"calories":number,"protein":number,"carbs":number,"fat":number,"fiber":number,"sugar":number,"sodium":number}
Meal: ${name}
Ingredients: ${JSON.stringify(ingredients)}`;
    const json = await this.askJson(prompt);
    return {
      calories: this.requiredInt(json, 'calories'),
      protein: this.requiredInt(json, 'protein'),
      carbs: this.requiredInt(json, 'carbs'),
      fat: this.requiredInt(json, 'fat'),
      fiber: this.requiredInt(json, 'fiber'),
      sugar: this.requiredInt(json, 'sugar'),
      sodium: this.requiredInt(json, 'sodium'),
    };
  }

  async generateWeekPlan(input: PlannerInput): Promise<Record<string, Partial<Record<'breakfast' | 'lunch' | 'snack' | 'proteinShake' | 'dinner', string>>>> {
    const mealPool = input.meals.map((m) => ({ id: m.id, name: m.name, types: m.types }));
    const prompt = `Create a 7-day meal plan from weekStartDate ${input.weekStartDate}.
Return strict JSON object where each key is YYYY-MM-DD and each value is:
{"breakfast":"mealId|null","lunch":"mealId|null","snack":"mealId|null","proteinShake":"mealId|null","dinner":"mealId|null"}
Use only meal IDs from this pool:
${JSON.stringify(mealPool)}
Goal: nutritional balance, variety, ingredient reuse, realistic cooking schedule.`;
    const json = await this.askJson(prompt);
    if (!json || typeof json !== 'object' || Array.isArray(json)) {
      throw new Error('OpenAI generateWeekPlan returned invalid JSON');
    }
    const result: Record<string, Partial<Record<'breakfast' | 'lunch' | 'snack' | 'proteinShake' | 'dinner', string>>> = {};
    const validIds = new Set(input.meals.map((meal) => meal.id));
    const slotKeys: Array<'breakfast' | 'lunch' | 'snack' | 'proteinShake' | 'dinner'> = ['breakfast', 'lunch', 'snack', 'proteinShake', 'dinner'];
    for (const [date, value] of Object.entries(json)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
      const day: Partial<Record<'breakfast' | 'lunch' | 'snack' | 'proteinShake' | 'dinner', string>> = {};
      for (const slot of slotKeys) {
        const mealId = (value as Record<string, unknown>)[slot];
        if (typeof mealId === 'string' && validIds.has(mealId)) day[slot] = mealId;
      }
      result[date] = day;
    }
    if (!Object.keys(result).length) {
      throw new Error('OpenAI generateWeekPlan returned no valid day plan');
    }
    return result;
  }

  async suggestGroceryMeta(items: Array<{ name: string; category: string }>): Promise<GrocerySuggestion[]> {
    const prompt = `For these grocery items return strict JSON object:
{"items":[{"itemName":"string","category":"string","recommendedPurchaseDate":"YYYY-MM-DD optional","estimatedExpirationDate":"YYYY-MM-DD optional"}]}
Items: ${JSON.stringify(items)}`;
    const json = await this.askJson(prompt);
    const result = json?.items;
    if (!Array.isArray(result)) {
      throw new Error('OpenAI suggestGroceryMeta returned invalid items array');
    }
    return result
      .filter((entry: unknown) => entry && typeof entry === 'object')
      .map((entry) => ({
        itemName: this.requiredString(entry, 'itemName'),
        category: this.requiredString(entry, 'category'),
        recommendedPurchaseDate: this.optionalString(entry, 'recommendedPurchaseDate'),
        estimatedExpirationDate: this.optionalString(entry, 'estimatedExpirationDate'),
      }));
  }

  private async askJson(prompt: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is missing');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'You are a food planning assistant. Output strict JSON only. No markdown.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI error ${response.status}: ${errText}`);
    }
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error('OpenAI returned empty content');
    }
    try {
      return JSON.parse(content);
    } catch {
      const start = content.indexOf('{');
      const end = content.lastIndexOf('}');
      if (start >= 0 && end > start) {
        const maybeJson = content.slice(start, end + 1);
        try {
          return JSON.parse(maybeJson);
        } catch {
          // continue to throw below
        }
      }
      throw new Error(`OpenAI returned non-JSON content: ${content.slice(0, 160)}`);
    }
  }

  private requiredInt(source: unknown, key: string): number {
    if (!source || typeof source !== 'object') {
      throw new Error(`OpenAI response missing object for key "${key}"`);
    }
    const value = (source as Record<string, unknown>)[key];
    const n = Number(value);
    if (!Number.isFinite(n)) {
      throw new Error(`OpenAI response invalid integer for key "${key}"`);
    }
    return Math.round(n);
  }

  private requiredString(source: unknown, key: string): string {
    if (!source || typeof source !== 'object') {
      throw new Error(`OpenAI response missing object for key "${key}"`);
    }
    const value = (source as Record<string, unknown>)[key];
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`OpenAI response invalid string for key "${key}"`);
    }
    return value.trim();
  }

  private optionalString(source: unknown, key: string): string | undefined {
    if (!source || typeof source !== 'object') return undefined;
    const value = (source as Record<string, unknown>)[key];
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  private requiredBoolean(source: unknown, key: string): boolean {
    if (!source || typeof source !== 'object') {
      throw new Error(`OpenAI response missing object for key "${key}"`);
    }
    const value = (source as Record<string, unknown>)[key];
    if (typeof value !== 'boolean') {
      throw new Error(`OpenAI response invalid boolean for key "${key}"`);
    }
    return value;
  }
}
