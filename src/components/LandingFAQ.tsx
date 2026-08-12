import { ChevronDown } from 'lucide-react';

export function LandingFAQ() {
  const faqs = [
    {
      question: "What makes Habit Flow different from traditional habit trackers?",
      answer: "Unlike traditional apps that act as passive checklists, Habit Flow uses Gemini AI to act as an active coach. It analyzes your performance trends, identifies obstacles, and provides adaptive routine suggestions to keep you consistent when willpower alone isn't enough."
    },
    {
      question: "Is this habit tracking web app free to use?",
      answer: "Yes! Habit Flow offers a robust free-to-use version that includes core habit tracking, visual streaks, and basic AI insights. We believe everyone should have access to smart tools for personal growth."
    },
    {
      question: "How does the AI give me personal routine feedback?",
      answer: "Our AI analyzes your check-in history, timing, and completion rates. By identifying patterns—like which days you're most productive or when you typically struggle—it generates hyper-personalized growth strategies and actionable tips tailored specifically to your life."
    },
    {
      question: "Can I access my habit tracker on both desktop and mobile browsers?",
      answer: "Absolutely. Habit Flow is built as a responsive web application, meaning you get a seamless, high-performance experience whether you're at your desk or on the go. Your data syncs instantly across all devices."
    },
    {
      question: "Is my personal tracking data safe?",
      answer: "Data privacy is our top priority. We use secure authentication and encrypted storage to ensure that your habit logs and routine analytics are strictly private and owned by you. We never share your personal data with third parties."
    }
  ];

  // Generate JSON-LD Schema
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section id="faq" className="py-24 bg-white border-t border-gray-100">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 font-medium italic">Everything you need to know about starting your Habit Flow journey.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group border border-gray-100 rounded-3xl bg-gray-50/50 hover:bg-white hover:border-primary/20 transition-all overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none focus:outline-none">
                  <h3 className="text-lg font-bold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-open:rotate-180 transition-transform shadow-sm">
                    <ChevronDown size={18} />
                  </div>
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                  <p className="border-t border-gray-100 pt-4">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-16 p-8 rounded-[32px] bg-primary/5 border border-primary/10 text-center">
            <p className="text-gray-900 font-bold mb-2">Still have questions?</p>
            <p className="text-sm text-gray-600">Our support team is always here to help you master your daily routine.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
