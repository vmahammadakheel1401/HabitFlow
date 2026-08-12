import { Database, Github, Twitter, Linkedin } from 'lucide-react';
import { LegalDocType } from './LegalModal';

interface LandingFooterProps {
  onLaunchApp: () => void;
  onOpenLegal: (type: LegalDocType) => void;
}

export function LandingFooter({ onLaunchApp, onOpenLegal }: LandingFooterProps) {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-gray-800 pb-12">
          {/* Brand Col */}
          <div className="space-y-6 col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Database size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Habit Flow</span>
            </div>
            <p className="text-sm leading-relaxed">
              Empowering your personal growth through intelligent, AI-driven routine mastery.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors"><Twitter size={18} /></a>
              <a href="#" className="hover:text-primary transition-colors"><Github size={18} /></a>
              <a href="#" className="hover:text-primary transition-colors"><Linkedin size={18} /></a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs">Product</h4>
            <ul className="space-y-2 text-sm flex flex-col items-start">
              <li><button onClick={onLaunchApp} className="hover:text-white transition-colors text-left">Launch App</button></li>
              <li><a href="#features" onClick={(e) => handleScrollTo(e, 'features')} className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#faq" onClick={(e) => handleScrollTo(e, 'faq')} className="hover:text-white transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs">Legal</h4>
            <ul className="space-y-2 text-sm flex flex-col items-start">
              <li><button onClick={() => onOpenLegal('privacy')} className="hover:text-white transition-colors text-left">Privacy Policy</button></li>
              <li><button onClick={() => onOpenLegal('terms')} className="hover:text-white transition-colors text-left">Terms of Service</button></li>
              <li><button onClick={() => onOpenLegal('cookies')} className="hover:text-white transition-colors text-left">Cookie Policy</button></li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs">Get Started</h4>
            <button 
              onClick={onLaunchApp}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all w-full md:w-auto"
            >
              Start Tracking Free
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 Habit Flow. Built with Google AI Studio.</p>
          <p>Optimized for Mobile & Web Accountability.</p>
        </div>
      </div>
    </footer>
  );
}
