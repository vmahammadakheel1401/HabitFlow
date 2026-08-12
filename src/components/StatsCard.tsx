import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
}

export function StatsCard({ label, value, icon: Icon, variant = 'default', className }: StatsCardProps) {
  return (
    <div className={cn(
      "floating-card p-4 flex flex-col justify-center items-center text-center h-32",
      variant === 'primary' && "bg-primary text-white",
      variant === 'secondary' && "bg-accent text-white",
      className
    )}>
      {Icon && <Icon size={20} className="mb-2 opacity-80" />}
      <span className="text-3xl font-bold">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mt-1">{label}</span>
    </div>
  );
}
