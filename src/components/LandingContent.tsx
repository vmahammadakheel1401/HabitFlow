import { motion } from 'motion/react';

export function LandingContent() {
  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Main Heading */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Why Choose an AI-Powered Habit Tracker Over Traditional Apps?
            </h2>
            <div className="w-24 h-1.5 bg-primary mx-auto rounded-full" />
          </div>

          <div className="prose prose-lg max-w-none text-gray-600 space-y-12">
            {/* Subsection 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold text-gray-900">
                The Limitations of Manual Habit Apps
              </h3>
              <p className="leading-relaxed">
                Traditional habit tracking often feels like a chore rather than a catalyst for change. Most legacy apps are little more than digital spreadsheets—basic checklists that require manual input without offering any reciprocal value. The primary issue with these manual systems is their lack of dynamic engagement. When you miss a day, a traditional app simply leaves a gap in your streak, often leading to a "what's the point" mentality that causes users to abandon their goals entirely. 
              </p>
              <p className="leading-relaxed">
                Basic checklists fail to account for the complexities of human behavior. They don't recognize why you might be struggling or provide the necessary friction-reduction to get you back on track. Without personalized feedback or motivational nudges, the burden of consistency falls entirely on your willpower, which is a finite and often unreliable resource.
              </p>
            </motion.div>

            {/* Subsection 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold text-gray-900">
                How AI Habits Drive Long-Term Consistency
              </h3>
              <p className="leading-relaxed">
                This is where an <strong>AI Habit Tracker</strong> like Habit Flow changes the game. By leveraging advanced trend detection and behavioral analysis, our AI doesn't just record your data—it understands it. When the system detects a decline in your routine, it doesn't just send a generic alert; it offers adaptive routine suggestions tailored to your current life circumstances.
              </p>
              <p className="leading-relaxed">
                By analyzing the nuances of your check-in times and completion patterns, Habit Flow identifies your "peak performance" windows. If you consistently skip a morning workout but thrive in the evening, the AI proactively suggests shifting your schedule to align with your natural biological rhythms. This level of intelligent oversight transforms habit tracking from a passive recording activity into an active, consultative partnership that drives genuine, long-term consistency.
              </p>
            </motion.div>

            {/* Subsection 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold text-gray-900">
                Built for Mobile & Web: Seamless Accountability
              </h3>
              <p className="leading-relaxed">
                Consistency requires accessibility. Habit Flow was engineered as a cross-platform solution to ensure you are never more than a tap away from your progress. Whether you're at your desk using the web dashboard to plan your week or using your mobile device for a quick mid-day check-in, your routine analytics stay perfectly synchronized in real-time.
              </p>
              <p className="leading-relaxed">
                This multi-device approach keeps users accountable anytime and anywhere. By integrating smart notifications that bridge the gap between your digital and physical worlds, we ensure that your daily habits remain front-of-mind without becoming intrusive. It's about providing the right support at the right time, across all the devices you use most.
              </p>
            </motion.div>
          </div>

          {/* Final Call to Action Link */}
          <div className="pt-12 text-center">
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Ready to upgrade your routine?</p>
            <button className="text-lg font-bold text-gray-900 hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto">
              Start your AI-powered journey today
              <span className="text-xl">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
