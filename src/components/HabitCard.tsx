import { CheckCircle2, Circle, Pencil, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Habit, HabitLog } from '@/types';
import * as Icons from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  onToggle: () => void;
  onSkip: () => void;
  onClick: () => void;
  onEdit: () => void;
  remainingSkips: number;
}

export function HabitCard({ habit, log, onToggle, onSkip, onClick, onEdit, remainingSkips }: HabitCardProps) {
  const isCompleted = log?.status === 'completed';
  const isSkipped = log?.status === 'skipped';
  
  // Dynamic icon loading
  const IconComponent = (Icons as any)[habit.icon] || Icons.Circle;

  return (
    <div 
      className={cn(
        "floating-card h-[88px] flex items-center px-4 gap-4 cursor-pointer transition-all active:scale-[0.98] mb-1 group",
        isCompleted && "ring-2 ring-primary bg-primary/5",
        isSkipped && "ring-2 ring-amber-400 bg-amber-50"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
        isCompleted ? "bg-primary text-white" : 
        isSkipped ? "bg-amber-400 text-white" : 
        "bg-surface-variant text-primary"
      )}>
        <IconComponent size={24} />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "text-base font-semibold truncate leading-tight mb-0.5",
          (isCompleted || isSkipped) && "text-primary opacity-60 line-through"
        )}>
          {habit.name}
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-bold text-accent uppercase tracking-wider">
            {habit.frequency} streak
          </p>
          {isSkipped && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-md uppercase tracking-widest">
              Skipped
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button 
            disabled={remainingSkips <= 0 || isCompleted || isSkipped}
            onClick={(e) => {
              e.stopPropagation();
              onSkip();
            }}
            title={remainingSkips <= 0 ? `Monthly skip limit reached (0/6 remaining)` : `${remainingSkips}/6 Skips Left`}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isSkipped ? "text-amber-500 bg-amber-100" : "text-gray-400 hover:bg-amber-50 hover:text-amber-500",
              remainingSkips <= 0 && "opacity-20 cursor-not-allowed"
            )}
          >
            <Shield size={18} />
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 rounded-lg hover:bg-primary/5 text-gray-400 hover:text-primary transition-colors"
          >
            <Pencil size={18} />
          </button>
        </div>

        <button 
          className="flex-shrink-0 flex items-center justify-center size-10"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {isCompleted ? (
            <CheckCircle2 size={24} className="text-primary fill-primary/10" />
          ) : isSkipped ? (
            <CheckCircle2 size={24} className="text-amber-400 fill-amber-400/10" />
          ) : (
            <Circle size={24} className="text-outline/40" />
          )}
        </button>
      </div>
    </div>
  );
}
