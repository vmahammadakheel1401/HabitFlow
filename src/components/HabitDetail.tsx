import { useState } from 'react';
import { ArrowLeft, Pencil, Flame, Target, Calendar as CalendarIcon, Lightbulb, Shield } from 'lucide-react';
import { Habit, HabitLog } from '@/types';
import { StatsCard } from './StatsCard';
import { CalendarView } from './CalendarView';

interface HabitDetailProps {
  habit: Habit;
  logs: HabitLog[];
  onBack: () => void;
  onAnalyze: () => void;
  onToggle: () => void;
  onSkip: () => void;
  onEdit: () => void;
  aiAdvice?: string;
  isAnalyzing?: boolean;
  isPremium?: boolean;
  onOpenSubscription?: () => void;
}

export function HabitDetail({ 
  habit, 
  logs, 
  onBack, 
  onAnalyze, 
  onToggle, 
  onSkip, 
  onEdit, 
  aiAdvice, 
  isAnalyzing,
  isPremium,
  onOpenSubscription
}: HabitDetailProps) {
  const habitLogs = logs.filter(l => l.habitId === habit.id);
  const completionRate = Math.round((habitLogs.filter(l => l.status === 'completed' || l.status === 'skipped').length / 30) * 100) || 0;

  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthlySkips = habitLogs.filter(l => 
    l.date.startsWith(currentMonth) && 
    l.status === 'skipped'
  ).length;
  const remainingSkips = 6 - monthlySkips;

  return (
    <div className="fixed inset-0 bg-background z-[110] flex flex-col overflow-y-auto">
      <header className="h-nav-height px-4 flex items-center sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-primary/5 text-primary transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-primary tracking-tight">Details</h1>
        <div className="flex items-center">
          <button 
            onClick={onEdit}
            className="p-2 rounded-full hover:bg-primary/5 text-primary"
          >
            <Pencil size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 mt-8 space-y-8 w-full">
        <section className="flex flex-col items-center justify-center gap-4 text-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{habit.name}</h2>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed max-w-xs mx-auto">{habit.notes || 'A journey of a thousand miles begins with a single step.'}</p>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-1 shadow-sm border border-black/5">
            <span className="text-2xl font-bold text-primary">12</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Streak</span>
          </div>
          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-1 shadow-sm border border-black/5">
            <span className="text-2xl font-bold text-accent">45</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Best</span>
          </div>
          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-1 shadow-sm border border-black/5">
            <span className="text-2xl font-bold text-primary">{completionRate}%</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Score</span>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800">History</h3>
            <div className="flex gap-2">
              <button 
                onClick={onToggle}
                className="text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-4 py-2 rounded-xl shadow-md"
              >
                Toggle Today
              </button>
              <button 
                onClick={onSkip}
                disabled={remainingSkips <= 0}
                className="text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-xl disabled:opacity-50 flex items-center gap-2"
              >
                <Shield size={14} />
                Skip ({remainingSkips} left)
              </button>
            </div>
          </div>
          <CalendarView logs={habitLogs} currentDate={new Date()} />
          {remainingSkips <= 2 && remainingSkips > 0 && (
            <p className="text-[10px] font-bold text-amber-600 text-center animate-pulse">
              ⚠️ Only {remainingSkips} streak skips left this month!
            </p>
          )}
        </section>

        <section className="bg-primary rounded-3xl p-8 space-y-4 shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-3 relative z-10">
            <Lightbulb className="text-accent" />
            <h3 className="font-bold text-white">Coach Insights</h3>
          </div>
          <p className="text-white/80 text-sm leading-relaxed relative z-10">
            {isPremium 
              ? (aiAdvice || "Ready for your personal growth strategy? Let Gemini analyze your progress.")
              : "Upgrade to Pro to unlock personalized growth strategies and habit analysis from your AI Coach."
            }
          </p>
          <button 
            onClick={() => {
              if (isPremium) {
                onAnalyze();
              } else {
                onOpenSubscription?.();
              }
            }}
            disabled={isAnalyzing}
            className="w-full bg-accent text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-accent/20 transition-all active:scale-95 disabled:opacity-50 relative z-10"
          >
            {isAnalyzing ? 'Analyzing Patterns...' : 'Get Personalized Advice'}
          </button>
        </section>

        <div className="h-32" />
      </main>
    </div>
  );
}
