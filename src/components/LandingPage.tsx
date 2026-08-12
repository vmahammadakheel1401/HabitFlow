import { LandingHero } from './LandingHero';
import { LandingFeatures } from './LandingFeatures';
import { LandingContent } from './LandingContent';
import { LandingFAQ } from './LandingFAQ';
import { LandingFooter } from './LandingFooter';

interface LandingPageProps {
  onAuth: () => void;
}

export function LandingPage({ onAuth }: LandingPageProps) {
  const scrollToFAQ = () => {
    const faqSection = document.getElementById('faq');
    if (faqSection) {
      faqSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <LandingHero onGetStarted={onAuth} onTryDemo={scrollToFAQ} />
      <LandingFeatures />
      <LandingContent />
      <LandingFAQ />
      <LandingFooter onLaunchApp={onAuth} />
    </div>
  );
}
