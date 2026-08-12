import { motion } from 'motion/react';
import { Zap, ArrowRight, Play, Brain, Shield, Sparkles } from 'lucide-react';

interface LandingHeroProps {
  onGetStarted: () => void;
  onTryDemo?: () => void;
}

export function LandingHero({ onGetStarted, onTryDemo }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-24 lg:pt-32 lg:pb-40">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-bold tracking-wide uppercase"
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>Introducing Habit Flow</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]"
          >
            Build Better Habits Effortlessly with the Best <span className="text-primary">AI Habit Tracker</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto font-medium"
          >
            Master your <span className="text-gray-900 font-bold underline decoration-accent/30">Smart Daily Routine Builder</span>. Our AI insights analyze your patterns to keep you consistent, productive, and focused on personal growth.
          </motion.h2>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-5 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all group"
            >
              Get Started for Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onTryDemo}
              className="w-full sm:w-auto px-8 py-5 bg-white text-gray-700 border-2 border-gray-100 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-95 transition-all"
            >
              <Play size={20} className="fill-gray-400 text-gray-400" />
              Try Live Demo
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="pt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-gray-100 mt-16"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Brain size={24} />
              </div>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">AI Analysis</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Zap size={24} />
              </div>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Rapid Consistency</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Shield size={24} />
              </div>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Private Data</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
