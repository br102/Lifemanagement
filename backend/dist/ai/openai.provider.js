"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiProvider = void 0;
const common_1 = require("@nestjs/common");
let OpenAiProvider = class OpenAiProvider {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY;
        this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    }
    async classifyMeal(name, ingredients) {
        console.log('[AI][OpenAI] classifyMeal called', { name, ingredientCount: ingredients.length });
        const prompt = `Classify this meal focusing on cuisine/style and meal type.
Return strict JSON object:
{"primaryCategory":"string","categories":["string", ...],"types":["Breakfast"|"Lunch"|"Dinner"|"Snack"|"Protein Shake", ...]}
Rules:
- primaryCategory should be cuisine/style (examples: "Spanish", "Italian", "Mexican", "Mediterranean", "Asian").
- categories should include primaryCategory plus complementary labels (for example "Traditional", "Home Cooking", "High Protein", etc.) when they are strongly applicable.
Meal: ${name}
Ingredients: ${ingredients.join(', ')}`;
        const json = await this.askJson(prompt);
        const primaryCategory = this.optionalString(json, 'primaryCategory') ?? this.requiredString(json, 'category');
        const categoriesRaw = Array.isArray(json?.categories)
            ? json.categories
            : [primaryCategory];
        const categories = categoriesRaw
            .filter((value) => typeof value === 'string' && value.trim().length > 0)
            .map((value) => value.trim());
        if (!categories.includes(primaryCategory))
            categories.unshift(primaryCategory);
        const typesRaw = json?.types;
        if (!Array.isArray(typesRaw) || !typesRaw.length) {
            throw new Error('OpenAI classifyMeal returned invalid "types"');
        }
        const allowed = new Set(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Protein Shake']);
        const types = typesRaw.filter((value) => typeof value === 'string' && allowed.has(value));
        if (!types.length) {
            throw new Error('OpenAI classifyMeal returned unsupported meal types');
        }
        return {
            primaryCategory,
            categories,
            category: primaryCategory,
            types,
        };
    }
    async estimateNutrition(name, ingredients) {
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
    async draftMealFromLink(link) {
        console.log('[AI][OpenAI] draftMealFromLink called', { link });
        const prompt = `Use this recipe link as the only input and return a best-effort meal draft.
Do not scrape the website. Do not browse. Infer from the URL, path, slug, filename, and any obvious cues only.
If you cannot infer a value, use null or an empty array.
Return strict JSON only with this shape:
{
  "name": string | null,
  "category": string | null,
  "types": string[],
  "score": number | null,
  "ingredients": [{"name": string, "amount": string, "unit": string}],
  "steps": [string],
  "nutritionalValue": {"calories": number,"protein": number,"carbs": number,"fat": number,"fiber": number,"sugar": number,"sodium": number} | null,
  "image": string | null,
  "prepTime": number | null,
  "cookTime": number | null,
  "servings": number | null,
  "tags": [string]
}
Rules:
- Keep the output practical and ready to paste into a meal form.
- Use 3 to 8 ingredients if possible.
- Use 3 to 7 steps if possible.
- score should be between 1 and 5 if inferred, otherwise null.
- types should use only Breakfast, Lunch, Dinner, Snack, Protein Shake.
Link: ${link}`;
        const json = await this.askJson(prompt);
        const types = Array.isArray(json?.types)
            ? json.types.filter((value) => typeof value === 'string')
            : [];
        const ingredients = Array.isArray(json?.ingredients)
            ? json.ingredients
                .filter((value) => value && typeof value === 'object')
                .map((item) => ({
                name: this.optionalString(item, 'name') ?? '',
                amount: this.optionalString(item, 'amount') ?? '',
                unit: this.optionalString(item, 'unit') ?? '',
            }))
                .filter((item) => item.name.length > 0)
            : [];
        const steps = Array.isArray(json?.steps)
            ? json.steps.map((step) => typeof step === 'string' ? step.trim() : '').filter(Boolean)
            : [];
        const nutritionalValue = json?.nutritionalValue
            ? {
                calories: this.requiredInt(json.nutritionalValue, 'calories'),
                protein: this.requiredInt(json.nutritionalValue, 'protein'),
                carbs: this.requiredInt(json.nutritionalValue, 'carbs'),
                fat: this.requiredInt(json.nutritionalValue, 'fat'),
                fiber: this.requiredInt(json.nutritionalValue, 'fiber'),
                sugar: this.requiredInt(json.nutritionalValue, 'sugar'),
                sodium: this.requiredInt(json.nutritionalValue, 'sodium'),
            }
            : undefined;
        const scoreValue = json?.score == null ? undefined : Number(json.score);
        const score = Number.isFinite(scoreValue) ? Math.min(5, Math.max(1, Math.round(scoreValue))) : undefined;
        return {
            name: this.optionalString(json, 'name'),
            category: this.optionalString(json, 'category'),
            types,
            score,
            ingredients,
            steps,
            nutritionalValue,
            image: this.optionalString(json, 'image'),
            prepTime: this.optionalString(json, 'prepTime') ? Number(this.optionalString(json, 'prepTime')) : undefined,
            cookTime: this.optionalString(json, 'cookTime') ? Number(this.optionalString(json, 'cookTime')) : undefined,
            servings: this.optionalString(json, 'servings') ? Number(this.optionalString(json, 'servings')) : undefined,
            tags: Array.isArray(json?.tags) ? json.tags.filter((value) => typeof value === 'string') : [],
        };
    }
    async generateWeekPlan(input) {
        const mealPool = input.meals.map((m) => ({ id: m.id, name: m.name, types: m.types, desiredFrequency: m.desiredFrequency, score: m.score }));
        const profileBlock = input.profile
            ? `User profile:
${JSON.stringify(input.profile, null, 2)}`
            : 'User profile: not provided';
        const prefs = input.preferences || {};
        const preferencesBlock = `User preferences for meal planning:
${prefs.dietaryRestrictions ? `- Dietary restrictions: ${prefs.dietaryRestrictions}` : '- No dietary restrictions'}
${prefs.cuisinePreferences ? `- Cuisine preferences: ${prefs.cuisinePreferences}` : '- Open to any cuisine'}
${prefs.ingredientsToAvoid ? `- Ingredients to avoid: ${prefs.ingredientsToAvoid}` : '- No ingredient restrictions'}
${prefs.cookingLevel ? `- Cooking level: ${prefs.cookingLevel} (quick = <30 min, moderate = 30-60 min)` : '- Cooking level: any'}
${prefs.mealRepetition ? `- Meal repetition target: each meal should appear ~${prefs.mealRepetition} times in the week` : '- Meal repetition target: 2-3 times per week for efficiency'}
${prefs.notes ? `- Additional notes: ${prefs.notes}` : ''}`;
        const prompt = `Create a 7-day meal plan from weekStartDate ${input.weekStartDate}.
Return strict JSON object where each key is YYYY-MM-DD and each value is:
{"breakfast":"mealId|null","lunch":"mealId|null","snack":"mealId|null","proteinShake":"mealId|null","dinner":"mealId|null"}

Use only meal IDs from this pool:
${JSON.stringify(mealPool)}

${profileBlock}

${preferencesBlock}

**CRITICAL: User lives alone — optimize for meal prep efficiency**
- MOST IMPORTANT: Repeat meals 2-3 times throughout the week in DIFFERENT slots
- Example good plan: Chicken with rice appears Monday lunch, Wednesday dinner, Friday snack
- This is realistic single-person cooking: cook once, eat multiple times over 2-3 days
- Spread repeated meals across non-consecutive days for variety perception
- Do NOT use all different meals — that's wasteful for one person

**Nutritional goals:**
- Primary: hit targetProtein every day
- Secondary: stay close to targetCalories/targetCarbs/targetFat
- If no targets, build balanced varied week
- Respect desiredFrequency: WEEKLY ~1x/week, BIWEEKLY ~1x/2weeks, MONTHLY ~1x/month, OCCASIONAL 0-1x/week, SPECIAL rare
- Favor high-score meals
- Leave slot null if no good fit

**Respect user preferences:**
- Match dietary restrictions (vegetarian, vegan, gluten-free, etc.)
- Use preferred cuisines when possible
- Avoid specified ingredients
- Prioritize cooking level preference`;
        const json = await this.askJson(prompt);
        if (!json || typeof json !== 'object' || Array.isArray(json)) {
            throw new Error('OpenAI generateWeekPlan returned invalid JSON');
        }
        const result = {};
        const validIds = new Set(input.meals.map((meal) => meal.id));
        const slotKeys = ['breakfast', 'lunch', 'snack', 'proteinShake', 'dinner'];
        for (const [date, value] of Object.entries(json)) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
                continue;
            if (!value || typeof value !== 'object' || Array.isArray(value))
                continue;
            const day = {};
            for (const slot of slotKeys) {
                const mealId = value[slot];
                if (typeof mealId === 'string' && validIds.has(mealId))
                    day[slot] = mealId;
            }
            result[date] = day;
        }
        if (!Object.keys(result).length) {
            throw new Error('OpenAI generateWeekPlan returned no valid day plan');
        }
        return result;
    }
    async suggestGroceryMeta(items) {
        const prompt = `For these grocery items return strict JSON object:
{"items":[{"itemName":"string","category":"string","recommendedPurchaseDate":"YYYY-MM-DD optional","estimatedExpirationDate":"YYYY-MM-DD optional"}]}
Items: ${JSON.stringify(items)}`;
        const json = await this.askJson(prompt);
        const result = json?.items;
        if (!Array.isArray(result)) {
            throw new Error('OpenAI suggestGroceryMeta returned invalid items array');
        }
        return result
            .filter((entry) => entry && typeof entry === 'object')
            .map((entry) => ({
            itemName: this.requiredString(entry, 'itemName'),
            category: this.requiredString(entry, 'category'),
            recommendedPurchaseDate: this.optionalString(entry, 'recommendedPurchaseDate'),
            estimatedExpirationDate: this.optionalString(entry, 'estimatedExpirationDate'),
        }));
    }
    async parseReceipt(imageUrl, knownIngredientNames) {
        const prompt = `This is a photo of a Biedronka (Polish supermarket) receipt. Extract each food line item from the receipt.
For each item, provide: ingredient name (normalized to English, reuse a name from the known list if it matches, otherwise propose a new concise name), quantity, unit (normalized to: g | kg | ml | l | pcs), and price paid.
Skip non-food items (bags, deposits, loyalty discounts, etc.).
Return strict JSON:
{
  "store": "Biedronka",
  "purchaseDate": "YYYY-MM-DD",
  "totalAmount": number or null,
  "items": [{"name":"string","quantity":number,"unit":"g|kg|ml|l|pcs","price":number}]
}
Known ingredient names to match against: ${JSON.stringify(knownIngredientNames)}`;
        const json = await this.askJsonWithImage(prompt, imageUrl);
        const store = this.optionalString(json, 'store') ?? 'Biedronka';
        const purchaseDate = this.optionalString(json, 'purchaseDate') ?? new Date().toISOString().split('T')[0];
        const totalAmount = json?.totalAmount ? Number(json.totalAmount) : undefined;
        const itemsRaw = Array.isArray(json?.items) ? json.items : [];
        const items = itemsRaw
            .filter((item) => item && typeof item === 'object')
            .map((item) => ({
            name: this.requiredString(item, 'name'),
            quantity: this.requiredFloat(item, 'quantity'),
            unit: this.requiredString(item, 'unit'),
            price: this.requiredFloat(item, 'price'),
        }));
        if (items.length === 0) {
            throw new Error('OpenAI parseReceipt extracted no food items from the receipt');
        }
        return { store, purchaseDate, totalAmount, items };
    }
    async askJson(prompt) {
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
        }
        catch {
            const start = content.indexOf('{');
            const end = content.lastIndexOf('}');
            if (start >= 0 && end > start) {
                const maybeJson = content.slice(start, end + 1);
                try {
                    return JSON.parse(maybeJson);
                }
                catch {
                }
            }
            throw new Error(`OpenAI returned non-JSON content: ${content.slice(0, 160)}`);
        }
    }
    async askJsonWithImage(prompt, imageUrl) {
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
                    { role: 'system', content: 'You are a food planning assistant specialized in receipt extraction. Output strict JSON only. No markdown.' },
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            { type: 'image_url', image_url: { url: imageUrl } },
                        ],
                    },
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
        }
        catch {
            const start = content.indexOf('{');
            const end = content.lastIndexOf('}');
            if (start >= 0 && end > start) {
                const maybeJson = content.slice(start, end + 1);
                try {
                    return JSON.parse(maybeJson);
                }
                catch {
                }
            }
            throw new Error(`OpenAI returned non-JSON content: ${content.slice(0, 160)}`);
        }
    }
    requiredInt(source, key) {
        if (!source || typeof source !== 'object') {
            throw new Error(`OpenAI response missing object for key "${key}"`);
        }
        const value = source[key];
        const n = Number(value);
        if (!Number.isFinite(n)) {
            throw new Error(`OpenAI response invalid integer for key "${key}"`);
        }
        return Math.round(n);
    }
    requiredString(source, key) {
        if (!source || typeof source !== 'object') {
            throw new Error(`OpenAI response missing object for key "${key}"`);
        }
        const value = source[key];
        if (typeof value !== 'string' || !value.trim()) {
            throw new Error(`OpenAI response invalid string for key "${key}"`);
        }
        return value.trim();
    }
    optionalString(source, key) {
        if (!source || typeof source !== 'object')
            return undefined;
        const value = source[key];
        if (typeof value !== 'string')
            return undefined;
        const trimmed = value.trim();
        return trimmed.length ? trimmed : undefined;
    }
    requiredBoolean(source, key) {
        if (!source || typeof source !== 'object') {
            throw new Error(`OpenAI response missing object for key "${key}"`);
        }
        const value = source[key];
        if (typeof value !== 'boolean') {
            throw new Error(`OpenAI response invalid boolean for key "${key}"`);
        }
        return value;
    }
    requiredFloat(source, key) {
        if (!source || typeof source !== 'object') {
            throw new Error(`OpenAI response missing object for key "${key}"`);
        }
        const value = source[key];
        const n = Number(value);
        if (!Number.isFinite(n)) {
            throw new Error(`OpenAI response invalid float for key "${key}"`);
        }
        return n;
    }
};
exports.OpenAiProvider = OpenAiProvider;
exports.OpenAiProvider = OpenAiProvider = __decorate([
    (0, common_1.Injectable)()
], OpenAiProvider);
//# sourceMappingURL=openai.provider.js.map