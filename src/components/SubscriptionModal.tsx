import { useState } from 'react';
import { X, Check, Zap, Star, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: 'monthly' | 'yearly') => void;
}

export function SubscriptionModal({ isOpen, onClose, onUpgrade }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
                <Crown size={40} />
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Unlock AI Coach</h2>
                <p className="text-gray-500 font-medium mt-2">Elevate your growth with personalized AI strategies</p>
              </div>

              <div className="space-y-4 text-left py-4">
                {[
                  { icon: Zap, text: 'Unlimited AI coaching sessions' },
                  { icon: Star, text: 'Full chat history & pattern analysis' },
                  { icon: Star, text: 'Advanced habit formation strategies' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                      <item.icon size={16} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={() => setSelectedPlan('monthly')}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all group",
                    selectedPlan === 'monthly' ? "border-primary bg-primary/5 shadow-sm" : "border-gray-100 hover:border-primary/50"
                  )}
                >
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest", selectedPlan === 'monthly' ? "text-primary" : "text-gray-400")}>Monthly</span>
                  <span className="text-xl font-bold text-gray-900">₹99</span>
                </button>
                <button 
                  onClick={() => setSelectedPlan('yearly')}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all",
                    selectedPlan === 'yearly' ? "border-primary bg-primary/5 shadow-sm" : "border-gray-100 hover:border-primary/50"
                  )}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap">
                    SAVE 83%
                  </div>
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest", selectedPlan === 'yearly' ? "text-primary" : "text-gray-400")}>Yearly</span>
                  <span className="text-xl font-bold text-gray-900">₹199</span>
                </button>
              </div>

              <button
                onClick={() => onUpgrade(selectedPlan)}
                className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all mt-4"
              >
                Upgrade Now
              </button>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Cancel anytime. Secure checkout.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

