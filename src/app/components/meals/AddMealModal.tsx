import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { X, Plus, Trash2, Sparkles, Loader2, ExternalLink, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Meal, MealType, NutritionalValue, Ingredient } from '../../types';

interface FormValues {
  name: string;
  image: string;
  score: number;
  types: MealType[];
  category: string;
  tags: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: { name: string; amount: string; unit: string }[];
  steps: { text: string }[];
  link: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const TYPE_COLORS: Record<MealType, string> = {
  Breakfast: 'border-orange-300 bg-orange-50 text-orange-700',
  Lunch: 'border-green-300 bg-green-50 text-green-700',
  Dinner: 'border-blue-300 bg-blue-50 text-blue-700',
  Snack: 'border-purple-300 bg-purple-50 text-purple-700',
};

interface Props {
  meal?: Meal;
  onClose: () => void;
  onSaved: () => void;
}

export function AddMealModal({ meal, onClose, onSaved }: Props) {
  const { addMeal, updateMeal, aiCategorize, aiCalculateNutrition, aiDraftMealFromLink } = useApp();
  const [aiLoading, setAiLoading] = useState<'category' | 'nutrition' | null>(null);
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'nutrition'>('basic');

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormValues>({
    defaultValues: meal ? {
      name: meal.name, image: meal.image || '', score: meal.score,
      types: meal.types, category: meal.category, tags: meal.tags?.join(', ') || '',
      prepTime: meal.prepTime || 0, cookTime: meal.cookTime || 0, servings: meal.servings || 2,
      ingredients: meal.ingredients.map(i => ({ name: i.name, amount: i.amount, unit: i.unit })),
      steps: meal.steps.map(s => ({ text: s })), link: meal.link || '',
      calories: meal.nutritionalValue.calories, protein: meal.nutritionalValue.protein,
      carbs: meal.nutritionalValue.carbs, fat: meal.nutritionalValue.fat,
      fiber: meal.nutritionalValue.fiber, sugar: meal.nutritionalValue.sugar, sodium: meal.nutritionalValue.sodium,
    } : {
      name: '', image: '', score: 4, types: [], category: '', tags: '',
      prepTime: 0, cookTime: 0, servings: 2,
      ingredients: [{ name: '', amount: '', unit: '' }],
      steps: [{ text: '' }],
      link: '', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0,
    },
  });

  const { fields: ingFields, append: addIng, remove: removeIng } = useFieldArray({ control, name: 'ingredients' });
  const { fields: stepFields, append: addStep, remove: removeStep } = useFieldArray({ control, name: 'steps' });

  const watchedTypes = watch('types');
  const watchedScore = watch('score');
  const watchedName = watch('name');
  const watchedImage = watch('image');
  const watchedTags = watch('tags');

  const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

  const handleImageFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const token = localStorage.getItem('lm_access_token') ?? sessionStorage.getItem('lm_access_token');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/meals/upload-image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    if (!res.ok) return;
    const data = await res.json();
    const imageUrl = data.imageUrl?.startsWith('http') ? data.imageUrl : `${API_URL}${data.imageUrl}`;
    setValue('image', imageUrl);
  };

  const toggleType = (type: MealType) => {
    const current = watchedTypes || [];
    if (current.includes(type)) setValue('types', current.filter(t => t !== type));
    else setValue('types', [...current, type]);
  };

