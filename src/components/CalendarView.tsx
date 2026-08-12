import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, subDays } from 'date-fns';
import { HabitLog, Habit } from '@/types';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  logs: HabitLog[];
  habits?: Habit[];
  currentDate: Date;
}

export function CalendarView({ logs, habits = [], currentDate }: CalendarViewProps) {
  const days = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center text-sm font-bold">
        {days.map((day, idx) => {
          const dateStr = day.toISOString().split('T')[0];
          
          // Logic for all-habit completion highlight (if habits are passed)
          const dayLogs = logs.filter(l => l.date === dateStr);
          const isFullCompletion = habits.length > 0 && 
            habits.every(h => dayLogs.find(l => l.habitId === h.id && (l.status === 'completed' || l.status === 'skipped')));

          const singleHabitLog = logs.find(l => isSameDay(new Date(l.date), day));
          const isCompleted = singleHabitLog?.status === 'completed';
          const isSkipped = singleHabitLog?.status === 'skipped';
          
          // Streak connection logic (visual line between consecutive completed days)
          const prevDay = subDays(day, 1);
          const prevDayLog = logs.find(l => isSameDay(new Date(l.date), prevDay));
          const hasPrevStreak = (isCompleted || isSkipped) && 
            (prevDayLog?.status === 'completed' || prevDayLog?.status === 'skipped') &&
            day.getDay() !== 1; // Don't connect across rows (Monday is index 1 or 0 depending on locale, here we assume start of week)

          return (
            <div
              key={day.toISOString()}
              className="relative group"
            >
              {hasPrevStreak && (
                <div className="absolute top-1/2 -left-3 right-1/2 h-1 bg-primary/30 -translate-y-1/2 z-0" />
              )}
              <div
                className={cn(
                  "relative z-10 aspect-square flex flex-col items-center justify-center rounded-xl transition-all border-2",
                  !isSameMonth(day, currentDate) && "opacity-10",
                  isFullCompletion 
                    ? "bg-accent border-accent text-white shadow-lg shadow-accent/20 scale-105" 
                    : isCompleted 
                      ? "bg-primary border-primary text-white shadow-md shadow-primary/20" 
                      : isSkipped
                        ? "bg-amber-50 border-amber-200 text-amber-700 animate-pulse"
                        : "bg-background border-transparent text-gray-800",
                  isToday(day) && !isCompleted && !isSkipped && !isFullCompletion && "border-primary text-primary"
                )}
              >
                {format(day, 'd')}
                {isSkipped && <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full border border-white" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
