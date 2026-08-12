import { motion } from 'motion/react';
import { Home, Calendar, Settings, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'calendar', label: 'Stats', icon: Calendar },
    { id: 'chat', label: 'Coach', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-surface dark:bg-surface-dim border-t border-surface-variant z-50">
      <div className="flex h-[80px] px-2 pb-3 pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
                isActive ? "text-on-surface" : "text-outline hover:text-on-surface"
              )}
            >
              <div className={cn(
                "flex h-8 w-16 items-center justify-center rounded-full transition-all",
                isActive && "bg-secondary-container"
              )}>
                <Icon size={20} className={cn(isActive && "fill-current")} />
              </div>
              <span className="text-[12px] font-medium leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
