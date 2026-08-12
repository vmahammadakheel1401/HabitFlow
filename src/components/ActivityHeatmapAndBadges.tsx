import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Habit, HabitLog } from '@/types';
import { formatDate } from '@/lib/utils';
import { subDays, format } from 'date-fns';
import { Award, Lock, Flame, Zap, Trophy, CheckCircle2 } from 'lucide-react';

interface ActivityHeatmapProps {
  habits: Habit[];
  logs: HabitLog[];
}

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  isUnlocked: (habits: Habit[], logs: HabitLog[], streak: number) => boolean;
  getProgress: (habits: Habit[], logs: HabitLog[], streak: number) => { current: number; total: number };
}

export function ActivityHeatmapAndBadges({ habits, logs }: ActivityHeatmapProps) {
  const [selectedDay, setSelectedDay] = useState<{ dateStr: string; label: string; completedCount: number; totalScheduled: number } | null>(null);

  // 30-Day Activity Heatmap Data
  const heatmapDays = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = subDays(new Date(), 29 - i);
      const dateStr = formatDate(d);

      const activeHabitsOnDay = habits.filter(h => {
        const createdDateStr = format(new Date(h.createdAt || Date.now()), 'yyyy-MM-dd');
        return createdDateStr <= dateStr;
      });
      const totalScheduled = activeHabitsOnDay.length;

      const dayLogs = logs.filter(l => l.date === dateStr && (l.status === 'completed' || l.status === 'skipped'));
      const completedCount = dayLogs.filter(l => activeHabitsOnDay.some(h => h.id === l.habitId)).length;

      let intensity = 0; // 0: 0%, 1: 1-49%, 2: 50-99%, 3: 100%
      if (totalScheduled > 0) {
        const ratio = completedCount / totalScheduled;
        if (ratio >= 1) intensity = 3;
        else if (ratio >= 0.5) intensity = 2;
        else if (ratio > 0) intensity = 1;
      }

      return {
        dateStr,
        label: format(d, 'MMM d, yyyy'),
        shortLabel: format(d, 'MMM d'),
        completedCount,
        totalScheduled,
        intensity
      };
    });
  }, [habits, logs]);

  // Default selectedDay to today or show on hover/tap
  const activeSelectedDay = selectedDay || heatmapDays[heatmapDays.length - 1];

  // Calculate current streak for badges
  const currentStreak = useMemo(() => {
    let streak = 0;
    let d = new Date();
    while (true) {
      const dateStr = formatDate(d);
      const activeHabits = habits.filter(h => format(new Date(h.createdAt || Date.now()), 'yyyy-MM-dd') <= dateStr);
      if (activeHabits.length === 0) break;
      const dayLogs = logs.filter(l => l.date === dateStr && l.status === 'completed');
      const allDone = activeHabits.every(h => dayLogs.some(l => l.habitId === h.id));
      if (allDone) {
        streak++;
        d = subDays(d, 1);
      } else {
        if (dateStr === formatDate(new Date())) {
          // Allow today to be incomplete without breaking streak
          d = subDays(d, 1);
          continue;
        }
        break;
      }
    }
    return streak;
  }, [habits, logs]);

  const totalCompletions = logs.filter(l => l.status === 'completed').length;

  const sortedBadges = useMemo(() => {
    const rawBadges: Badge[] = [
      {
        id: 'streak_7',
        title: '7-Day Streak',
        description: 'Complete all habits for 7 days straight',
        icon: Flame,
        color: 'from-amber-500 to-orange-600',
        isUnlocked: (_, __, streak) => streak >= 7,
        getProgress: (_, __, streak) => ({ current: Math.min(7, streak), total: 7 })
      },
      {
        id: 'habits_10',
        title: 'Habit Master',
        description: 'Log 10 total habit completions',
        icon: Zap,
        color: 'from-blue-500 to-indigo-600',
        isUnlocked: () => totalCompletions >= 10,
        getProgress: () => ({ current: Math.min(10, totalCompletions), total: 10 })
      },
      {
        id: 'first_perfect',
        title: 'Perfect Day',
        description: 'Complete 100% of your habits in a day',
        icon: Trophy,
        color: 'from-emerald-500 to-teal-600',
        isUnlocked: () => heatmapDays.some(d => d.totalScheduled > 0 && d.completedCount >= d.totalScheduled),
        getProgress: () => {
          const hasPerfect = heatmapDays.some(d => d.totalScheduled > 0 && d.completedCount >= d.totalScheduled);
          return { current: hasPerfect ? 1 : 0, total: 1 };
        }
      },
      {
        id: 'habit_creator',
        title: 'Routine Architect',
        description: 'Create at least 3 active habits',
        icon: Award,
        color: 'from-purple-500 to-pink-600',
        isUnlocked: (h) => h.length >= 3,
        getProgress: (h) => ({ current: Math.min(3, h.length), total: 3 })
      }
    ];

    return rawBadges.map(b => {
      const unlocked = b.isUnlocked(habits, logs, currentStreak);
      const prog = b.getProgress(habits, logs, currentStreak);
      const percentage = (prog.current / prog.total) * 100;
      return { ...b, unlocked, prog, percentage };
    }).sort((a, b) => {
      // Unlocked first
      if (a.unlocked && !b.unlocked) return -1;
      if (!a.unlocked && b.unlocked) return 1;
      
      // In-progress next (by percentage)
      if (!a.unlocked && !b.unlocked) {
        return b.percentage - a.percentage;
      }
      
      return 0;
    });
  }, [habits, logs, currentStreak, totalCompletions, heatmapDays]);

  const heatmapHeaders = useMemo(() => {
    // Show months/dates at intervals
    const headers = [];
    for (let i = 0; i < heatmapDays.length; i += 7) {
      headers.push({ index: i, label: heatmapDays[i].shortLabel });
    }
    // Ensure "Today" or end is marked
    if (heatmapDays.length > 0) {
      headers[headers.length - 1] = { index: heatmapDays.length - 1, label: 'Today' };
    }
    return headers;
  }, [heatmapDays]);

  return (
    <div className="space-y-4">
      {/* 30-Day Activity Heatmap */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-accent">30-Day Activity Heatmap</h3>
            <p className="text-xs text-gray-400 mt-0.5">Tap or hover any day to view habit completions</p>
          </div>
          <Flame size={16} className="text-primary" />
        </div>

        <div className="relative pt-6">
          {/* Column headers (dates) */}
          <div className="absolute top-0 left-8 right-0 flex justify-between px-1">
            {heatmapHeaders.map((header, idx) => (
              <span key={idx} className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                {header.label}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Day labels (left) */}
            <div className="flex flex-col justify-around text-[9px] font-bold text-gray-400 uppercase w-6 pt-1">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            <div className="flex-1 grid grid-cols-10 gap-2">
              {heatmapDays.map((day, idx) => {
                const isSelected = (selectedDay?.dateStr || heatmapDays[heatmapDays.length - 1].dateStr) === day.dateStr;
                let bgClass = "bg-gray-100 hover:bg-gray-200 border-transparent";
                if (day.intensity === 1) bgClass = "bg-primary/30 border-primary/20";
                else if (day.intensity === 2) bgClass = "bg-primary/70 border-primary/40";
                else if (day.intensity === 3) bgClass = "bg-primary border-primary shadow-sm shadow-primary/30";

                return (
                  <div key={idx} className="relative group">
                    <button
                      onMouseEnter={() => setSelectedDay(day)}
                      onClick={() => setSelectedDay(day)}
                      className={`w-full aspect-square rounded-xl transition-all border ${bgClass} ${isSelected ? 'ring-2 ring-accent scale-105' : ''}`}
                    />
                    {/* Floating Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 shadow-xl">
                      <p className="font-bold">{day.label}</p>
                      <p className="text-gray-300">{day.completedCount} / {day.totalScheduled} habits</p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-3 bg-primary/[0.04] rounded-2xl border border-primary/10 flex items-center justify-between text-xs animate-in fade-in duration-200">
          <span className="font-bold text-gray-800">{activeSelectedDay.label}</span>
          <span className="font-semibold text-primary">
            {activeSelectedDay.completedCount} of {activeSelectedDay.totalScheduled} habits completed
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 pt-1">
          <span>Timeline intensity</span>
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded bg-gray-100" />
              <div className="w-3 h-3 rounded bg-primary/30" />
              <div className="w-3 h-3 rounded bg-primary/70" />
              <div className="w-3 h-3 rounded bg-primary" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Gamified Achievement Badges */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-accent">Unlocked Badges</h3>
          <Trophy size={16} className="text-primary" />
        </div>

        <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide gap-3 pb-2">
          {sortedBadges.map((badge) => {
            const unlocked = badge.unlocked;
            const progress = badge.prog;
            const IconComponent = badge.icon;

            return (
              <div
                key={badge.id}
                className={`w-40 flex-shrink-0 p-4 rounded-2xl border transition-all flex flex-col items-center text-center relative overflow-hidden group ${
                  unlocked 
                    ? 'bg-gradient-to-br from-white via-primary/[0.02] to-white border-primary/20 shadow-md shadow-primary/5 ring-2 ring-primary/20' 
                    : 'bg-gray-50 border-black/5 opacity-70'
                }`}
              >
                {unlocked && (
                  <div className="absolute top-0 right-0 p-1">
                    <div className="bg-primary/10 text-primary p-0.5 rounded-bl-lg">
                      <Award size={10} />
                    </div>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md mb-3 ${unlocked ? `bg-gradient-to-tr ${badge.color} shadow-lg shadow-primary/20` : 'bg-gray-300'}`}>
                  {unlocked ? <IconComponent size={24} /> : <Lock size={20} className="text-gray-500" />}
                </div>

                <h4 className="font-bold text-gray-900 text-xs mb-1 truncate w-full">{badge.title}</h4>
                <p className="text-[10px] text-gray-500 leading-tight mb-3 line-clamp-2">{badge.description}</p>

                {unlocked ? (
                  <div className="mt-auto px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 ring-1 ring-emerald-200">
                    <CheckCircle2 size={10} /> Unlocked
                  </div>
                ) : (
                  <div className="mt-auto w-full space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-gray-400">
                      <span>Progress</span>
                      <span>{progress.current}/{progress.total}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-400 rounded-full" 
                        style={{ width: `${Math.min(100, (progress.current / progress.total) * 100)}%` }} 
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
