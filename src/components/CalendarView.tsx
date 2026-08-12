import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { HabitLog, Habit } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CalendarViewProps {
  logs: HabitLog[];
  habits?: Habit[];
  currentDate: Date;
}

export function CalendarView({ logs, habits = [], currentDate }: CalendarViewProps) {
  const { paddingDays, days } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    
    // getDay(): 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    const jsDay = firstDayOfMonth.getDay();
    // Monday-start week: Monday (1) -> 0 offset, Sunday (0) -> 6 offset
    const offset = jsDay === 0 ? 6 : jsDay - 1;

    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const intervalDays = eachDayOfInterval({ start, end });

    return {
      paddingDays: offset,
      days: intervalDays
    };
  }, [currentDate]);

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl p-3 shadow-sm border border-black/5">
      <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold">
        {Array.from({ length: paddingDays }).map((_, idx) => (
          <div key={`empty-${idx}`} />
        ))}
        {days.map((day) => {
          const dateStr = formatDate(day);
          
          const dayLogs = logs.filter(l => l.date === dateStr);
          const isFullCompletion = habits.length > 0 && 
            habits.every(h => dayLogs.find(l => l.habitId === h.id && (l.status === 'completed' || l.status === 'skipped')));

          const singleHabitLog = logs.find(l => isSameDay(new Date(l.date), day));
          const isCompleted = singleHabitLog?.status === 'completed';
          const isSkipped = singleHabitLog?.status === 'skipped';
          
          return (
            <div
              key={dateStr}
              className="relative group flex items-center justify-center"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all border relative",
                  !isSameMonth(day, currentDate) && "opacity-15",
                  isFullCompletion 
                    ? "bg-gradient-to-br from-primary via-emerald-600 to-teal-700 border-emerald-400 text-white shadow-md ring-2 ring-emerald-400/50 scale-105 z-10" 
                    : isCompleted 
                      ? "bg-primary border-primary text-white shadow-sm" 
                      : isSkipped
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-background border-transparent text-gray-700 hover:bg-gray-100",
                  isToday(day) && !isCompleted && !isSkipped && !isFullCompletion && "border-primary text-primary font-extrabold"
                )}
              >
                {format(day, 'd')}
                {isFullCompletion && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm">
                    <Check size={8} strokeWidth={3} />
                  </div>
                )}
                {isSkipped && !isFullCompletion && <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
