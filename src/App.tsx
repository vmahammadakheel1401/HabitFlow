import { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  setDoc,
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { db, auth, googleProvider } from '@/lib/firebase';
import { Habit, HabitLog, UserProfile, Frequency, HabitType, HabitCategory, TimeOfDay, Category } from '@/types';
import { BottomNav } from '@/components/BottomNav';
import { HabitCard } from '@/components/HabitCard';
import { StatsCard } from '@/components/StatsCard';
import { CalendarView } from '@/components/CalendarView';
import { HabitForm } from '@/components/HabitForm';
import { HabitDetail } from '@/components/HabitDetail';
import { WeeklySummary } from '@/components/WeeklySummary';
import { ChatView } from '@/components/ChatView';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { CheckoutModal } from '@/components/CheckoutModal';
import { SuccessModal } from '@/components/SuccessModal';
import { getTodayStr, cn } from '@/lib/utils';
import { Plus, User as UserIcon, Bell, Moon, Database, Info, LogIn, LogOut, Trophy, Award, Zap, Brain, Heart, Activity, Crown, Star } from 'lucide-react';
import { format, isSunday, startOfWeek, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [skipFlash, setSkipFlash] = useState<string | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [showInsights, setShowInsights] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [appError, setAppError] = useState<string | null>(null);

  const DEFAULT_CATEGORIES: Category[] = useMemo(() => [
    { id: 'general', name: 'General', color: '#666666', isCustom: false },
    { id: 'health', name: 'Health', color: '#386a20', isCustom: false },
    { id: 'mindfulness', name: 'Mindfulness', color: '#65558f', isCustom: false },
    { id: 'productivity', name: 'Productivity', color: '#006874', isCustom: false },
    { id: 'fitness', name: 'Fitness', color: '#8f4c38', isCustom: false },
    { id: 'finance', name: 'Finance', color: '#2c634e', isCustom: false },
  ], []);

  const categories = useMemo(() => {
    const hiddenIds = userProfile?.hiddenCategoryIds || [];
    return [...DEFAULT_CATEGORIES, ...customCategories].filter(cat => !hiddenIds.includes(cat.id));
  }, [DEFAULT_CATEGORIES, customCategories, userProfile?.hiddenCategoryIds]);

  const today = useMemo(() => getTodayStr(), []);
  const selectedHabit = useMemo(() => habits.find(h => h.id === selectedHabitId), [habits, selectedHabitId]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      try {
        if (u) {
          setUser(u);
          setAppError(null);
          
          // Fetch/Initialize Profile
          const profileRef = doc(db, 'profiles', u.uid);
          const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              setUserProfile(data);
              setIsPremium(data.isPremium || false);
            } else {
              const newProfile: UserProfile = {
                uid: u.uid,
                email: u.email || '',
                displayName: u.displayName || 'Guest Explorer',
                photoURL: u.photoURL || null,
                isPremium: false,
              };
              setDoc(profileRef, newProfile).catch(e => console.error("Error creating profile:", e));
              setUserProfile(newProfile);
            }
            setLoading(false);
          }, (err) => {
            console.error("Profile snapshot error:", err);
            setAppError("Unable to sync profile. Check your connection.");
          });

          // Fetch Custom Categories
          const categoriesRef = collection(db, 'categories');
          const qCategories = query(categoriesRef, where('userId', '==', u.uid));
          const unsubscribeCategories = onSnapshot(qCategories, (snapshot) => {
            setCustomCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
          }, (err) => {
            console.error("Categories snapshot error:", err);
          });

          return () => {
            unsubscribeProfile();
            unsubscribeCategories();
          };
        } else {
          try {
            await signInAnonymously(auth);
          } catch (error: any) {
            console.error("Auth error:", error.code);
            setAppError(`Authentication failed: ${error.code}. Please refresh.`);
            setLoading(false);
          }
        }
      } catch (err: any) {
        console.error("Initialization error:", err);
        setAppError("System initialization failed. Please try again later.");
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const updatePremiumStatus = async (plan: 'monthly' | 'yearly') => {
    if (!user) return;
    try {
      const renewalDate = plan === 'monthly' 
        ? format(subDays(new Date(), -30), 'yyyy-MM-dd')
        : format(subDays(new Date(), -365), 'yyyy-MM-dd');

      const profileRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileRef, {
        isPremium: true,
        subscriptionPlan: plan,
        renewalDate
      });
      setShowCheckout(false);
      setShowSuccess(true);
    } catch (err) {
      console.error("Error updating premium status:", err);
      setAppError("Subscription update failed. Please contact support.");
    }
  };

  const addCategory = async (name: string, color: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'categories'), {
        name,
        color,
        userId: user.uid,
        isCustom: true,
        createdAt: Date.now()
      });
    } catch (err) {
      console.error("Error adding category:", err);
      setAppError("Could not save category.");
    }
  };

  const deleteCategory = async (category: Category) => {
    if (!user) return;

    try {
      // 1. Reassign habits to General
      const habitsToUpdate = habits.filter(h => h.category === category.name);
      for (const habit of habitsToUpdate) {
        await updateDoc(doc(db, 'habits', habit.id), { category: 'General' });
      }

      // 2. Delete or Hide
      if (category.isCustom) {
        await deleteDoc(doc(db, 'categories', category.id));
      } else {
        const profileRef = doc(db, 'profiles', user.uid);
        const currentHidden = userProfile?.hiddenCategoryIds || [];
        await updateDoc(profileRef, {
          hiddenCategoryIds: [...currentHidden, category.id]
        });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Weekly Summary Trigger Logic
  useEffect(() => {
    if (habits.length > 0 && isSunday(new Date())) {
      const weekId = startOfWeek(new Date()).toISOString().split('T')[0];
      const hasSeen = localStorage.getItem(`summary_${weekId}`);
      if (!hasSeen) {
        setShowWeeklySummary(true);
        localStorage.setItem(`summary_${weekId}`, 'true');
      }
    }
  }, [habits]);

  const handleGoogleLogin = async () => {
    setAppError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Auth error", error);
      if (error.code === 'auth/unauthorized-domain') {
        setAppError("Login domain unauthorized. Please use the production URL.");
      } else if (error.code === 'auth/admin-restricted-operation') {
        setAppError("Authentication service is being initialized. Please try again.");
      } else {
        setAppError(`Login failed: ${error.message}`);
      }
    }
  };

  const handleLogout = () => signOut(auth);

  useEffect(() => {
    if (!user) return;

    const qHabits = query(
      collection(db, 'habits'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeHabits = onSnapshot(qHabits, (snapshot) => {
      const h: Habit[] = [];
      snapshot.forEach((doc) => {
        h.push({ id: doc.id, ...doc.data() } as Habit);
      });
      setHabits(h);
      setLoading(false);
    }, (error) => {
      console.error("Habits snapshot error:", error);
      setLoading(false);
    });

    const qLogs = query(
      collection(db, 'logs'),
      where('userId', '==', user.uid)
    );

    const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
      const l: HabitLog[] = [];
      snapshot.forEach((doc) => {
        l.push({ id: doc.id, ...doc.data() } as HabitLog);
      });
      setLogs(l);
    });

    return () => {
      unsubscribeHabits();
      unsubscribeLogs();
    };
  }, [user]);

  const toggleHabit = async (habitId: string) => {
    if (!user) return;
    try {
      const logId = `${user.uid}_${habitId}_${today}`;
      const existingLog = logs.find(l => l.id === logId);

      if (existingLog) {
        const newStatus = existingLog.status === 'completed' ? 'none' : 'completed';
        await updateDoc(doc(db, 'logs', logId), { status: newStatus });
      } else {
        await setDoc(doc(db, 'logs', logId), {
          id: logId,
          habitId,
          date: today,
          status: 'completed',
          userId: user.uid
        });
      }
    } catch (err) {
      console.error("Error toggling habit:", err);
      setAppError("Action failed. Syncing...");
    }
  };

  const skipHabit = async (habitId: string) => {
    if (!user) return;
    
    try {
      // Check monthly limit
      const currentMonth = today.substring(0, 7); // YYYY-MM
      const monthlySkips = logs.filter(l => 
        l.habitId === habitId && 
        l.date.startsWith(currentMonth) && 
        l.status === 'skipped'
      ).length;

      if (monthlySkips >= 6) {
        setAppError("Maximum 6 skips per month reached for this habit.");
        return;
      }

      const logId = `${user.uid}_${habitId}_${today}`;
      await setDoc(doc(db, 'logs', logId), {
        id: logId,
        userId: user.uid,
        habitId,
        date: today,
        status: 'skipped',
        updatedAt: new Date().toISOString(),
      });

      setSkipFlash(habitId);
      setTimeout(() => setSkipFlash(null), 1000);
    } catch (err) {
      console.error("Error skipping habit:", err);
      setAppError("Action failed.");
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!user || !confirm('Are you sure you want to permanently remove this habit?')) return;
    try {
      await deleteDoc(doc(db, 'habits', habitId));
      setSelectedHabitId(null);
    } catch (error) {
      console.error("Error deleting habit:", error);
      setAppError("Could not delete habit. Check your permissions.");
    }
  };

  const updateHabit = async (habitId: string, habitData: Partial<Habit>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'habits', habitId), {
        ...habitData,
        updatedAt: new Date().toISOString(),
      });
      setShowAddForm(false);
      setActiveTab('home');
    } catch (error) {
      console.error("Error updating habit:", error);
      setAppError("Failed to update habit.");
    }
  };

  const saveHabit = async (habitData: Partial<Habit>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'habits'), {
        ...habitData,
        userId: user.uid,
        createdAt: Date.now()
      });
      setShowAddForm(false);
      setActiveTab('home');
    } catch (err) {
      console.error("Error saving habit:", err);
      setAppError("Could not save habit. Try again.");
    }
  };

  const analyzeHabit = async (habit: Habit) => {
    setIsAnalyzing(true);
    setAppError(null);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Give me 3 short, practical tips for maintaining a habit called "${habit.name}". The category is ${habit.type}. Keep it encouraging and under 300 characters.` 
        }),
      });
      
      if (!response.ok) {
        throw new Error("AI analysis service failed");
      }
      
      const data = await response.json();
      setAiAdvice(prev => ({ ...prev, [habit.id]: data.text }));
    } catch (error) {
      console.error('AI Analysis failed:', error);
      setAppError("AI Coach is temporarily unavailable.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const dailyProgress = useMemo(() => {
    if (habits.length === 0) return 0;
    const completedCount = logs.filter(l => l.date === today && (l.status === 'completed' || l.status === 'skipped')).length;
    return Math.round((completedCount / habits.length) * 100);
  }, [habits, logs, today]);

  const categoryStats = useMemo(() => {
    return categories.map(cat => {
      const catHabits = habits.filter(h => h.category === cat.name);
      if (catHabits.length === 0) return { id: cat.id, category: cat.name, progress: 0, count: 0, color: cat.color };
      
      const completedLogs = logs.filter(l => 
        catHabits.find(h => h.id === l.habitId) && (l.status === 'completed' || l.status === 'skipped')
      ).length;
      
      const totalPossibleLogs = Math.max(1, catHabits.length * 30);
      const progress = Math.min(100, Math.round((completedLogs / totalPossibleLogs) * 100));
      return { id: cat.id, category: cat.name, progress, count: catHabits.length, color: cat.color };
    }).filter(s => s.count > 0 || s.progress > 0);
  }, [categories, habits, logs]);

  const hallOfFame = useMemo(() => {
    if (habits.length === 0) return null;
    
    const habitsWithStreaks = habits.map(habit => {
      let streak = 0;
      let checkDate = new Date();
      
      for (let i = 0; i < 365; i++) {
        const dateStr = format(checkDate, 'yyyy-MM-dd');
        const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);
        
        if (log && (log.status === 'completed' || log.status === 'skipped')) {
          streak++;
          checkDate = subDays(checkDate, 1);
        } else if (dateStr === today) {
          checkDate = subDays(checkDate, 1);
          continue;
        } else {
          break;
        }
      }
      return { ...habit, streak };
    });

    return habitsWithStreaks.sort((a, b) => b.streak - a.streak)[0];
  }, [habits, logs, today]);

  const habitsByTimeOfDay = useMemo(() => {
    const times: TimeOfDay[] = ['Morning', 'Afternoon', 'Evening'];
    return times.map(time => ({
      time,
      habits: habits.filter(h => h.timeOfDay === time)
    })).filter(group => group.habits.length > 0);
  }, [habits]);

  const insights = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
    const consistentDays = last7Days.filter(date => 
      logs.some(l => l.date === date && (l.status === 'completed' || l.status === 'skipped'))
    ).length;
    const weeklyConsistency = Math.round((consistentDays / 7) * 100);

    const completionCounts = habits.reduce((acc, habit) => {
      const habitCompletions = logs.filter(l => l.habitId === habit.id && (l.status === 'completed' || l.status === 'skipped')).length;
      acc[habit.timeOfDay] = (acc[habit.timeOfDay] || 0) + habitCompletions;
      return acc;
    }, {} as Record<string, number>);
    const peakTime = Object.entries(completionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return { weeklyConsistency, peakTime };
  }, [habits, logs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-outline font-medium">Connecting to Material Pure...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-sm w-full space-y-8">
          <div className="w-20 h-20 bg-primary-container text-primary rounded-[28px] flex items-center justify-center mx-auto shadow-sm">
            <Database size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Material Pure</h1>
            <p className="text-on-surface-variant">Your refined journey to better habits starts here.</p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              <LogIn size={20} />
              Continue with Google
            </button>
            <p className="text-xs text-outline px-4">
              To use guest mode, please ensure "Anonymous Auth" is enabled in your Firebase Console.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-body-md selection:bg-primary-container">
      <AnimatePresence>
        {appError && (
          <div className="fixed top-4 left-4 right-4 z-[250]">
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-red-100 text-red-600 px-5 py-4 rounded-3xl shadow-2xl shadow-red-500/10 flex justify-between items-center backdrop-blur-xl bg-white/90"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                  <Info size={18} />
                </div>
                <span className="text-sm font-bold tracking-tight">{appError}</span>
              </div>
              <button 
                onClick={() => setAppError(null)}
                className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
              >
                <Plus className="rotate-45" size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Home Header */}
      {activeTab === 'home' && (
        <header className="px-4 pt-12 pb-6">
          <div className="flex justify-between items-center mb-1">
            <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.5px]">Good morning</h1>
            
            {isPremium ? (
              <motion.button
                onClick={() => setActiveTab('settings')}
                animate={{ 
                  boxShadow: ["0 0 0px rgba(251,191,36,0)", "0 0 20px rgba(251,191,36,0.4)", "0 0 0px rgba(251,191,36,0)"]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl shadow-lg border border-white/20 relative group"
              >
                <Crown size={16} className="text-white fill-white/20" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Pro User</span>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              </motion.button>
            ) : (
              <motion.button
                onClick={() => setShowSubscription(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 rounded-2xl shadow-lg shadow-green-500/20 border border-white/10 group"
              >
                <Zap size={16} className="text-white fill-white/20" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Upgrade</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              </motion.button>
            )}
          </div>
          <p className="text-outline text-sm font-medium mb-6">{format(new Date(), 'EEEE, MMM d')}</p>
          
            <div className="bg-surface rounded-2xl p-4 flex flex-col gap-3 shadow-sm border border-black/5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Daily Progress</span>
                <span className="text-sm font-bold text-accent">{dailyProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${dailyProgress}%` }} 
                />
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 px-4 pb-[110px] overflow-y-auto",
          activeTab !== 'home' && "pt-12"
        )}>
          {activeTab === 'home' && (
            <div className="flex flex-col gap-6">
              {habits.length === 0 ? (
                <div className="text-center py-20 space-y-6">
                  <div className="w-20 h-20 bg-primary/5 text-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Plus size={40} />
                  </div>
                  <p className="text-gray-400 font-medium">Your journey starts with the first habit.</p>
                  <button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20"
                  >
                    Create Habit
                  </button>
                </div>
              ) : (
                habitsByTimeOfDay.map((group) => (
                  <div key={group.time} className="space-y-3">
                    <div className="flex items-center gap-3 px-1">
                      <div className="h-px flex-1 bg-black/5" />
                      <h3 className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">{group.time} Habits</h3>
                      <div className="h-px flex-1 bg-black/5" />
                    </div>
                    <div className="flex flex-col gap-2">
                      {group.habits.map((habit) => {
                        const log = logs.find(l => l.habitId === habit.id && l.date === today);
                        const currentMonth = today.substring(0, 7);
                        const monthlySkips = logs.filter(l => 
                          l.habitId === habit.id && 
                          l.date.startsWith(currentMonth) && 
                          l.status === 'skipped'
                        ).length;
                        const remainingSkips = 6 - monthlySkips;

                        return (
                          <HabitCard
                            key={habit.id}
                            habit={habit}
                            log={log}
                            remainingSkips={remainingSkips}
                            onToggle={() => toggleHabit(habit.id)}
                            onSkip={() => skipHabit(habit.id)}
                            onClick={() => setSelectedHabitId(habit.id)}
                            onEdit={() => {
                              setEditingHabit(habit);
                              setShowAddForm(true);
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-primary">Statistics</h2>
              
              {/* Hero Action Card */}
              <section className="bg-primary rounded-[32px] p-8 text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <Activity size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">Growth Engine</h3>
                    <p className="text-white/60 text-sm mt-1">Unlock your peak performance potential.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => setActiveTab('chat')}
                      className="flex-1 bg-white text-primary py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                    >
                      <Brain size={18} />
                      Chat with Coach Now
                    </button>
                    <button 
                      onClick={() => setShowInsights(true)}
                      className="flex-1 bg-white/10 backdrop-blur-md text-white border border-white/20 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <Zap size={18} />
                      View Insights
                    </button>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">{format(new Date(), 'MMMM yyyy')}</h3>
                </div>
                <CalendarView logs={logs} habits={habits} currentDate={new Date()} />
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Habit Category Breakdown */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-accent">Category Breakdown</h3>
                    <Activity size={16} className="text-primary" />
                  </div>
                  <div className="space-y-5">
                    {categoryStats.map((stat) => (
                      <div key={stat.id} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-bold text-gray-700">{stat.category}</span>
                          <span className="text-[10px] font-bold text-primary">{stat.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${stat.progress}%`, backgroundColor: stat.color }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <ChatView 
              onOpenSubscription={() => setShowSubscription(true)}
              isPremium={isPremium}
            />
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-primary">Settings</h2>
              
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 space-y-4">
                <h3 className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Profile</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-12 h-12 rounded-2xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl">
                        {user?.displayName?.[0] || 'G'}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-800">{user?.displayName || 'Guest Explorer'}</p>
                      <p className="text-xs text-gray-400">{user?.email || 'Synchronize your progress'}</p>
                    </div>
                  </div>
                  {user?.isAnonymous ? (
                    <button onClick={handleGoogleLogin} className="p-3 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all">
                      <LogIn size={20} />
                    </button>
                  ) : (
                    <button onClick={handleLogout} className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                      <LogOut size={20} />
                    </button>
                  )}
                </div>
              </section>

              {/* Billing & Subscription Section */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Billing & Subscription</h3>
                  {isPremium && (
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Active</span>
                  )}
                </div>

                {isPremium ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-black/5">
                      <span className="text-sm font-medium text-gray-500">Current Plan</span>
                      <span className="text-sm font-bold text-gray-900 uppercase">{userProfile?.subscriptionPlan}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-black/5">
                      <span className="text-sm font-medium text-gray-500">Next Billing</span>
                      <span className="text-sm font-bold text-gray-900">{userProfile?.renewalDate}</span>
                    </div>
                    <button 
                      onClick={() => alert("Simulation: Cancellation flow initiated. Your features will remain active until the end of the billing period.")}
                      className="w-full text-center text-xs font-bold text-red-500 hover:text-red-600 transition-colors pt-2"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Upgrade to unlock AI Coach History, advanced performance insights, and custom habit strategies.
                    </p>
                    <button 
                      onClick={() => setShowSubscription(true)}
                      className="w-full bg-primary text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}
        </main>

        {/* FAB */}
        {activeTab === 'home' && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="fixed right-6 bottom-[104px] size-14 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
          >
            <Plus size={28} />
          </button>
        )}

      {/* Overlays */}
      <WeeklySummary
        isOpen={showWeeklySummary}
        onClose={() => setShowWeeklySummary(false)}
        habits={habits}
        logs={logs}
      />

      {selectedHabit && (
        <HabitDetail
          habit={selectedHabit}
          logs={logs}
          onBack={() => setSelectedHabitId(null)}
          onAnalyze={() => analyzeHabit(selectedHabit)}
          onToggle={() => toggleHabit(selectedHabit.id)}
          onSkip={() => skipHabit(selectedHabit.id)}
          onEdit={() => {
            setEditingHabit(selectedHabit);
            setShowAddForm(true);
          }}
          aiAdvice={aiAdvice[selectedHabit.id]}
          isAnalyzing={isAnalyzing}
          isPremium={isPremium}
          onOpenSubscription={() => setShowSubscription(true)}
        />
      )}

      {showAddForm && (
        <HabitForm 
          onSave={(data) => {
            if (editingHabit) {
              updateHabit(editingHabit.id, data);
            } else {
              saveHabit(data);
            }
            setEditingHabit(null);
            setShowAddForm(false);
          }} 
          onDelete={(id) => {
            deleteHabit(id);
            setEditingHabit(null);
            setShowAddForm(false);
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingHabit(null);
          }} 
          initialData={editingHabit || undefined}
          categories={categories}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
        />
      )}

      <SubscriptionModal 
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
        onUpgrade={(plan) => {
          setSelectedPlan(plan);
          setShowSubscription(false);
          setShowCheckout(true);
        }}
      />

      <CheckoutModal 
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        plan={selectedPlan}
        onSuccess={updatePremiumStatus}
      />

      <SuccessModal 
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      <AnimatePresence>
        {showInsights && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInsights(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary">Performance Insights</h2>
                <button onClick={() => setShowInsights(false)} className="p-2 text-gray-400">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-primary/5 rounded-2xl p-6 space-y-2">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Weekly Consistency</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-primary">{insights.weeklyConsistency}%</span>
                    <span className="text-xs font-bold text-primary/60 mb-1">of last 7 days</span>
                  </div>
                </div>

                <div className="bg-accent/5 rounded-2xl p-6 space-y-2">
                  <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Peak Performance Window</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <Moon size={20} />
                    </div>
                    <span className="text-2xl font-black text-accent">{insights.peakTime}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowInsights(false)}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold active:scale-95 transition-all"
              >
                Close Breakdown
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
