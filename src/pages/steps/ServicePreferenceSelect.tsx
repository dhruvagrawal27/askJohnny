// components/onboarding/steps/ServicePreferenceSelect.tsx
import React, { useState } from "react";
import { Zap, Star, Check, ArrowRight, ArrowLeft } from "lucide-react";

interface PricingOption {
  id: "starter" | "business-pro";
  title: string;
  price: string;
  period: string;
  minutes: string;
  extraRate: string;
  popular?: boolean;
  features: string[];
  icon: React.ReactNode;
  gradient: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
}

interface PricingPlanSelectProps {
  onDone: (planId: string) => void;
  onBack?: () => void;
}

const options: PricingOption[] = [
  {
    id: "starter",
    title: "Starter",
    price: "$49",
    period: "CAD per month",
    minutes: "150 minutes included",
    extraRate: "$0.40 per extra min",
    icon: <Star className="w-7 h-7" />,
    gradient: "from-[#2D1B69] to-[#695FDA]",
    bgGradient: "from-purple-50 to-indigo-50",
    borderColor: "border-purple-200/60",
    textColor: "text-[#2D1B69]",
    features: [
      "First 7 days FREE",
      "Message taking with custom business questions",
      "Smart spam detection to filter unwanted calls",
      "Up to 10 calls simultaneously",
      "Email and SMS notifications for calls",
      "Call forwarding",
      "Appointment scheduling",
      "Basic multilingual support (English, French)",
      "Call analytics dashboard with insights",
    ],
  },
  {
    id: "business-pro",
    title: "Business PRO",
    price: "$99",
    period: "CAD per month",
    minutes: "300 minutes included",
    extraRate: "$0.35 per extra min",
    popular: true,
    icon: <Zap className="w-7 h-7" />,
    gradient: "from-[#2D1B69] to-[#695FDA]",
    bgGradient: "from-purple-50 to-indigo-50",
    borderColor: "border-purple-200/60",
    textColor: "text-[#2D1B69]",
    features: [
      "First 7 days FREE",
      "Message taking with custom business questions",
      "Smart spam detection to filter unwanted calls",
      "Up to 20 calls simultaneously",
      "Email and SMS notifications for calls",
      "Call forwarding to staff or departments",
      "Appointment Links for scheduling meetings",
      "30+ languages including French & Spanish",
    ],
  },
];

