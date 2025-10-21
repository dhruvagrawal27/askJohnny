// components/onboarding/steps/BusinessFAQ.tsx
import React, { useState } from "react";

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

const BusinessFAQ: React.FC<BusinessFAQProps> = ({ onDone }) => {
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
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Select Your Business Category
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose the category that best describes your business so we can ask
            the right questions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`group relative overflow-hidden bg-gradient-to-br ${cat.gradient} border border-slate-200/60 rounded-2xl p-6 hover:shadow-lg hover:shadow-slate-200/50 focus:outline-none focus:ring-2 focus:ring-[#2D1B69]/40 transition-all duration-300 text-left hover:-translate-y-1`}
              onClick={() => handleCategorySelect(cat)}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B69]/5 to-[#695FDA]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="flex items-start mb-4">
                  <div
                    className={`p-3 rounded-xl bg-white/80 ${cat.iconColor} mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-800 mb-2 group-hover:text-[#2D1B69] transition-colors">
                      {cat.label}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="flex justify-end">
                  <svg
                    className="w-5 h-5 text-slate-400 group-hover:text-[#2D1B69] group-hover:translate-x-1 transition-all duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Questions view
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className="flex items-center text-[#2D1B69] hover:text-[#695FDA] mr-6 transition-colors group"
        >
          <svg
            className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Categories
        </button>
      </div>

      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${selectedCategory.gradient} ${selectedCategory.iconColor} mr-4`}
          >
            {selectedCategory.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {selectedCategory.label}
            </h2>
            <p className="text-slate-600">{selectedCategory.description}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          {selectedCategory.questions.map((question, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-start mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2D1B69] to-[#695FDA] text-white flex items-center justify-center text-sm font-semibold mr-4 flex-shrink-0">
                  {idx + 1}
                </div>
                <label className="block text-slate-800 font-medium leading-relaxed">
                  {question}
                </label>
              </div>

              <div className="ml-12">
                <textarea
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D1B69] focus:border-transparent resize-none transition-all duration-200 bg-slate-50/50 focus:bg-white"
                  rows={4}
                  value={answers[idx]}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  required
                  placeholder="Please provide a detailed answer that will help our AI understand your business better..."
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-6">
          <button
            type="submit"
            className="px-8 py-4 bg-gradient-to-r from-[#2D1B69] to-[#695FDA] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#2D1B69]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5 min-w-[200px]"
            disabled={submitted || answers.some((a) => !a.trim())}
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
                Saving Responses...
              </div>
            ) : (
              "Continue to Account Creation"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessFAQ;

// // components/onboarding/steps/BusinessFAQ.tsx
// import React, { useState } from "react";

// interface Category {
//   id: string;
//   label: string;
//   description: string;
//   icon: React.ReactNode;
//   questions: string[];
// }

// interface BusinessFAQProps {
//   onDone: (faqData: { category: string; answers: string[] }) => void;
// }

// const categories: Category[] = [
//   {
//     id: "restaurants",
//     label: "Restaurants & Food Service",
//     description: "Dining, cafes, bars, and food services",
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 3v6a1 1 0 001 1h3v10a1 1 0 102 0V3m7 0v6a1 1 0 001 1h1a1 1 0 001-1V3" />
//       </svg>
//     ),
//     questions: [
//       "Is your restaurant vegetarian, non-vegetarian, or both? What cuisines do you specialize in?",
//       "Do you offer specials like discounts, live music, big screen, outdoor seating, or happy hours?",
//       "What type of establishment are you (cafe, casual, fine dining, bar)? Do you serve alcohol?",
//     ],
//   },
//   {
//     id: "healthcare",
//     label: "Healthcare & Medical",
//     description: "Clinics, dental, urgent care, specialties",
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6M5.5 21h13a2.5 2.5 0 002.5-2.5V8.5A2.5 2.5 0 0018.5 6h-13A2.5 2.5 0 003 8.5v10A2.5 2.5 0 005.5 21z" />
//       </svg>
//     ),
//     questions: [
//       "What type of practice (general, dental, specialty, urgent care) and primary services?",
//       "Do you accept insurance, offer payment plans, and what are after-hours procedures?",
//       "Do you need confirmations, prescription refills, or telehealth support?",
//     ],
//   },
//   {
//     id: "legal",
//     label: "Legal & Law Firms",
//     description: "Client intake, scheduling, confidential calls",
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//       </svg>
//     ),
//     questions: [
//       "What areas of law (injury, family, criminal, corporate)? Any emergency cases?",
//       "Do you offer free consults, payment plans, or contingency fees?",
//       "What is your intake process? Need document collection or case management support?",
//     ],
//   },
//   {
//     id: "real_estate",
//     label: "Real Estate",
//     description: "Leads, showings, buyer/seller inquiries",
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
//       </svg>
//     ),
//     questions: [
//       "Residential, commercial, or rentals? What areas do you serve?",
//       "Services: buying, selling, property management, investments?",
//       "Need lead qualification, showings, or follow-ups?",
//     ],
//   },
//   {
//     id: "automotive",
//     label: "Automotive Services",
//     description: "Repair shops and dealerships",
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//       </svg>
//     ),
//     questions: [
//       "What services (repairs, maintenance, inspections, sales)? Specialize in types/brands?",
//       "Do you offer emergency services, towing, rentals, or warranty work?",
//       "Typical appointment duration? Provide estimates or parts ordering?",
//     ],
//   },
//   {
//     id: "fitness",
//     label: "Fitness & Wellness",
//     description: "Gyms, yoga studios, personal training",
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//       </svg>
//     ),
//     questions: [
//       "What type (gym, yoga, PT, dance) and what classes/services?",
//       "Membership packages, PT, groups, or programs (seniors/beginners)?",
//       "Peak hours, cancellation policies, equipment rentals or nutrition counseling?",
//     ],
//   },
//   {
//     id: "others",
//     label: "Other Business",
//     description: "Retail, consulting, services, etc.",
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
//       </svg>
//     ),
//     questions: [
//       "What type of business and primary products/services customers ask about?",
//       "Most popular products/services and pricing ranges? Any packages or promotions?",
//       "What info do callers usually want (availability, delivery, rates, service areas, fees, booking)?",
//     ],
//   },
// ];

// const BusinessFAQ: React.FC<BusinessFAQProps> = ({ onDone }) => {
//   const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
//   const [answers, setAnswers] = useState<string[]>([]);
//   const [submitted, setSubmitted] = useState<boolean>(false);

//   const handleCategorySelect = (cat: Category) => {
//     setSelectedCategory(cat);
//     setAnswers(Array(cat.questions.length).fill(""));
//     setSubmitted(false);
//   };

//   const handleAnswerChange = (idx: number, value: string) => {
//     setAnswers((prev) => {
//       const arr = [...prev];
//       arr[idx] = value;
//       return arr;
//     });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedCategory) return;

//     const faqData = {
//       category: selectedCategory.id,
//       answers,
//     };

//     // Save to localStorage
//     localStorage.setItem("businessFAQ", JSON.stringify(faqData));
//     setSubmitted(true);

//     setTimeout(() => {
//       onDone(faqData);
//     }, 600);
//   };

//   // Category selection view
//   if (!selectedCategory) {
//     return (
//       <div>
//         <h2 className="text-2xl font-semibold text-slate-800 mb-4 text-center">
//           Select Your Business Category
//         </h2>
//         <p className="text-slate-600 mb-8 text-center">
//           Choose the category that best describes your business
//         </p>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {categories.map((cat) => (
//             <button
//               key={cat.id}
//               className="flex items-start p-4 border border-slate-200 rounded-xl hover:bg-purple-50 hover:border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400/40 transition-all duration-200 text-left group"
//               onClick={() => handleCategorySelect(cat)}
//             >
//               <span className="mr-3 text-slate-400 group-hover:text-purple-600 flex-shrink-0 mt-1 transition-colors">
//                 {cat.icon}
//               </span>
//               <div>
//                 <div className="font-semibold text-slate-800 mb-1 group-hover:text-purple-700 transition-colors">
//                   {cat.label}
//                 </div>
//                 <div className="text-sm text-slate-600">{cat.description}</div>
//               </div>
//             </button>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   // Questions view
//   return (
//     <form onSubmit={handleSubmit}>
//       <div className="flex items-center mb-6">
//         <button
//           type="button"
//           onClick={() => setSelectedCategory(null)}
//           className="flex items-center text-purple-600 hover:text-purple-700 mr-4 transition-colors"
//         >
//           <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//           </svg>
//           Back
//         </button>
//         <h2 className="text-2xl font-semibold text-slate-800">
//           {selectedCategory.label} Questions
//         </h2>
//       </div>

//       <div className="space-y-6">
//         {selectedCategory.questions.map((question, idx) => (
//           <div key={idx}>
//             <label className="block text-sm font-medium text-slate-700 mb-2">
//               Question {idx + 1}: {question}
//             </label>
//             <textarea
//               className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
//               rows={3}
//               value={answers[idx]}
//               onChange={(e) => handleAnswerChange(idx, e.target.value)}
//               required
//               placeholder="Please provide a detailed answer..."
//             />
//           </div>
//         ))}
//       </div>

//       <button
//         type="submit"
//         className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-8"
//         disabled={submitted || answers.some((a) => !a.trim())}
//       >
//         {submitted ? "Saving..." : "Continue to Account Creation"}
//       </button>
//     </form>
//   );
// };

// export default BusinessFAQ;
