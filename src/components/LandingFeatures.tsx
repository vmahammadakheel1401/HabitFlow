import { motion } from 'motion/react';
import { Brain, Flame, Bell, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function LandingFeatures() {
  const features = [
    {
      title: "AI Habit Insights",
      subtitle: "Your Daily Habit Coach",
      description: "Our Gemini AI acts as your personal daily habit coach, analyzing every check-in to provide hyper-personalized growth strategies.",
      points: [
        "Analyzes check-in patterns automatically",
        "Provides customized recommendations",
        "Identifies roadblocks before they happen"
      ],
      icon: <Brain className="text-primary" size={24} />,
      bgColor: "bg-blue-50"
    },
    {
      title: "Visual Habit Streaks",
      subtitle: "Monitoring Progress",
      description: "Visualize your success with beautiful, interactive habit streaks and routine analytics that turn data into motivation.",
      points: [
        "Clean heatmaps for long-term tracking",
        "Interactive performance charts",
        "30-day consistency score metrics"
      ],
      icon: <Flame className="text-orange-500" size={24} />,
      bgColor: "bg-orange-50"
    },
    {
      title: "Smart Notifications",
      subtitle: "Adaptive Reminders",
      description: "Never miss a beat with smart notifications that learn your schedule and nudge you at the most effective moments.",
      points: [
        "Custom cues that adapt to your day",
        "Intelligent delivery windows",
        "Gentle nudges based on focus levels"
      ],
      icon: <Bell className="text-accent" size={24} />,
      bgColor: "bg-emerald-50"
    },
    {
      title: "Privacy-First Data",
      subtitle: "Secure Routine Analytics",
      description: "Your routine analytics are your business. We prioritize military-grade security to keep your habit logs strictly private.",
      points: [
        "Fully encrypted habit log storage",
        "Strictly private data ownership",
        "No third-party data sharing"
      ],
      icon: <ShieldCheck className="text-indigo-600" size={24} />,
      bgColor: "bg-indigo-50"
    }
  ];

  return (
    <section id="features" className="py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            How our <span className="text-primary">Daily Habit Coach</span> transforms your life
          </h2>
          <p className="text-lg text-gray-600 font-medium">
            Unlock deep <span className="italic font-bold">routine analytics</span> and stay consistent with the smartest toolkit in the industry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-[32px] border border-gray-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all group bg-white"
            >
              <div className="flex items-start gap-6">
                <div className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-primary text-xs font-bold uppercase tracking-widest">{feature.subtitle}</span>
                    <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-3 pt-2">
                    {feature.points.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