const PricingPlanSelect: React.FC<PricingPlanSelectProps> = ({ onDone, onBack }) => {
  const [selected, setSelected] = useState<string | null>('business-pro');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSelect = (planId: string) => {
    setSelected(planId);
  };

  const handleContinue = () => {
    if (selected) {
      localStorage.setItem("selectedPlan", JSON.stringify(selected));
      setSubmitted(true);
      onDone(selected);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleContinue();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full h-screen flex flex-col px-4 md:px-6 lg:px-8 py-3 overflow-hidden">
      {/* Step Header */}
      <div className="mb-2 w-full flex justify-between items-start gap-4 shrink-0">
        <div className="text-left flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-[9px] font-bold uppercase tracking-wide mb-1">
            Step 02
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-0.5">Choose Your Plan</h2>
          <p className="text-[10px] text-gray-500">Select the plan that best fits your business needs.</p>
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

      <div className="flex-1 min-h-0 flex items-center py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full px-4 mt-4">
          {/* Starter Plan */}
          <div
            onClick={() => handleSelect('starter')}
            className={`relative rounded-2xl cursor-pointer transition-all duration-300 group flex flex-col overflow-hidden ${
              selected === 'starter'
                ? 'shadow-2xl shadow-brand-300/50'
                : 'shadow-sm hover:shadow-xl'
            }`}
          >
            {/* Selection Indicator */}
            {selected === 'starter' && (
              <div className="absolute top-3 right-3 bg-white rounded-full p-0.5 shadow-lg z-10 animate-zoom-in">
                <div className="bg-gradient-to-br from-brand-600 to-brand-500 text-white p-1 rounded-full">
                  <Check size={12} strokeWidth={3} />
                </div>
              </div>
            )}

            {/* Card Content */}
            <div className={`p-4 md:p-5 flex flex-col h-full transition-all duration-300 ${
              selected === 'starter'
                ? 'bg-gradient-to-br from-brand-50 via-purple-50 to-indigo-50 border-[3px] border-brand-500'
                : 'bg-white border border-gray-100 group-hover:border-gray-200'
            } rounded-2xl`}>

              {/* Icon & Badge */}
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  selected === 'starter'
                    ? 'bg-gradient-to-br from-brand-600 to-brand-500 shadow-lg shadow-brand-500/30'
                    : 'bg-gray-50 group-hover:bg-gray-100'
                }`}>
                  <Star className={`w-5 h-5 ${selected === 'starter' ? 'text-white' : 'text-gray-400'}`} />
                </div>
              </div>

              {/* Title & Price */}
              <div className="mb-2">
                <h3 className={`text-lg font-bold mb-1 ${selected === 'starter' ? 'text-brand-700' : 'text-gray-900'}`}>
                  Starter
                </h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-gray-900">$49</span>
                  <span className="text-gray-500 font-medium text-xs">CAD/mo</span>
                </div>
                <p className="text-[10px] text-gray-500 font-medium">150 minutes • $0.40/extra min</p>
              </div>

              {/* Free Trial Badge */}
              <div className="bg-gradient-to-r from-brand-600 to-brand-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg w-fit mb-3 flex items-center gap-1.5 shadow-sm">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span>
                7 Days FREE
              </div>

              {/* Features */}
              <div className="space-y-1.5 flex-1">
                {[
                  "Message taking with custom questions",
                  "Smart spam detection",
                  "Up to 10 calls simultaneously",
                  "Email and SMS notifications",
                  "Call forwarding",
                  "Appointment scheduling",
                  "Basic multilingual (En, Fr)",
                  "Call analytics dashboard"
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selected === 'starter'
                        ? 'bg-brand-100'
                        : 'bg-gray-100'
                    }`}>
                      <Check size={9} className={selected === 'starter' ? 'text-brand-600' : 'text-gray-600'} strokeWidth={2.5} />
                    </div>
                    <span className={`text-[10px] leading-relaxed ${selected === 'starter' ? 'text-gray-700 font-medium' : 'text-gray-600'}`}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Business PRO Plan */}
          <div
            onClick={() => handleSelect('business-pro')}
            className={`relative rounded-2xl cursor-pointer transition-all duration-300 group flex flex-col overflow-hidden ${
              selected === 'business-pro'
                ? 'shadow-2xl shadow-brand-300/50'
                : 'shadow-xl shadow-brand-100/50 hover:shadow-2xl'
            }`}
          >
            {/* Selection Indicator */}
            {selected === 'business-pro' && (
              <div className="absolute top-3 right-3 bg-white rounded-full p-0.5 shadow-lg z-10 animate-zoom-in">
                <div className="bg-gradient-to-br from-brand-600 to-brand-500 text-white p-1 rounded-full">
                  <Check size={12} strokeWidth={3} />
                </div>
              </div>
            )}

            {/* Card Content */}
            <div className={`p-4 md:p-5 flex flex-col h-full transition-all duration-300 ${
              selected === 'business-pro'
                ? 'bg-gradient-to-br from-brand-50 via-purple-50 to-indigo-50 border-[3px] border-brand-500'
                : 'bg-gradient-to-br from-white to-purple-50/30 border-2 border-purple-200'
            } rounded-2xl`}>

              {/* Icon & Most Popular Badge - Inline */}
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  selected === 'business-pro'
                    ? 'bg-gradient-to-br from-brand-600 to-brand-500 shadow-lg shadow-brand-500/30'
                    : 'bg-gradient-to-br from-purple-500 to-purple-400 shadow-md shadow-purple-500/20'
                }`}>
                  <Zap className="w-5 h-5 text-white fill-white" />
                </div>
                <div className="bg-gradient-to-r from-purple-500 via-[#A47CF3] to-purple-400 text-white px-2 py-1 rounded-lg text-[9px] font-bold tracking-wide uppercase shadow-md">
                  ⭐ Most Popular
                </div>
              </div>

              {/* Title & Price */}
              <div className="mb-2">
                <h3 className={`text-lg font-bold mb-1 ${selected === 'business-pro' ? 'text-brand-700' : 'text-purple-700'}`}>
                  Business PRO
                </h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-gray-900">$99</span>
                  <span className="text-gray-500 font-medium text-xs">CAD/mo</span>
                </div>
                <p className="text-[10px] text-gray-500 font-medium">300 minutes • $0.35/extra min</p>
              </div>

              {/* Free Trial Badge */}
              <div className="bg-gradient-to-r from-brand-600 to-brand-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg w-fit mb-3 flex items-center gap-1.5 shadow-sm">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span>
                7 Days FREE
              </div>

              {/* Features */}
              <div className="space-y-1.5 flex-1">
                {[
                  "Message taking with custom questions",
                  "Smart spam detection",
                  "Up to 20 calls simultaneously",
                  "Email and SMS notifications",
                  "Call forwarding to staff/depts",
                  "Appointment Links for scheduling",
                  "30+ languages including Fr & Sp",
                  "Advanced analytics & insights"
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selected === 'business-pro'
                        ? 'bg-brand-100'
                        : 'bg-purple-100'
                    }`}>
                      <Check size={9} className={selected === 'business-pro' ? 'text-brand-600' : 'text-purple-600'} strokeWidth={2.5} />
                    </div>
                    <span className={`text-[10px] font-medium leading-relaxed ${selected === 'business-pro' ? 'text-gray-800' : 'text-gray-700'}`}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      {selected && (
        <div className="pt-3 pb-2 border-t border-gray-100 flex-shrink-0 animate-fade-in-up">
          <div className="max-w-4xl mx-auto px-4">
            <button
              type="button"
              onClick={handleContinue}
              className="w-full btn-primary-custom py-3 font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Continue with {selected === 'starter' ? 'Starter' : 'Business PRO'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default PricingPlanSelect;
