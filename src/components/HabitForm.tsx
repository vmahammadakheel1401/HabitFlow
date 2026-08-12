import { useState } from 'react';
import { ArrowLeft, Save, Plus, X, PlusCircle, Palette } from 'lucide-react';
import { Habit, Frequency, HabitType, HabitCategory, TimeOfDay, Category } from '@/types';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HabitFormProps {
  onSave: (habit: Partial<Habit>) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
  initialData?: Habit;
  categories: Category[];
  onAddCategory: (name: string, color: string) => void;
  onDeleteCategory: (category: Category) => void;
}

const AVAILABLE_ICONS = [
  'Activity', 'Book', 'Moon', 'Droplets', 'Dumbbell', 'Apple', 'Zap', 'Pencil', 'Music', 'Cloud'
];

const COLORS = [
  '#386a20', '#006874', '#415f91', '#8f4c38', '#65558f', '#2c634e', '#d32f2f', '#7b1fa2', '#1976d2', '#388e3c'
];

export function HabitForm({ onSave, onDelete, onCancel, initialData, categories, onAddCategory, onDeleteCategory }: HabitFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<HabitCategory>(initialData?.category || 'Productivity');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(initialData?.timeOfDay || 'Morning');
  const [icon, setIcon] = useState(initialData?.icon || 'Activity');
  const [color, setColor] = useState(initialData?.color || COLORS[0]);
  const [frequency, setFrequency] = useState<Frequency>(initialData?.frequency || 'daily');
  const [type, setType] = useState<HabitType>(initialData?.type || 'yes-no');
  const [target, setTarget] = useState(initialData?.target || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(COLORS[0]);

  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<any>(null);

  const handleLongPressStart = (cat: Category) => {
    if (cat.id === 'general') return;
    const timer = setTimeout(() => {
      setCategoryToDelete(cat);
    }, 600); // 600ms for long press
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, cat: Category) => {
    if (cat.id === 'general') return;
    e.preventDefault();
    setCategoryToDelete(cat);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      category,
      timeOfDay,
      icon,
      color,
      frequency,
      type,
      target,
      notes,
      startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    });
  };

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      onAddCategory(newCatName.trim(), newCatColor);
      setCategory(newCatName.trim());
      setNewCatName('');
      setShowAddCategory(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-[100] flex flex-col overflow-y-auto">
      <header className="h-nav-height px-4 flex items-center sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <button onClick={onCancel} className="p-2 -ml-2 rounded-full hover:bg-primary/5 text-primary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-primary tracking-tight">{initialData ? 'Edit Habit' : 'New Habit'}</h1>
        <button 
          onClick={handleSubmit}
          className="bg-primary text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          Save
        </button>
      </header>

      <main className="p-6 space-y-10 max-w-xl mx-auto w-full">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-primary tracking-tight">Design Routine</h2>
          <p className="text-gray-500">Every master was once a beginner.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-accent uppercase tracking-widest px-1">Habit Name</label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-gray-400 group-focus-within:text-primary transition-colors">
                <Icons.Pencil size={20} />
              </span>
              <input
                className="w-full bg-white border-0 ring-1 ring-black/5 rounded-2xl px-14 py-5 focus:ring-2 focus:ring-primary shadow-sm transition-all text-gray-800 font-medium"
                placeholder="e.g. Morning Meditation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-accent uppercase tracking-widest px-1">Category</label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="relative group/cat">
                  <button
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    onMouseDown={() => handleLongPressStart(cat)}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    onTouchStart={() => handleLongPressStart(cat)}
                    onTouchEnd={handleLongPressEnd}
                    onContextMenu={(e) => handleContextMenu(e, cat)}
                    className={cn(
                      "w-full py-4 px-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border-2 select-none",
                      category === cat.name 
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-white border-transparent text-gray-400 hover:text-primary"
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </div>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setShowAddCategory(true)}
                className="py-4 px-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border-2 border-dashed border-gray-200 text-gray-400 hover:border-primary hover:text-primary flex items-center justify-center gap-2"
              >
                <PlusCircle size={16} />
                Add New
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-accent uppercase tracking-widest px-1">Time of Day</label>
            <div className="flex gap-2">
              {(['Morning', 'Afternoon', 'Evening'] as TimeOfDay[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeOfDay(t)}
                  className={cn(
                    "flex-1 py-3 rounded-2xl border-2 font-bold text-xs uppercase tracking-widest transition-all",
                    timeOfDay === t ? "bg-primary border-primary text-white shadow-md" : "bg-white border-transparent text-gray-400 hover:text-primary"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-accent uppercase tracking-widest px-1">Appearance</label>
            <div className="flex gap-4 items-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10 transition-transform"
                style={{ backgroundColor: color }}
              >
                {Icons[icon as keyof typeof Icons] ? 
                  (() => {
                    const Icon = (Icons as any)[icon] || Icons.Circle;
                    return <Icon size={32} />;
                  })() : <Icons.Activity size={32} />
                }
              </div>
              <div className="flex-1 flex overflow-x-auto gap-3 py-2 no-scrollbar">
                {AVAILABLE_ICONS.map((i) => {
                  const Icon = (Icons as any)[i];
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIcon(i)}
                      className={cn(
                        "w-12 h-12 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all",
                        icon === i ? "bg-primary border-primary text-white scale-110" : "bg-white border-transparent text-gray-400 hover:text-primary"
                      )}
                    >
                      <Icon size={20} />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar px-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-9 h-9 rounded-full shrink-0 transition-all border-2",
                    color === c ? "border-primary scale-125 shadow-lg" : "border-transparent hover:scale-110"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-black/5">
            <label className="text-[10px] font-bold text-accent uppercase tracking-widest px-1">Goal Structure</label>
            <div className="flex rounded-2xl bg-white ring-1 ring-black/5 p-1.5 w-full gap-1.5 shadow-sm">
              {(['yes-no', 'counter', 'duration'] as HabitType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "flex-1 py-3 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all",
                    type === t ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-primary"
                  )}
                >
                  {t === 'yes-no' ? 'Yes/No' : t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-black/5">
            <label className="text-[10px] font-bold text-accent uppercase tracking-widest px-1">Frequency</label>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as Frequency[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={cn(
                    "flex-1 py-3 rounded-2xl border-2 font-bold text-xs uppercase tracking-widest transition-all",
                    frequency === f ? "bg-primary border-primary text-white shadow-md" : "bg-white border-transparent text-gray-400 hover:text-primary"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8 pb-12 space-y-4">
            <button
              type="submit"
              className="w-full bg-primary text-white py-5 rounded-3xl font-bold text-lg shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {initialData ? 'Update Habit' : 'Initialize Habit'}
            </button>

            {initialData && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(initialData.id)}
                className="w-full bg-red-50 text-red-500 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
              >
                <Trash2 size={18} />
                Delete Habit
              </button>
            )}
          </div>
        </form>
      </main>

      <AnimatePresence>
        {categoryToDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCategoryToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl space-y-8 text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trash2 size={40} className="text-red-500" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">Delete Category?</h3>
                <p className="text-gray-500 text-sm leading-relaxed px-4">
                  Are you sure you want to delete <span className="font-bold text-gray-900">"{categoryToDelete.name}"</span>? 
                  Habits in this category will be moved to <span className="font-bold text-primary">General</span>.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (category === categoryToDelete.name) setCategory('General');
                    onDeleteCategory(categoryToDelete);
                    setCategoryToDelete(null);
                  }}
                  className="w-full py-5 rounded-2xl font-bold text-white bg-red-500 shadow-xl shadow-red-500/20 active:scale-95 transition-all"
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryToDelete(null)}
                  className="w-full py-4 rounded-2xl font-bold text-gray-400 bg-gray-50 active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                  Keep Category
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showAddCategory && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddCategory(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">New Category</h3>
                <button onClick={() => setShowAddCategory(false)} className="p-2 text-gray-400">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category Name</label>
                  <input
                    autoFocus
                    className="w-full bg-surface border-0 ring-1 ring-black/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary shadow-sm transition-all text-gray-800 font-medium"
                    placeholder="e.g. Creative"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Accent Color</label>
                  <div className="flex flex-wrap gap-3">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCatColor(c)}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all border-2",
                          newCatColor === c ? "border-primary scale-110 shadow-md" : "border-transparent"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm text-gray-500 bg-gray-100 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newCatName.trim()}
                  onClick={handleAddCategory}
                  className="flex-2 py-4 px-8 rounded-2xl font-bold text-sm text-white bg-primary shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
