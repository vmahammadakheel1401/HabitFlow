import { motion, AnimatePresence } from 'motion/react';
import { PartyPopper, Check, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/20 backdrop-blur-xl"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-sm bg-white rounded-[40px] p-10 text-center shadow-2xl overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-8">
              <div className="w-24 h-24 bg-primary text-white rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 transform rotate-12">
                <PartyPopper size={48} />
              </div>

              <div>
                <h2 className="text-3xl font-black text-gray-900 leading-tight">Welcome to Premium! 🎉</h2>
                <p className="text-gray-500 font-medium mt-3">Your Pro features are now instantly unlocked. Time to build your best self.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-2xl">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                    <Check size={14} />
                  </div>
                  <span className="text-sm font-bold text-primary">AI Coach History Unlocked</span>
                </div>
                <div className="flex items-center gap-3 bg-accent/5 p-4 rounded-2xl">
                  <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center">
                    <Check size={14} />
                  </div>
                  <span className="text-sm font-bold text-accent">Advanced Insights Active</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all"
              >
                Let's Go!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
