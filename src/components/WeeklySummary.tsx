import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Habit, HabitLog } from '@/types';
import { cn } from '@/lib/utils';

interface WeeklySummaryProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  logs: HabitLog[];
}

export function WeeklySummary({ isOpen, onClose, habits, logs }: WeeklySummaryProps) {
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  const weeklyLogs = logs.filter(l => last7Days.includes(l.date));
  const completionRate = habits.length > 0 
    ? Math.round((weeklyLogs.filter(l => l.status === 'completed').length / (habits.length * 7)) * 100)
    : 0;

  const topHabits = habits
    .map(h => {
      const count = weeklyLogs.filter(l => l.habitId === h.id && l.status === 'completed').length;
      return { ...h, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl overflow-hidden border border-black/5"
          >
            <div className="absolute top-0 right-0 p-4">
              <button onClick={onClose} className="p-2 rounded-full hover:bg-background transition-colors text-primary">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20">
                <Trophy size={40} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Weekly Summary</h2>
                <p className="text-gray-500 font-medium mt-1">Consistency is the key to mastery</p>
              </div>

              <div className="w-full grid grid-cols-1 gap-4">
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/10">
                    <TrendingUp size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-60">Consistency</p>
                    <p className="text-2xl font-bold text-gray-900">{completionRate}% Score</p>
                  </div>
                </div>

                <div className="bg-background rounded-2xl p-5 space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-accent text-left">Top Performers</h3>
                  {topHabits.map((h, i) => (
                    <div key={h.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-lg">✨</div>
                        <span className="font-bold text-gray-800">{h.name}</span>
                      </div>
                      <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/5 rounded-lg">{h.count}/7 days</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all mt-2"
              >
                Continue Journey
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
