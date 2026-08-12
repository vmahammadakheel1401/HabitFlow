import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export type LegalDocType = 'privacy' | 'terms' | 'cookies' | null;

interface LegalModalProps {
  type: LegalDocType;
  onClose: () => void;
}

export function LegalModal({ type, onClose }: LegalModalProps) {
  if (!type) return null;

  const content = {
    privacy: {
      title: "Privacy Policy",
      body: (
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p><strong>Last Updated: August 2026</strong></p>
          <p>At Habit Flow, your privacy is our priority. This Privacy Policy explains how we collect, use, and protect your information when you use our AI habit tracking application.</p>
          
          <h3 className="text-gray-900 font-bold text-base mt-6">1. Information We Collect</h3>
          <p>We collect information you provide directly to us when you create an account, log your habits, or interact with our AI Coach. This includes your email address, authentication data, habit titles, and daily check-in logs.</p>
          
          <h3 className="text-gray-900 font-bold text-base mt-6">2. How We Use Your Information</h3>
          <p>Your habit data is used exclusively to provide and improve the Habit Flow service. Specifically, we securely transmit your habit patterns to our AI models (powered by Google Gemini) to generate personalized coaching insights, routine suggestions, and analytics.</p>
          
          <h3 className="text-gray-900 font-bold text-base mt-6">3. Data Security & Sharing</h3>
          <p>We do not sell your personal data to third parties. All user data is encrypted in transit and at rest using military-grade security standards via Google Cloud and Firebase. We do not use your private habit logs for advertising purposes.</p>
          
          <h3 className="text-gray-900 font-bold text-base mt-6">4. Your Rights</h3>
          <p>You have the right to access, modify, or delete your data at any time. You can reset or delete your habit data directly from the Settings menu within the app.</p>
          
          <p className="mt-8 pt-4 border-t border-gray-100">For privacy concerns, please contact us at <a href="mailto:privacy@habitflow.app" className="text-primary hover:underline">privacy@habitflow.app</a>.</p>
        </div>
      )
    },
    terms: {
      title: "Terms of Service",
      body: (
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p><strong>Last Updated: August 2026</strong></p>
          <p>Welcome to Habit Flow. By accessing or using our application, you agree to be bound by these Terms of Service.</p>
          
          <h3 className="text-gray-900 font-bold text-base mt-6">1. Acceptance of Terms</h3>
          <p>By creating an account and using Habit Flow, you accept these terms. If you do not agree with any part of these terms, you must discontinue use of the application.</p>
          
          <h3 className="text-gray-900 font-bold text-base mt-6">2. Description of Service</h3>
          <p>Habit Flow is a personal growth application that utilizes Artificial Intelligence to help users track and analyze their daily routines. The AI Coach provides suggestions based on your data, but these suggestions are for informational purposes only and do not constitute professional medical, psychological, or lifestyle advice.</p>
          
          <h3 className="text-gray-900 font-bold text-base mt-6">3. User Responsibilities</h3>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree not to use the service for any illegal or unauthorized purpose.</p>
          
          <h3 className="text-gray-900 font-bold text-base mt-6">4. Disclaimer of Warranties</h3>
          <p>Habit Flow is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, regarding the availability, accuracy, or reliability of the AI coaching insights or the platform's uptime.</p>
        </div>
      )
    },
    cookies: {
      title: "Cookie Policy",
      body: (
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p><strong>Last Updated: August 2026</strong></p>
          <p>This Cookie Policy explains how Habit Flow uses cookies and similar technologies to recognize you when you visit our application.</p>
          
          <h3 className="text-gray-900 font-bold text-base mt-6">1. What are Cookies?</h3>
          <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide reporting information.</p>
          
          <h3 className="text-gray-900 font-bold text-base mt-6">2. Essential Cookies</h3>
          <p>We only use <strong>strictly necessary cookies</strong> required for the operation of our application. Specifically, we use cookies and local storage to manage your authentication state (keeping you logged in) and to store essential user preferences.</p>
          
          <h3 className="text-gray-900 font-bold text-base mt-6">3. Analytics and Tracking</h3>
          <p>Habit Flow respects your privacy. We do not use third-party tracking cookies, advertising cookies, or invasive analytics tools. Your visit to our landing page and usage of the app remains private.</p>
          
          <h3 className="text-gray-900 font-bold text-base mt-6">4. Managing Cookies</h3>
          <p>You have the right to decide whether to accept or reject cookies. However, because our cookies are strictly necessary to deliver the service (e.g., maintaining your login session), you cannot refuse them without affecting the functionality of the application.</p>
        </div>
      )
    }
  };

  const activeContent = content[type];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        />
        
        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900">{activeContent.title}</h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            {activeContent.body}
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
