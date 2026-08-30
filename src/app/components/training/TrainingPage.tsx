import { useEffect, useMemo, useState } from 'react';
import { addDays, format, startOfWeek } from 'date-fns';
import {
  Activity,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  ListPlus,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { TrainingDay, TrainingDayExercise, TrainingExercise, TrainingDayStatus } from '../../types';

const CATEGORIES = ['strength', 'cardio', 'mobility', 'conditioning', 'core'];
const MUSCLES = ['chest', 'back', 'shoulders', 'arms', 'core', 'glutes', 'quads', 'hamstrings', 'calves'];
const STATUSES: TrainingDayStatus[] = ['planned', 'completed', 'skipped'];

function splitValues(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function ExerciseForm({ onSaved }: { onSaved: () => void }) {
  const { addTrainingExercise } = useApp();
  const [draft, setDraft] = useState({
    name: '',
    category: 'strength',
    muscleGroups: '',
    equipment: '',
    difficulty: '',
    instructions: '',
  });

  const save = async () => {
    if (!draft.name.trim()) return;
    await addTrainingExercise({
      name: draft.name.trim(),
      category: draft.category,
      muscleGroups: splitValues(draft.muscleGroups),
      equipment: draft.equipment || undefined,
      difficulty: draft.difficulty || undefined,
      instructions: draft.instructions || undefined,
    });
    setDraft({ name: '', category: 'strength', muscleGroups: '', equipment: '', difficulty: '', instructions: '' });
    onSaved();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <ListPlus className="w-4 h-4 text-amber-500" />
        <h3 className="text-gray-900 dark:text-white" style={{ fontWeight: 700 }}>New exercise</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Exercise name" className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
        <select value={draft.category} onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
          {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <input value={draft.muscleGroups} onChange={(e) => setDraft((p) => ({ ...p, muscleGroups: e.target.value }))} placeholder="Muscles: chest, triceps" className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
        <input value={draft.equipment} onChange={(e) => setDraft((p) => ({ ...p, equipment: e.target.value }))} placeholder="Equipment" className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
        <input value={draft.difficulty} onChange={(e) => setDraft((p) => ({ ...p, difficulty: e.target.value }))} placeholder="Difficulty" className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
        <button onClick={save} className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-500 px-4 py-2 text-sm text-white" style={{ fontWeight: 700 }}>
          <Plus className="w-4 h-4" />
          Add Exercise
        </button>
      </div>
      <textarea value={draft.instructions} onChange={(e) => setDraft((p) => ({ ...p, instructions: e.target.value }))} placeholder="Instructions or cues" className="mt-3 w-full min-h-[72px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
    </div>
  );
}

function ExercisesTab() {
  const { trainingExercises, deleteTrainingExercise } = useApp();
  const [search, setSearch] = useState('');
  const filtered = trainingExercises.filter((exercise) => {
    const needle = search.toLowerCase();
    return !needle || exercise.name.toLowerCase().includes(needle) || exercise.category.toLowerCase().includes(needle) || exercise.muscleGroups.some((muscle) => muscle.toLowerCase().includes(needle));
  });

  return (
    <div className="space-y-4">
      <ExerciseForm onSaved={() => setSearch('')} />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exercises, muscles, categories..." className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 pl-9 pr-3 text-sm text-gray-900 dark:text-gray-100" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((exercise) => (
          <div key={exercise.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-amber-600 dark:text-amber-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="truncate text-gray-900 dark:text-white" style={{ fontWeight: 700 }}>{exercise.name}</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500">{exercise.category}{exercise.equipment ? ` · ${exercise.equipment}` : ''}</p>
              </div>
              <button onClick={() => deleteTrainingExercise(exercise.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete exercise">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {exercise.muscleGroups.map((muscle) => <span key={muscle} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs">{muscle}</span>)}
            </div>
            {exercise.instructions && <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{exercise.instructions}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanEditor({ date, day, onClose }: { date: string; day?: TrainingDay; onClose: () => void }) {
  const { trainingExercises, saveTrainingDay, logWorkoutSession } = useApp();
  const [status, setStatus] = useState<TrainingDayStatus>(day?.status ?? 'planned');
  const [notes, setNotes] = useState(day?.notes ?? '');
  const [items, setItems] = useState<Array<Omit<TrainingDayExercise, 'exercise'> & { exercise?: TrainingExercise }>>(day?.exercises ?? []);

  const addItem = () => {
    const first = trainingExercises[0];
    if (!first) return;
    setItems((prev) => [...prev, { exerciseId: first.id, sets: 3, reps: 10 }]);
  };

  const save = async () => {
    const saved = await saveTrainingDay({
      date,
      status,
      notes: notes || undefined,
      exercises: items.map(({ exercise, ...item }) => item),
    });
    if (status === 'completed') {
      await logWorkoutSession({
        date,
        trainingDayId: saved.id,
        status: 'completed',
        notes: notes || undefined,
        exercises: items.map(({ exercise, targetWeight, ...item }) => ({ ...item, weight: targetWeight })),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-800 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 p-4">
          <div>
            <h3 className="text-gray-900 dark:text-white" style={{ fontWeight: 700 }}>Training plan</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500">{date}</p>
          </div>
          <button onClick={onClose} className="rounded-xl px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">Close</button>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={status} onChange={(e) => setStatus(e.target.value as TrainingDayStatus)} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
              {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Day notes" className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
            <button onClick={addItem} className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
              <Plus className="w-4 h-4" />
              Exercise
            </button>
          </div>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-2 md:grid-cols-7 gap-2 rounded-xl bg-gray-50 dark:bg-gray-700/70 p-2">
                <select value={item.exerciseId} onChange={(e) => setItems((prev) => prev.map((old, i) => i === index ? { ...old, exerciseId: e.target.value } : old))} className="col-span-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-2 text-sm text-gray-900 dark:text-gray-100">
                  {trainingExercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}
                </select>
                {(['sets', 'reps', 'durationMin', 'targetWeight'] as const).map((field) => (
                  <input key={field} type="number" value={item[field] ?? ''} onChange={(e) => setItems((prev) => prev.map((old, i) => i === index ? { ...old, [field]: e.target.value ? Number(e.target.value) : undefined } : old))} placeholder={field} className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-2 text-sm text-gray-900 dark:text-gray-100" />
                ))}
                <button onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))} className="rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 className="mx-auto w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {trainingExercises.length === 0 && <p className="text-sm text-gray-400">Add exercises before planning a training day.</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700 p-4">
          <button onClick={onClose} className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-300">Cancel</button>
          <button onClick={save} disabled={trainingExercises.length === 0} className="rounded-xl bg-amber-400 px-4 py-2 text-sm text-white disabled:opacity-50" style={{ fontWeight: 700 }}>Save plan</button>
        </div>
      </div>
    </div>
  );
}

function ScheduleTab() {
  const { trainingDays, loadTrainingRange, deleteTrainingDay } = useApp();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const from = format(weekStart, 'yyyy-MM-dd');
  const to = format(addDays(weekStart, 6), 'yyyy-MM-dd');

  useEffect(() => {
    loadTrainingRange(from, to);
  }, [from, to, loadTrainingRange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => setCurrentDate((date) => addDays(date, -7))} className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"><ChevronLeft className="w-4 h-4" /></button>
        <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-200" style={{ fontWeight: 700 }}>{from} to {to}</div>
        <button onClick={() => setCurrentDate((date) => addDays(date, 7))} className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
        {weekDays.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const day = trainingDays.find((item) => item.date === dateKey);
          return (
            <div key={dateKey} className="min-h-[220px] rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-400">{format(date, 'EEE')}</p>
                  <h3 className="text-gray-900 dark:text-white" style={{ fontWeight: 700 }}>{format(date, 'MMM d')}</h3>
                </div>
                {day && <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">{day.status}</span>}
              </div>
              <div className="mt-3 space-y-2">
                {day?.exercises.map((item) => (
                  <div key={item.id} className="rounded-xl bg-gray-50 dark:bg-gray-700/60 p-2">
                    <p className="truncate text-sm text-gray-800 dark:text-gray-100" style={{ fontWeight: 600 }}>{item.exercise.name}</p>
                    <p className="text-xs text-gray-400">{item.sets || '-'} sets · {item.reps || item.durationMin || '-'} {item.durationMin ? 'min' : 'reps'}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setEditingDate(dateKey)} className="flex-1 rounded-xl bg-amber-400 px-3 py-2 text-sm text-white" style={{ fontWeight: 700 }}>{day ? 'Edit' : 'Plan'}</button>
                {day && <button onClick={() => deleteTrainingDay(dateKey)} className="rounded-xl border border-red-200 px-3 py-2 text-red-500"><Trash2 className="w-4 h-4" /></button>}
              </div>
            </div>
          );
        })}
      </div>
      {editingDate && <PlanEditor date={editingDate} day={trainingDays.find((item) => item.date === editingDate)} onClose={() => setEditingDate(null)} />}
    </div>
  );
}

function BalanceTab() {
  const { trainingBalance, loadTrainingBalance } = useApp();
  const [from, setFrom] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [to, setTo] = useState(format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6), 'yyyy-MM-dd'));

  useEffect(() => {
    loadTrainingBalance(from, to);
  }, [from, to, loadTrainingBalance]);

  const muscleRows = Object.entries(trainingBalance?.plannedMuscleGroups ?? {}).sort((a, b) => b[1] - a[1]);
  const categories = Object.entries(trainingBalance?.categoryDistribution ?? {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['Planned', trainingBalance?.plannedWorkouts ?? 0],
          ['Completed', trainingBalance?.completedWorkouts ?? 0],
          ['Skipped', trainingBalance?.skippedWorkouts ?? 0],
          ['Minutes', trainingBalance?.totalLoggedMinutes ?? 0],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
            <p className="text-sm text-gray-400">{label}</p>
            <p className="mt-1 text-2xl text-gray-900 dark:text-white" style={{ fontWeight: 800 }}>{value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
          <h3 className="mb-3 text-gray-900 dark:text-white" style={{ fontWeight: 700 }}>Muscle balance</h3>
          <div className="space-y-2">
            {muscleRows.map(([muscle, count]) => <BalanceBar key={muscle} label={muscle} value={count} max={Math.max(...muscleRows.map((row) => row[1]), 1)} />)}
            {muscleRows.length === 0 && <p className="text-sm text-gray-400">No planned muscle data yet.</p>}
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
          <h3 className="mb-3 text-gray-900 dark:text-white" style={{ fontWeight: 700 }}>Category mix</h3>
          <div className="space-y-2">
            {categories.map(([category, count]) => <BalanceBar key={category} label={category} value={count} max={Math.max(...categories.map((row) => row[1]), 1)} />)}
            {categories.length === 0 && <p className="text-sm text-gray-400">No category data yet.</p>}
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
          <h3 className="mb-3 text-gray-900 dark:text-white" style={{ fontWeight: 700 }}>Warnings</h3>
          <div className="space-y-2">
            {(trainingBalance?.warnings ?? []).map((warning) => <p key={warning} className="rounded-xl bg-amber-50 dark:bg-amber-900/30 p-3 text-sm text-amber-700 dark:text-amber-300">{warning}</p>)}
            {(trainingBalance?.warnings ?? []).length === 0 && <p className="flex items-center gap-2 text-sm text-green-600"><Check className="w-4 h-4" />No balance warnings.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function BalanceBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
        <span className="text-gray-400">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
        <div className="h-2 rounded-full bg-amber-400" style={{ width: `${Math.max(8, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}

export function TrainingPage() {
  const [tab, setTab] = useState<'exercises' | 'schedule' | 'balance'>('exercises');
  const tabs = [
    { id: 'exercises', label: 'Exercises', icon: Dumbbell },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays },
    { id: 'balance', label: 'Balance', icon: Activity },
  ] as const;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((item) => (
          <button key={item.id} onClick={() => setTab(item.id)} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-all ${tab === item.id ? 'bg-amber-400 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`} style={{ fontWeight: tab === item.id ? 700 : 500 }}>
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>
      {tab === 'exercises' && <ExercisesTab />}
      {tab === 'schedule' && <ScheduleTab />}
      {tab === 'balance' && <BalanceTab />}
    </div>
  );
}
