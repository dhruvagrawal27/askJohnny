// components/onboarding/steps/BusinessFAQ.tsx
import React, { useState } from "react";
import { Store, ArrowLeft } from 'lucide-react';

interface Category {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  questions: string[];
  gradient: string;
  iconColor: string;
}

interface BusinessFAQProps {
  onDone: (faqData: { category: string; answers: string[] }) => void;
  onBack?: () => void;
}

const categories: Category[] = [
  {
    id: "restaurants",
    label: "Restaurants & Food Service",
    description: "Dining, cafes, bars, and food services",
    gradient: "from-orange-50 to-red-50",
    iconColor: "text-orange-600",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 3v6a1 1 0 001 1h3v10a1 1 0 102 0V3m7 0v6a1 1 0 001 1h1a1 1 0 001-1V3"
        />
      </svg>
    ),
    questions: [
      "Is your restaurant vegetarian, non-vegetarian, or both? What cuisines do you specialize in?",
      "Do you offer specials like discounts, live music, big screen, outdoor seating, or happy hours?",
      "What type of establishment are you (cafe, casual, fine dining, bar)? Do you serve alcohol?",
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare & Medical",
    description: "Clinics, dental, urgent care, specialties",
    gradient: "from-blue-50 to-cyan-50",
    iconColor: "text-blue-600",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-3-3v6M5.5 21h13a2.5 2.5 0 002.5-2.5V8.5A2.5 2.5 0 0018.5 6h-13A2.5 2.5 0 003 8.5v10A2.5 2.5 0 005.5 21z"
        />
      </svg>
    ),
    questions: [
      "What type of practice (general, dental, specialty, urgent care) and primary services?",
      "Do you accept insurance, offer payment plans, and what are after-hours procedures?",
      "Do you need confirmations, prescription refills, or telehealth support?",
    ],
  },
  {
    id: "legal",
    label: "Legal & Law Firms",
    description: "Client intake, scheduling, confidential calls",
    gradient: "from-slate-50 to-gray-50",
    iconColor: "text-slate-600",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    questions: [
      "What areas of law (injury, family, criminal, corporate)? Any emergency cases?",
      "Do you offer free consults, payment plans, or contingency fees?",
      "What is your intake process? Need document collection or case management support?",
    ],
  },
  {
    id: "real_estate",
    label: "Real Estate",
    description: "Leads, showings, buyer/seller inquiries",
    gradient: "from-green-50 to-emerald-50",
    iconColor: "text-green-600",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"
        />
      </svg>
    ),
    questions: [
      "Residential, commercial, or rentals? What areas do you serve?",
      "Services: buying, selling, property management, investments?",
      "Need lead qualification, showings, or follow-ups?",
    ],
  },
  {
    id: "automotive",
    label: "Automotive Services",
    description: "Repair shops and dealerships",
    gradient: "from-yellow-50 to-amber-50",
    iconColor: "text-yellow-600",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    ),
    questions: [
      "What services (repairs, maintenance, inspections, sales)? Specialize in types/brands?",
      "Do you offer emergency services, towing, rentals, or warranty work?",
      "Typical appointment duration? Provide estimates or parts ordering?",
    ],
  },
  {
    id: "fitness",
    label: "Fitness & Wellness",
    description: "Gyms, yoga studios, personal training",
    gradient: "from-pink-50 to-rose-50",
    iconColor: "text-pink-600",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    questions: [
      "What type (gym, yoga, PT, dance) and what classes/services?",
      "Membership packages, PT, groups, or programs (seniors/beginners)?",
      "Peak hours, cancellation policies, equipment rentals or nutrition counseling?",
    ],
  },
  {
    id: "others",
    label: "Other Business",
    description: "Retail, consulting, services, etc.",
    gradient: "from-purple-50 to-indigo-50",
    iconColor: "text-purple-600",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v12m6-6H6"
        />
      </svg>
    ),
    questions: [
      "What type of business and primary products/services customers ask about?",
      "Most popular products/services and pricing ranges? Any packages or promotions?",
      "What info do callers usually want (availability, delivery, rates, service areas, fees, booking)?",
    ],
  },
];

const BusinessFAQ: React.FC<BusinessFAQProps> = ({ onDone, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
    setAnswers(Array(cat.questions.length).fill(""));
    setSubmitted(false);
  };

  const handleAnswerChange = (idx: number, value: string) => {
    setAnswers((prev) => {
      const arr = [...prev];
      arr[idx] = value;
      return arr;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    const faqData = {
      category: selectedCategory.id,
      answers,
    };

    // Save to localStorage
    localStorage.setItem("businessFAQ", JSON.stringify(faqData));
    setSubmitted(true);

    setTimeout(() => {
      onDone(faqData);
    }, 600);
  };

  // Category selection view
  if (!selectedCategory) {
    return (
      <div className="w-full h-full flex flex-col px-6 md:px-8 lg:px-10 py-4">
        {/* Step Header */}
        <div className="mb-3 w-full flex justify-between items-start gap-4 shrink-0">
          <div className="text-left flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-[9px] font-bold uppercase tracking-wide mb-2">
              Step 03
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1.5">Setup AI Knowledge</h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">Select your industry to load relevant AI behaviors.</p>
          </div>

          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center flex-shrink-0"
              title="Go back"
            >
              <ArrowLeft size={18} className="text-gray-600" />
            </button>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategorySelect(cat)}
                className="relative p-4 rounded-xl border border-gray-100 hover:border-brand-200 cursor-pointer bg-white group flex flex-col gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-brand-900/5 hover:-translate-y-0.5 h-full"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
                  <Store size={20} strokeWidth={1.5} />
                </div>
                <div className="relative z-10 mt-auto">
                  <h3 className="text-xs font-bold text-gray-900 mb-0.5">{cat.label}</h3>
                  <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Questions view
  return (
    <div className="w-full h-full flex flex-col px-6 md:px-8 lg:px-10 py-4">
      {/* Step Header */}
      <div className="mb-3 w-full flex justify-between items-start gap-4 shrink-0">
        <div className="text-left flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-[9px] font-bold uppercase tracking-wide mb-2">
            Step 03
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1.5">Setup AI Knowledge</h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">Answer a few questions to help the AI sound like you.</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-2xl w-full mx-auto">
          <div className="flex items-center gap-3 mb-3 p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
              <Store size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{selectedCategory.label}</h3>
              <p className="text-[10px] text-gray-500">Configuration Mode</p>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="ml-auto text-[10px] font-bold text-brand-600 hover:bg-brand-50 px-2.5 py-1 rounded-lg transition-colors"
            >
              Change Industry
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5 pb-6">
              {selectedCategory.questions.map((q, idx) => (
                <div key={idx} className="bg-white group">
                  <label className="block text-xs font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-[10px]">{idx + 1}</div>
                    {q}
                  </label>
                  <div className="relative">
                    <textarea
                      value={answers[idx]}
                      onChange={(e) => handleAnswerChange(idx, e.target.value)}
                      placeholder="e.g. We specialize in..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-100 focus:border-brand-500 focus:bg-white outline-none transition-all text-sm min-h-[80px] resize-none shadow-inner placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-start pt-2">
              <button
                type="submit"
                className="btn-primary-custom px-6 py-3 font-bold text-sm shadow-lg shadow-brand-500/30 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 rounded-xl"
                disabled={submitted || answers.some((a) => !a.trim())}
              >
                Continue to Signup <ArrowLeft size={14} className="rotate-180" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessFAQ;