  const handleAiCategory = async () => {
    if (!watchedName) return;
    setAiLoading('category');
    try {
      const ingredients = ingFields.map(f => (f as any).name || '').filter(Boolean);
      const result = await aiCategorize(watchedName, ingredients);
      setValue('category', result.primaryCategory || result.category);
      setValue('types', result.types);
      const dietaryTags = [
        result.vegetarian ? 'vegetarian' : 'non-vegetarian',
        result.lactoseFree ? 'lactose-free' : 'contains-lactose',
      ];
      const currentTags = (watchedTags || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      const nextTags = Array.from(new Set([...currentTags, ...(result.categories || []), ...dietaryTags]));
      setValue('tags', nextTags.join(', '));
    } finally {
      setAiLoading(null);
    }
  };

  const handleAiNutrition = async () => {
    setAiLoading('nutrition');
    try {
      const ingredients: Ingredient[] = ingFields.map((f, i) => ({
        id: `temp-${i}`,
        name: (f as any).name || '',
        amount: (f as any).amount || '1',
        unit: (f as any).unit || '',
      }));
      const result = await aiCalculateNutrition(watchedName, ingredients);
      setValue('calories', result.calories);
      setValue('protein', result.protein);
      setValue('carbs', result.carbs);
      setValue('fat', result.fat);
      setValue('fiber', result.fiber);
      setValue('sugar', result.sugar);
      setValue('sodium', result.sodium);
    } finally {
      setAiLoading(null);
    }
  };

  const onSubmit = async (data: FormValues) => {
    const nutritionalValue: NutritionalValue = {
      calories: Number(data.calories), protein: Number(data.protein),
      carbs: Number(data.carbs), fat: Number(data.fat),
      fiber: Number(data.fiber), sugar: Number(data.sugar), sodium: Number(data.sodium),
    };
    const ingredients: Ingredient[] = data.ingredients.map((ing, i) => ({
      id: `ing-${i}`, name: ing.name, amount: ing.amount, unit: ing.unit,
    }));
    const mealData = {
      name: data.name, image: data.image || undefined, score: Number(data.score),
      types: data.types, category: data.category,
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      prepTime: Number(data.prepTime) || undefined, cookTime: Number(data.cookTime) || undefined,
      servings: Number(data.servings) || undefined,
      ingredients, steps: data.steps.map(s => s.text).filter(Boolean), link: data.link || undefined,
      nutritionalValue,
      aiNutrition: false,
    };
    try {
      if (meal) await updateMeal({ ...meal, ...mealData });
      else await addMeal(mealData);
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save meal', error);
      window.alert('Could not save the recipe. Check backend logs and try again.');
    }
  };

  const handleAiDraftFromLink = async () => {
    const link = (watch('link') || '').trim();
    if (!link) return;
    setAiDraftLoading(true);
    try {
      const draft = await aiDraftMealFromLink(link);
      if (draft.name) setValue('name', draft.name);
      if (draft.category) setValue('category', draft.category);
      if (draft.types?.length) setValue('types', draft.types as MealType[]);
      if (draft.score) setValue('score', Math.min(5, Math.max(1, Math.round(draft.score))));
      if (draft.ingredients?.length) setValue('ingredients', draft.ingredients);
      if (draft.steps?.length) setValue('steps', draft.steps.map((text) => ({ text })));
      if (draft.nutritionalValue) {
        setValue('calories', draft.nutritionalValue.calories);
        setValue('protein', draft.nutritionalValue.protein);
        setValue('carbs', draft.nutritionalValue.carbs);
        setValue('fat', draft.nutritionalValue.fat);
        setValue('fiber', draft.nutritionalValue.fiber);
        setValue('sugar', draft.nutritionalValue.sugar);
        setValue('sodium', draft.nutritionalValue.sodium);
      }
      if (draft.image) setValue('image', draft.image);
      if (draft.prepTime !== undefined) setValue('prepTime', draft.prepTime);
      if (draft.cookTime !== undefined) setValue('cookTime', draft.cookTime);
      if (draft.servings !== undefined) setValue('servings', draft.servings);
      if (draft.tags?.length) setValue('tags', draft.tags.join(', '));
      setActiveTab('basic');
    } finally {
      setAiDraftLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'details', label: 'Ingredients & Steps' },
    { id: 'nutrition', label: 'Nutrition' },
  ] as const;

  const requestClose = () => {
    if (window.confirm('Are you sure you want to close this recipe form? Any unsaved changes will be lost.')) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={requestClose}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-transparent dark:border-gray-800" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-gray-900 dark:text-gray-100" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
            {meal ? 'Edit Meal' : 'Add New Meal'}
          </h2>
          <button onClick={requestClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 flex-shrink-0">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm border-b-2 transition-colors ${activeTab === tab.id ? 'border-amber-400 text-amber-600 dark:text-amber-400 font-medium' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Basic Tab */}
            {activeTab === 'basic' && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Meal Name *</label>
                  <input {...register('name', { required: true })} placeholder="e.g. Mediterranean Salad" className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Image URL</label>
                  <input {...register('image')} placeholder="https://..." className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                  <div
                    className="mt-2 rounded-xl border-2 border-dashed border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-center"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleImageFile(e.dataTransfer.files?.[0]);
                    }}
                  >
                    <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">Drag & drop an image here</p>
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-900/60 rounded-full text-xs text-amber-700 dark:text-amber-300 cursor-pointer hover:bg-amber-50 dark:hover:bg-gray-700">
                      Upload image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFile(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                  {watchedImage && <img src={watchedImage} alt="preview" className="mt-2 w-full h-32 object-cover rounded-xl" onError={e => e.currentTarget.style.display='none'} />}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Score</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setValue('score', s)} onMouseEnter={() => setHoverStar(s)} onMouseLeave={() => setHoverStar(0)}
                        className="p-1 transition-transform hover:scale-110">
                        <Star className={`w-6 h-6 ${s <= (hoverStar || watchedScore) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700 fill-gray-200 dark:fill-gray-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Meal Types</label>
                  <div className="flex flex-wrap gap-2">
                    {MEAL_TYPES.map(type => (
                      <button key={type} type="button" onClick={() => toggleType(type)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${watchedTypes?.includes(type) ? TYPE_COLORS[type] : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm text-gray-600 dark:text-gray-300">Category</label>
                    <button type="button" onClick={handleAiCategory} disabled={!watchedName || aiLoading === 'category'}
                      className="flex items-center gap-1 px-2.5 py-1 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-300 rounded-full text-xs hover:bg-violet-100 dark:hover:bg-violet-900/40 disabled:opacity-50">
                      {aiLoading === 'category' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      AI Fill
                    </button>
                  </div>
                  <input {...register('category')} placeholder="e.g. Spanish, Italian, Mexican..." className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Prep (min)</label>
                    <input type="number" {...register('prepTime')} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Cook (min)</label>
                    <input type="number" {...register('cookTime')} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Servings</label>
                    <input type="number" {...register('servings')} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Tags (comma separated)</label>
                  <input {...register('tags')} placeholder="e.g. vegetarian, lactose-free, high-protein" className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Recipe Link</label>
                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input {...register('link')} placeholder="https://..." className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                    </div>
                    <button
                      type="button"
                      onClick={handleAiDraftFromLink}
                      disabled={!watchedName && !(watch('link') || '').trim() || aiDraftLoading}
                      className="px-3 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 disabled:opacity-50 whitespace-nowrap"
                    >
                      {aiDraftLoading ? 'Filling...' : 'Fill with AI'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-gray-600 dark:text-gray-300">Ingredients</label>
                    <button type="button" onClick={() => addIng({ name: '', amount: '', unit: '' })}
                      className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-300 rounded-full text-xs hover:bg-amber-100 dark:hover:bg-amber-900/40">
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {ingFields.map((field, i) => (
                      <div key={field.id} className="flex gap-2">
                        <input {...register(`ingredients.${i}.name`)} placeholder="Ingredient" className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                        <input {...register(`ingredients.${i}.amount`)} placeholder="Amt" className="w-16 px-2 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                        <input {...register(`ingredients.${i}.unit`)} placeholder="Unit" className="w-20 px-2 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                        <button type="button" onClick={() => removeIng(i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-gray-600 dark:text-gray-300">Steps</label>
                    <button type="button" onClick={() => addStep({ text: '' })}
                      className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-300 rounded-full text-xs hover:bg-amber-100 dark:hover:bg-amber-900/40">
                      <Plus className="w-3 h-3" /> Add Step
                    </button>
                  </div>
                  <div className="space-y-2">
                    {stepFields.map((field, i) => (
                      <div key={field.id} className="flex gap-2 items-start">
                        <span className="flex-shrink-0 w-6 h-7 flex items-center justify-center text-xs text-amber-600 dark:text-amber-300 font-bold">{i + 1}</span>
                        <textarea {...register(`steps.${i}.text`)} placeholder={`Step ${i + 1}...`} rows={2} className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none" />
                        <button type="button" onClick={() => removeStep(i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg mt-0.5">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Nutrition Tab */}
            {activeTab === 'nutrition' && (
              <>
                <div className="flex items-center justify-between p-3 bg-violet-50 dark:bg-violet-950/30 rounded-xl mb-2">
                  <div>
                    <p className="text-sm text-violet-700 dark:text-violet-300" style={{ fontWeight: 600 }}>AI Calculate Nutrition</p>
                    <p className="text-xs text-violet-500 dark:text-violet-400">Based on your ingredients</p>
                  </div>
                  <button type="button" onClick={handleAiNutrition} disabled={aiLoading === 'nutrition'}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm hover:bg-violet-700 disabled:opacity-50 transition-colors">
                    {aiLoading === 'nutrition' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {aiLoading === 'nutrition' ? 'Calculating...' : 'Calculate'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'calories', label: 'Calories (kcal)', color: 'bg-orange-50 border-orange-200' },
                    { key: 'protein', label: 'Protein (g)', color: 'bg-indigo-50 border-indigo-200' },
                    { key: 'carbs', label: 'Carbohydrates (g)', color: 'bg-amber-50 border-amber-200' },
                    { key: 'fat', label: 'Fat (g)', color: 'bg-red-50 border-red-200' },
                    { key: 'fiber', label: 'Fiber (g)', color: 'bg-green-50 border-green-200' },
                    { key: 'sugar', label: 'Sugar (g)', color: 'bg-pink-50 border-pink-200' },
                    { key: 'sodium', label: 'Sodium (mg)', color: 'bg-gray-50 border-gray-200' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{field.label}</label>
                      <input type="number" {...register(field.key as keyof FormValues)} className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 text-gray-900 dark:text-gray-100 ${field.color}`} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
            <button type="button" onClick={requestClose} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-amber-400 rounded-xl text-white text-sm hover:bg-amber-500 transition-colors" style={{ fontWeight: 600 }}>
              {meal ? 'Save Changes' : 'Add Meal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
