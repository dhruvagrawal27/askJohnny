// components/onboarding/steps/PricingPlanSelect.tsx
import React, { useState } from "react";
import { Zap, Crown, Check } from "lucide-react";

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
}

const options: PricingOption[] = [
  {
    id: "starter",
    title: "Starter",
    price: "$49",
    period: "CAD per month",
    minutes: "150 minutes included",
    extraRate: "$0.40 per extra min",
    icon: <Zap className="w-7 h-7" />,
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
    icon: <Crown className="w-7 h-7" />,
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

const PricingPlanSelect: React.FC<PricingPlanSelectProps> = ({ onDone }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSelect = (planId: string) => {
    setSelected(planId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    // Save to localStorage for backup
    localStorage.setItem("selectedPlan", JSON.stringify(selected));
    setSubmitted(true);

    // Small delay for user feedback, then proceed
    setTimeout(() => {
      onDone(selected);
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold text-slate-800 mb-4 text-center">
        Choose Your Plan
      </h2>

      <p className="text-slate-600 mb-8 text-center">
        Select the plan that best fits your business needs
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 max-w-5xl mx-auto">
        {options.map((plan) => (
          <div key={plan.id} className="relative">
            {/* Popular badge */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <span className="bg-gradient-to-r from-[#2D1B69] to-[#695FDA] text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <button
              type="button"
              className={`w-full flex flex-col border ${
                plan.borderColor
              } rounded-xl p-6 transition-all duration-200 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#2D1B69]/40 bg-gradient-to-br ${
                plan.bgGradient
              } ${
                selected === plan.id
                  ? "ring-2 ring-[#2D1B69] shadow-lg transform scale-105"
                  : "hover:scale-102"
              } ${plan.popular ? "ring-2 ring-[#695FDA]/30" : ""}`}
              onClick={() => handleSelect(plan.id)}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <span className={`mb-3 ${plan.textColor} block`}>
                  {plan.icon}
                </span>
                <h3 className="font-bold text-xl mb-2 text-slate-800">
                  {plan.title}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-[#2D1B69]">
                    {plan.price}
                  </span>
                  <span className="text-slate-600 ml-2">{plan.period}</span>
                </div>
                <div className="text-center mb-2">
                  <span className="font-semibold text-[#2D1B69]">
                    {plan.minutes}
                  </span>
                </div>
                <div className="text-sm text-slate-600">{plan.extraRate}</div>
              </div>

              {/* Features */}
              <div className="flex-grow">
                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Selection indicator */}
              {selected === plan.id && (
                <div className="mt-4 w-6 h-6 bg-[#2D1B69] rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-[#2D1B69] to-[#695FDA] text-white py-3 rounded-lg font-semibold hover:from-[#2D1B69]/90 hover:to-[#695FDA]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 max-w-md mx-auto block"
        disabled={!selected || submitted}
      >
        {submitted ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </div>
        ) : (
          "Start Free Trial"
        )}
      </button>
    </form>
  );
};

export default PricingPlanSelect;

// // components/onboarding/steps/ServicePreferenceSelect.tsx
// import React, { useState } from "react";
// import { Voicemail, CalendarCheck2, MessageCircleQuestion } from "lucide-react";

// interface ServiceOption {
//   id: 'voicemail' | 'scheduling' | 'faq';
//   title: string;
//   description: string;
//   icon: React.ReactNode;
//   gradient: string;
//   bgGradient: string;
//   borderColor: string;
//   textColor: string;
// }

// interface ServicePreferenceSelectProps {
//   onDone: (preference: string) => void;
// }

// const options: ServiceOption[] = [
//   {
//     id: "voicemail",
//     title: "Basic Voicemail Replacement",
//     description: "Answer calls, introduce your business, and take detailed messages for follow-up.",
//     icon: <Voicemail className="w-7 h-7" />,
//     gradient: "from-blue-500 to-indigo-600",
//     bgGradient: "from-blue-50 to-indigo-50",
//     borderColor: "border-blue-200/60",
//     textColor: "text-blue-700",
//   },
//   {
//     id: "scheduling",
//     title: "Appointment Scheduling",
//     description: "Help customers book appointments directly through phone calls with calendar integration.",
//     icon: <CalendarCheck2 className="w-7 h-7" />,
//     gradient: "from-emerald-500 to-teal-600",
//     bgGradient: "from-emerald-50 to-teal-50",
//     borderColor: "border-emerald-200/60",
//     textColor: "text-emerald-700",
//   },
//   {
//     id: "faq",
//     title: "FAQ Answering",
//     description: "Provide instant answers to common questions and handle complex inquiries professionally.",
//     icon: <MessageCircleQuestion className="w-7 h-7" />,
//     gradient: "from-amber-500 to-orange-600",
//     bgGradient: "from-amber-50 to-orange-50",
//     borderColor: "border-amber-200/60",
//     textColor: "text-amber-700",
//   },
// ];

// const ServicePreferenceSelect: React.FC<ServicePreferenceSelectProps> = ({ onDone }) => {
//   const [selected, setSelected] = useState<string | null>(null);
//   const [submitted, setSubmitted] = useState<boolean>(false);

//   const handleSelect = (optId: string) => {
//     setSelected(optId);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selected) return;

//     // Save to localStorage for backup
//     localStorage.setItem("servicePreference", JSON.stringify(selected));
//     setSubmitted(true);

//     // Small delay for user feedback, then proceed
//     setTimeout(() => {
//       onDone(selected);
//     }, 600);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2 className="text-2xl font-semibold text-slate-800 mb-4 text-center">
//         Choose Your Service Type
//       </h2>

//       <p className="text-slate-600 mb-8 text-center">
//         Select the primary way you want your AI agent to help your callers
//       </p>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         {options.map((opt) => (
//           <button
//             type="button"
//             key={opt.id}
//             className={`flex flex-col items-center border ${opt.borderColor} rounded-xl p-6 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400/40 bg-gradient-to-br ${opt.bgGradient} ${
//               selected === opt.id
//                 ? "ring-2 ring-purple-500 shadow-lg transform scale-105"
//                 : "hover:scale-102"
//             }`}
//             onClick={() => handleSelect(opt.id)}
//           >
//             <span className={`mb-4 ${opt.textColor}`}>{opt.icon}</span>
//             <span className="font-semibold text-lg mb-2 text-center text-slate-800">
//               {opt.title}
//             </span>
//             <span className="text-sm text-slate-600 text-center leading-relaxed">
//               {opt.description}
//             </span>

//             {/* Selection indicator */}
//             {selected === opt.id && (
//               <div className="mt-3 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
//                 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//               </div>
//             )}
//           </button>
//         ))}
//       </div>

//       <button
//         type="submit"
//         className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
//         disabled={!selected || submitted}
//       >
//         {submitted ? (
//           <div className="flex items-center justify-center">
//             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//             </svg>
//             Saving...
//           </div>
//         ) : (
//           "Continue"
//         )}
//       </button>

//       {/* Info about what happens next */}
//       {selected && (
//         <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
//           <p className="text-sm text-purple-800">
//             <span className="font-medium">Next step:</span> We'll ask you specific questions about your {" "}
//             {selected === 'voicemail' && 'business to help create effective message templates'}
//             {selected === 'scheduling' && 'booking process and availability'}
//             {selected === 'faq' && 'business to build a comprehensive FAQ database'}
//           </p>
//         </div>
//       )}
//     </form>
//   );
// };

// export default ServicePreferenceSelect;
