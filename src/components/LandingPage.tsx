import { useState } from 'react';
import { LandingHero } from './LandingHero';
import { LandingFeatures } from './LandingFeatures';
import { LandingContent } from './LandingContent';
import { LandingFAQ } from './LandingFAQ';
import { LandingFooter } from './LandingFooter';
import { LegalModal, LegalDocType } from './LegalModal';

interface LandingPageProps {
  onAuth: () => void;
}

export function LandingPage({ onAuth }: LandingPageProps) {
  const [legalModal, setLegalModal] = useState<LegalDocType>(null);

  const scrollToFAQ = () => {
    const faqSection = document.getElementById('faq');
    if (faqSection) {
      faqSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      <LandingHero onGetStarted={onAuth} onTryDemo={scrollToFAQ} />
      <LandingFeatures />
      <LandingContent onStartTracking={onAuth} />
      <LandingFAQ />
      <LandingFooter 
        onLaunchApp={onAuth} 
        onOpenLegal={(type) => setLegalModal(type)} 
      />
      
      {legalModal && (
        <LegalModal 
          type={legalModal} 
          onClose={() => setLegalModal(null)} 
        />
      )}
    </div>
  );
}
