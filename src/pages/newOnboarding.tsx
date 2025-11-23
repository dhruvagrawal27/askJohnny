
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  CheckCircle, 
  Check, 
  ArrowLeft, 
  Store, 
  Shield, 
  Star,
  Zap,
  Mail,
  Lock,
  Loader2,
  Search,
  Sparkles,
  Phone,
  Clock,
  ChevronDown,
  ChevronUp,
  Map,
  Layout
} from 'lucide-react';

// --- Types & Data ---

interface Category {
  id: string;
  label: string;
  description: string;
  questions: string[];
}

interface SearchResult {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  type: string;
  phone: string;
  hours: string;
}

// Using a unified brand theme instead of rainbow colors
const categories: Category[] = [
  {
    id: "restaurants",
    label: "Restaurants & Food",
    description: "Dining, cafes, bars, and service",
    questions: [
      "Is your restaurant vegetarian, non-vegetarian, or both? What cuisines do you specialize in?",
      "Do you offer specials like discounts, live music, big screen, outdoor seating, or happy hours?",
      "What type of establishment are you (cafe, casual, fine dining, bar)? Do you serve alcohol?",
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare & Medical",
    description: "Clinics, dental, urgent care",
    questions: [
      "What type of practice (general, dental, specialty, urgent care) and primary services?",
      "Do you accept insurance, offer payment plans, and what are after-hours procedures?",
      "Do you need confirmations, prescription refills, or telehealth support?",
    ],
  },
  {
    id: "legal",
    label: "Legal & Law Firms",
    description: "Intake, scheduling, confidential",
    questions: [
      "What areas of law (injury, family, criminal, corporate)? Any emergency cases?",
      "Do you offer free consults, payment plans, or contingency fees?",
      "What is your intake process? Need document collection or case management support?",
    ],
  },
  {
    id: "real_estate",
    label: "Real Estate",
    description: "Leads, showings, inquiries",
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
    questions: [
      "What services (repairs, maintenance, inspections, sales)? Specialize in types/brands?",
      "Do you offer emergency services, towing, rentals, or warranty work?",
      "Typical appointment duration? Provide estimates or parts ordering?",
    ],
  },
  {
    id: "fitness",
    label: "Fitness & Wellness",
    description: "Gyms, yoga, personal training",
    questions: [
      "What type (gym, yoga, PT, dance) and what classes/services?",
      "Membership packages, PT, groups, or programs (seniors/beginners)?",
      "Peak hours, cancellation policies, equipment rentals or nutrition counseling?",
    ],
  },
  {
    id: "others",
    label: "Other Business",
    description: "Retail, consulting, services",
    questions: [
      "What type of business and primary products/services customers ask about?",
      "Most popular products/services and pricing ranges? Any packages or promotions?",
      "What info do callers usually want (availability, delivery, rates, service areas, fees, booking)?",
    ],
  },
];

interface OnboardingProps {
  onClose: () => void;
}

interface OnboardingState {
  step: number;
  businessName: string;
  businessAddress: string;
  businessDetails: SearchResult | null;
  plan: 'starter' | 'pro' | null;
  category: string | null;
  answers: Record<number, string>;
  email: string;
  password: string;
}

// --- Main Component ---

const newOnboarding: React.FC<OnboardingProps> = ({ onClose }) => {
  const [state, setState] = useState<OnboardingState>({
    step: 1,
    businessName: '',
    businessAddress: '',
    businessDetails: null,
    plan: null,
    category: null,
    answers: {},
    email: '',
    password: ''
  });

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showFullProfile, setShowFullProfile] = useState(false);

  // Mock search logic
  useEffect(() => {
    if (state.businessName.length > 2 && state.step === 1 && !state.businessDetails) {
      setIsSearching(true);
      const timeout = setTimeout(() => {
        setIsSearching(false);
        setSearchResults([
          { 
            id: '1', 
            name: state.businessName, 
            address: '123 Main Street, Downtown, NY 10001', 
            rating: 4.8, 
            reviews: 124, 
            type: 'Dental Clinic', 
            phone: '+1 (555) 123-4567',
            hours: 'Open • Closes 6PM'
          },
          { 
            id: '2', 
            name: `${state.businessName} Experts`, 
            address: '456 Business Park Blvd, Suite 200, Long City Name, State 90210', 
            rating: 4.5, 
            reviews: 89, 
            type: 'Consulting', 
            phone: '+1 (555) 987-6543',
            hours: 'Closed • Opens 9AM'
          },
          { 
            id: '3', 
            name: `${state.businessName} & Co.`, 
            address: '789 Commerce Ave, Westside', 
            rating: 4.2, 
            reviews: 45, 
            type: 'Retail', 
            phone: '+1 (555) 456-7890',
            hours: 'Open • Closes 9PM'
          },
        ]);
      }, 800);
      return () => clearTimeout(timeout);
    } else {
      if (!state.businessDetails) {
        setSearchResults([]);
      }
    }
  }, [state.businessName, state.step, state.businessDetails]);

  const handleNext = () => {
    if (state.step < 4) setState(prev => ({ ...prev, step: prev.step + 1 }));
  };

  const handleBack = () => {
    if (state.step > 1) setState(prev => ({ ...prev, step: prev.step - 1 }));
    else onClose(); 
  };

  const selectPlan = (plan: 'starter' | 'pro') => {
    setState(prev => ({ ...prev, plan }));
    // Optional: Auto advance or let user click next
    setTimeout(() => handleNext(), 300);
  };

  const handleBusinessSelect = (business: SearchResult) => {
    setState(prev => ({
      ...prev,
      businessName: business.name,
      businessAddress: business.address,
      businessDetails: business
    }));
  };

  // --- Sidebar (Left 30%) ---
  const Sidebar = () => {
    const currentCategory = categories.find(c => c.id === state.category);
    const progressPercentage = (state.step / 4) * 100;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (progressPercentage / 100) * circumference;

    return (
      <div className="w-full lg:w-[280px] xl:w-[320px] bg-gray-50 border-r border-gray-200/60 p-5 flex flex-col justify-between h-full hidden lg:flex shadow-[inset_-10px_0_20px_-10px_rgba(0,0,0,0.05)] relative z-10 shrink-0">
        
        {/* Header & Progress */}
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-2 cursor-pointer mb-6" onClick={onClose}>
            <span className="text-brand-700 font-extrabold text-xl tracking-tight">Ask Johnny</span>
          </div>

          <div className="flex flex-col items-center relative">
             {/* Circular Progress Chart */}
             <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 overflow-visible">
                  <circle cx="50%" cy="50%" r={radius} stroke="#E5E7EB" strokeWidth="6" fill="transparent" />
                  <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" className="text-brand-600 transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">{Math.round(progressPercentage)}%</span>
                </div>
             </div>
             
             <div className="mt-2 text-center">
               <h3 className="text-base font-bold text-gray-900">
                 {state.step === 1 && "Find Business"}
                 {state.step === 2 && "Select Plan"}
                 {state.step === 3 && "Configure AI"}
                 {state.step === 4 && "Finalize"}
               </h3>
               <p className="text-xs text-gray-500 mt-0.5">Step {state.step} of 4</p>
             </div>
          </div>
        </div>

        {/* Live Profile Preview - Glass Card */}
        <div className="mt-auto relative group w-full">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          
          <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-3 border border-white/60 shadow-xl flex flex-col gap-3 transition-all duration-300">
            
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5">
                 <Sparkles size={12} className="text-brand-500 fill-brand-500" />
                 <h3 className="text-[9px] font-extrabold text-brand-900/70 uppercase tracking-widest">Live Builder</h3>
              </div>
              <button onClick={() => setShowFullProfile(!showFullProfile)} className="text-brand-600 hover:bg-brand-50 rounded p-1 transition-colors">
                 {showFullProfile ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              </button>
            </div>
            
            {/* Main Identity */}
            <div className="flex items-start gap-2.5 pb-2 border-b border-gray-100">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md flex-shrink-0 bg-gradient-to-br from-brand-500 to-brand-700`}>
                  <Store size={14} className="text-white" />
              </div>
              <div className="overflow-hidden min-w-0 flex-1">
                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mb-0.5 truncate">Business Name</div>
                <div className="font-bold text-gray-900 text-xs leading-tight truncate" title={state.businessDetails?.name || state.businessName}>
                  {state.businessDetails?.name || state.businessName || <span className="text-gray-400 font-normal italic">Not selected</span>}
                </div>
                {state.businessDetails?.type && (
                   <div className="text-[9px] text-brand-600 font-medium mt-0.5 truncate">{state.businessDetails.type}</div>
                )}
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="space-y-1.5">
               {(showFullProfile || state.businessDetails) && (
                 <div className="flex items-start gap-2 text-[10px] overflow-hidden">
                    <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 leading-snug truncate" title={state.businessDetails?.address}>
                      {state.businessDetails?.address || <span className="text-gray-300 italic">Address pending...</span>}
                    </span>
                 </div>
               )}
               
               {(showFullProfile || state.businessDetails) && (
                 <div className="flex items-center gap-2 text-[10px] overflow-hidden">
                    <Phone size={12} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 truncate">
                      {state.businessDetails?.phone || <span className="text-gray-300 italic">Phone pending...</span>}
                    </span>
                 </div>
               )}

               <div className="h-px bg-gray-100 my-1"></div>

               {/* Plan & Industry Compact Row */}
               <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[9px] text-gray-400 font-medium mb-0.5">Plan</div>
                    {state.plan ? (
                       <div className="flex items-center gap-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            state.plan === 'pro' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {state.plan === 'starter' ? 'Start' : 'Pro'}
                          </span>
                       </div>
                    ) : <span className="text-gray-300 text-[10px]">--</span>}
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-400 font-medium mb-0.5">Industry</div>
                    <div className="text-[10px] font-bold text-gray-800 truncate">
                      {currentCategory?.label || <span className="text-gray-300 font-normal">--</span>}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Reusable Layout Components ---

  const StepHeader = ({ step, title, subtitle, onBack, showBack }: { step: string, title: string, subtitle: string, onBack?: () => void, showBack?: boolean }) => (
    <div className="mb-4 lg:mb-6 w-full flex justify-between items-start gap-4 shrink-0">
      <div className="text-left flex-1 min-w-0">
        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-[9px] font-bold uppercase tracking-wide mb-2">
          Step {step}
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1.5">{title}</h2>
        <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">{subtitle}</p>
      </div>
      {showBack && (
        <button 
          onClick={onBack}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 hover:text-brand-600 transition-all text-xs shadow-sm shrink-0"
        >
          <ArrowLeft size={12} /> Back
        </button>
      )}
    </div>
  );

  // Remove fixed height/padding constraints that caused double scrollbars
  const ContentContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full max-w-[1100px] mx-auto px-6 md:px-8 lg:px-12 flex flex-col py-6 h-full overflow-hidden">
       {children}
    </div>
  );

  // --- Step 1: Business Search (Split View) ---
  const StepOne = () => (
    <ContentContainer>
      <StepHeader 
        step="01" 
        title="Find Your Business" 
        subtitle="Search for your business to automatically import details." 
        showBack={false}
      />

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left Col: Search & Results (Scrollable List) */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="relative mb-3 group flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {isSearching ? <Loader2 className="animate-spin text-brand-600" size={18}/> : <Search className="text-gray-400" size={18}/>}
            </div>
            <input
              type="text"
              value={state.businessName}
              onChange={(e) => {
                 setState({...state, businessName: e.target.value});
                 if(e.target.value.length < 3) setState(prev => ({...prev, businessDetails: null}));
              }}
              placeholder="e.g. Downtown Dental Care"
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-base focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none shadow-sm transition-all placeholder:text-gray-300"
              autoFocus
            />
          </div>

          {/* Scrollable Results List - Independent Scroll */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div 
                    key={result.id} 
                    onClick={() => handleBusinessSelect(result)}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all border flex items-center gap-3 group ${
                       state.businessDetails?.id === result.id 
                       ? 'bg-brand-50 border-brand-500 shadow-sm' 
                       : 'bg-white border-gray-50 hover:border-brand-200 hover:shadow-sm'
                    }`}
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                       state.businessDetails?.id === result.id ? 'bg-brand-500 text-white' : 'bg-brand-100 text-brand-600'
                    }`}>
                      <Store size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm truncate">{result.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">{result.address}</div>
                      <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                             <Star size={8} className="fill-orange-500 mr-1" /> {result.rating}
                          </div>
                          <div className="text-[10px] text-gray-400 font-medium">• {result.type}</div>
                      </div>
                    </div>
                    {state.businessDetails?.id === result.id && (
                       <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white animate-zoom-in">
                          <Check size={12} strokeWidth={3} />
                       </div>
                    )}
                </div>
              ))
            ) : (
              state.businessName.length > 0 && !isSearching && (
                <div className="text-center py-8 text-gray-400">
                   <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Search size={18} />
                   </div>
                   <p className="text-xs">No results found.</p>
                   <button className="text-brand-600 font-bold text-xs mt-1 hover:underline">Enter manually</button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Col: Details Card (Preview) - Fits Viewport */}
        <div className="flex-1 flex flex-col min-h-0">
           <div className="h-full max-h-[500px] bg-white rounded-3xl border border-gray-200 shadow-xl shadow-brand-900/5 overflow-hidden flex flex-col">
              {state.businessDetails ? (
                 <div className="flex flex-col h-full animate-fade-in-up">
                    {/* Map Placeholder */}
                    <div className="h-28 bg-gray-100 relative w-full overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                         <Map size={24} className="text-gray-300" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                         <div className="flex items-center gap-1.5 text-white text-[10px] font-medium">
                            <MapPin size={10} className="fill-white" /> 
                            <span className="truncate">{state.businessDetails.address}</span>
                         </div>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{state.businessDetails.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-bold text-[10px]">{state.businessDetails.type}</span>
                                <span className="flex items-center gap-1 text-orange-500 font-bold text-[10px]">
                                    {state.businessDetails.rating} <Star size={8} className="fill-orange-500" />
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2.5 mb-4">
                            <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm shrink-0">
                                    <Phone size={14} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Phone</div>
                                    <div className="font-medium text-gray-900 text-xs truncate">{state.businessDetails.phone}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm shrink-0">
                                    <Clock size={14} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Hours</div>
                                    <div className="font-medium text-gray-900 text-xs truncate">{state.businessDetails.hours}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-2">
                           <button 
                             onClick={handleNext}
                             className="w-full btn-primary-custom py-3 font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                           >
                              Confirm & Continue <ArrowLeft size={14} className="rotate-180" />
                           </button>
                        </div>
                    </div>
                 </div>
              ) : (
                 <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50/50">
                    <div className="w-14 h-14 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mb-3">
                       <Layout size={24} className="text-gray-300" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1.5">Business Details</h3>
                    <p className="text-xs text-gray-500 max-w-[180px]">Select a business from the search results to preview details here.</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </ContentContainer>
  );

  // --- Step 2: Pricing (Fit to Screen) ---
  const StepTwo = () => (
    <ContentContainer>
      <StepHeader 
        step="02" 
        title="Choose Your Plan" 
        subtitle="Select the capacity that best fits your business needs."
        onBack={handleBack}
        showBack={true}
      />
      
      <div className="flex-1 flex flex-col min-h-0 justify-center pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 max-w-3xl mx-auto w-full">
          {/* Starter */}
          <div 
            onClick={() => selectPlan('starter')}
            className={`relative p-5 lg:p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 group flex flex-col ${
              state.plan === 'starter' 
                ? 'border-brand-500 bg-white shadow-xl shadow-brand-200/50 scale-[1.02]' 
                : 'border-transparent bg-gray-50 hover:bg-white hover:shadow-lg hover:border-gray-200 hover:-translate-y-1'
            }`}
          >
             <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-xl transition-colors ${state.plan === 'starter' ? 'bg-brand-100 text-brand-600' : 'bg-white text-gray-400 group-hover:text-brand-500'}`}>
                   <Star size={20} />
                </div>
                {state.plan === 'starter' && <div className="bg-brand-500 text-white p-1 rounded-full shadow-md animate-zoom-in"><Check size={12} /></div>}
             </div>
             
             <h3 className="text-lg font-bold text-gray-900 mb-1">Starter</h3>
             <p className="text-gray-500 text-[10px] mb-4">Perfect for small businesses.</p>
             
             <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">$49</span>
                <span className="text-gray-500 font-medium text-xs">/mo</span>
             </div>
             
             <div className="mt-auto space-y-2.5">
                {['150 minutes included', 'Standard voice options', 'Email summaries', 'Basic Support'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                     <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                       <Check size={8} />
                     </div>
                     {feat}
                  </li>
                ))}
             </div>
          </div>

          {/* Pro */}
          <div 
            onClick={() => selectPlan('pro')}
            className={`relative p-5 lg:p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 group flex flex-col ${
              state.plan === 'pro' 
                ? 'border-brand-500 bg-white shadow-xl shadow-brand-200/50 scale-[1.02] ring-2 ring-brand-100' 
                : 'border-brand-200 bg-gradient-to-b from-white to-brand-50/30 hover:shadow-xl hover:shadow-brand-100 hover:-translate-y-1'
            }`}
          >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-600 to-brand-500 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-md whitespace-nowrap z-10">
                Recommended
             </div>
             
             <div className="flex justify-between items-start mb-3 pt-1">
                <div className={`p-2.5 rounded-xl transition-colors ${state.plan === 'pro' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'bg-brand-100 text-brand-600'}`}>
                   <Zap size={20} />
                </div>
                {state.plan === 'pro' && <div className="bg-brand-500 text-white p-1 rounded-full shadow-md animate-zoom-in"><Check size={12} /></div>}
             </div>
             
             <h3 className="text-lg font-bold text-gray-900 mb-1">Business PRO</h3>
             <p className="text-gray-500 text-[10px] mb-4">For growing teams & power.</p>
             
             <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">$99</span>
                <span className="text-gray-500 font-medium text-xs">/mo</span>
             </div>
             
             <div className="mt-auto space-y-2.5">
                {['300 minutes included', 'Priority support', 'Advanced analytics', 'Multiple numbers'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-gray-800 font-bold">
                     <div className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
                       <Check size={8} />
                     </div>
                     {feat}
                  </li>
                ))}
             </div>
          </div>
        </div>
      </div>
    </ContentContainer>
  );

  // --- Step 3: Knowledge (Clean Scroll if Needed) ---
  const StepThree = () => {
     const selectedCat = categories.find(c => c.id === state.category);

     return (
      <ContentContainer>
        <StepHeader 
          step="03" 
          title="Setup AI Knowledge" 
          subtitle={selectedCat ? "Answer a few questions to help the AI sound like you." : "Select your industry to load relevant AI behaviors."}
          onBack={handleBack}
          showBack={true}
        />

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {!selectedCat ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
              {categories.map((cat, index) => {
                 return (
                   <div 
                     key={cat.id}
                     onClick={() => setState({...state, category: cat.id})}
                     className="relative p-4 rounded-xl border border-gray-100 hover:border-brand-200 cursor-pointer bg-white group flex flex-col gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-brand-900/5 hover:-translate-y-0.5 h-full"
                   >
                      <div className={`w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300`}>
                         <Store size={20} strokeWidth={1.5} />
                      </div>
                      <div className="relative z-10 mt-auto">
                         <h3 className="text-xs font-bold text-gray-900 mb-0.5">{cat.label}</h3>
                         <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{cat.description}</p>
                      </div>
                   </div>
                 );
              })}
            </div>
          ) : (
            <div className="max-w-2xl w-full animate-fade-in-up mx-auto">
               <div className="flex items-center gap-3 mb-6 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                       <Store size={20} />
                  </div>
                  <div>
                     <h3 className="text-base font-bold text-gray-900">{selectedCat.label}</h3>
                     <p className="text-[10px] text-gray-500">Configuration Mode</p>
                  </div>
                  <button 
                    onClick={() => setState({...state, category: null})}
                    className="ml-auto text-[10px] font-bold text-brand-600 hover:bg-brand-50 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Change Industry
                  </button>
               </div>

               <div className="space-y-5 pb-6">
                  {selectedCat.questions.map((q, idx) => (
                    <div key={idx} className="bg-white group">
                       <label className="block text-xs font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-[10px]">{idx + 1}</div>
                          {q}
                       </label>
                       <div className="relative">
                          <textarea 
                              value={state.answers[idx] || ''}
                              onChange={(e) => setState({
                                ...state, 
                                answers: {...state.answers, [idx]: e.target.value}
                              })}
                              placeholder="e.g. We specialize in..."
                              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-100 focus:border-brand-500 focus:bg-white outline-none transition-all text-sm min-h-[80px] resize-none shadow-inner placeholder:text-gray-400"
                          />
                       </div>
                    </div>
                  ))}
               </div>

               <div className="flex justify-start pt-2">
                  <button 
                     onClick={handleNext}
                     className="btn-primary-custom px-6 py-3 font-bold text-sm shadow-lg shadow-brand-500/30 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 rounded-xl"
                  >
                     Continue to Signup <ArrowLeft size={14} className="rotate-180" />
                  </button>
               </div>
            </div>
          )}
        </div>
      </ContentContainer>
     );
  };

  // --- Step 4: Signup (Standardized) ---
  const StepFour = () => (
    <ContentContainer>
       <StepHeader 
          step="04" 
          title="Create Account" 
          subtitle="Secure your dashboard and start automating your calls today."
          onBack={handleBack}
          showBack={true}
       />
       
       <div className="flex-1 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 min-h-0 overflow-y-auto pb-4 justify-center">
          {/* Left: Benefits */}
          <div className="flex-1 hidden lg:block max-w-sm">
             <div className="relative p-5 bg-brand-900 rounded-3xl overflow-hidden text-white shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full blur-[80px] opacity-50"></div>
                <div className="relative z-10">
                   <h3 className="text-xl font-bold mb-5">Why AskJohnny?</h3>
                   <div className="space-y-4">
                      {[
                         { icon: Shield, title: "Enterprise Security", desc: "Bank-level encryption for all data" },
                         { icon: Star, title: "14-Day Free Trial", desc: "No charges until you're 100% satisfied" },
                         { icon: Clock, title: "24/7 Reliability", desc: "Never miss a call, day or night" }
                      ].map((item, i) => (
                         <div key={i} className="flex items-start gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                               <item.icon size={14} />
                            </div>
                            <div>
                               <h4 className="font-bold text-xs mb-0.5">{item.title}</h4>
                               <p className="text-[10px] text-gray-300">{item.desc}</p>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          {/* Right: Form */}
          <div className="flex-1 w-full max-w-sm mx-auto lg:mx-0">
             <div className="bg-white p-6 rounded-[2rem] shadow-2xl shadow-brand-900/10 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-5">Account Details</h3>
                
                <div className="space-y-4">
                   <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1.5 ml-1">Email Address</label>
                      <div className="relative group">
                         <Mail className="absolute left-3 top-3 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={16} />
                         <input 
                            type="email" 
                            placeholder="you@business.com"
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400"
                            value={state.email}
                            onChange={e => setState({...state, email: e.target.value})}
                         />
                      </div>
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1.5 ml-1">Password</label>
                      <div className="relative group">
                         <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={16} />
                         <input 
                            type="password" 
                            placeholder="••••••••"
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400"
                            value={state.password}
                            onChange={e => setState({...state, password: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="pt-2">
                      <button className="w-full btn-primary-custom py-3.5 font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 rounded-xl">
                         Complete Setup <CheckCircle size={16} />
                      </button>
                   </div>
                   
                   <p className="text-[9px] text-center text-gray-400 mt-3 leading-relaxed">
                      By clicking above, you agree to our <br/><span className="underline cursor-pointer hover:text-brand-600">Terms of Service</span> and <span className="underline cursor-pointer hover:text-brand-600">Privacy Policy</span>.
                   </p>
                </div>
             </div>
          </div>
       </div>
    </ContentContainer>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col lg:flex-row overflow-hidden font-sans h-screen w-screen">
       <Sidebar />
       
       {/* Main Content Area (Right 70%) */}
       <div className="flex-1 h-full relative bg-white overflow-hidden flex flex-col">
          {/* Mobile Header */}
          <div className="lg:hidden p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-20 shrink-0">
             <span className="font-bold text-brand-700 text-sm">Step {state.step} of 4</span>
             <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-600"><ArrowLeft size={20} /></button>
          </div>

          {/* Content Wrapper */}
          <div className="flex-1 overflow-hidden relative flex flex-col">
             <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-brand-50/50 to-transparent rounded-bl-full opacity-50"></div>
             </div>
             
             <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
                {state.step === 1 && <StepOne />}
                {state.step === 2 && <StepTwo />}
                {state.step === 3 && <StepThree />}
                {state.step === 4 && <StepFour />}
             </div>
          </div>
       </div>
    </div>
  );
};

export default newOnboarding;
