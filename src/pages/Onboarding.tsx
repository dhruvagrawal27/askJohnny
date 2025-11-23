// Onboarding component with new UI design
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { OnboardingState } from "../types/onboarding";
import {
  MapPin,
  ArrowLeft,
  Store,
  Sparkles,
  Phone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Step components
import BusinessSearch from "./steps/BusinessSearch";
import ServicePreferenceSelect from "./steps/ServicePreferenceSelect";
import BusinessFAQ from "./steps/BusinessFAQ";
import ContactInfo from "./steps/ContactInfo";
import SignupStep from "./steps/SignupStep";

const Onboarding: React.FC = () => {
  console.log('🔥 Onboarding - New UI Design');

  const navigate = useNavigate();
  const { isSignedIn, isLoaded, user } = useUser();
  const [step, setStep] = useState<number>(1);
  const [maxStep, setMaxStep] = useState<number>(4);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingState>({
    business: null,
    servicePreference: null,
    faqData: null,
    completed: false,
  });

  // NO AUTHENTICATION CHECKS - ALLOW ALL USERS
  useEffect(() => {
    console.log('✅ CLEAN NewOnboarding - Auth state:', { isLoaded, isSignedIn, userId: user?.id });
    console.log('✅ CLEAN NewOnboarding - ALL USERS ALLOWED, NO REDIRECTS');
    // NO AUTHENTICATION LOGIC - USERS CAN PROCEED REGARDLESS
  }, [isLoaded, isSignedIn, user]);

  // Show loading only for clerk loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-purple-700">Loading...</p>
        </div>
      </div>
    );
  }

  // Dynamic steps
  const getSteps = () => {
    const baseSteps = [
      { id: 1, label: "Business Search" },
      { id: 2, label: "Service Preference" },
      { id: 3, label: "Business FAQ" },
    ];
    
    const hasPhoneNumber = onboardingData.business?.phone || 
                          onboardingData.business?.formatted_phone_number;
    
    if (!hasPhoneNumber && step > 3) {
      return [
        ...baseSteps,
        { id: 4, label: "Contact Info" },
        { id: 5, label: "Signup" },
      ];
    } else {
      return [
        ...baseSteps,
        { id: 4, label: "Signup" },
      ];
    }
  };

  const steps = getSteps();

  // Step handlers
  const handleBusinessSearchDone = (businessData: any) => {
    console.log('✅ Step 1 Complete - Business Search:', businessData);
    setOnboardingData(prev => ({ ...prev, business: businessData }));
    setStep(2);
  };

  const handleServicePrefDone = (preference: string) => {
    console.log('✅ Step 2 Complete - Service Preference:', preference);
    setOnboardingData(prev => ({ ...prev, servicePreference: preference }));
    setStep(3);
  };

  const handleFAQDone = (faqData: any) => {
    console.log('✅ Step 3 Complete - FAQ Data:', faqData);
    setOnboardingData(prev => ({ ...prev, faqData }));
    
    const hasPhoneNumber = onboardingData.business?.phone || 
                          onboardingData.business?.formatted_phone_number;
    
    if (!hasPhoneNumber) {
      console.log('📞 Phone number needed, going to contact info step');
      setMaxStep(5);
      setStep(4);
    } else {
      console.log('📞 Phone number available, skipping to signup');
      setMaxStep(4);
      setStep(4);
    }
  };

  const handleContactInfoDone = (contactData: any) => {
    console.log('✅ Step 4 Complete - Contact Info:', contactData);
    setOnboardingData(prev => ({ ...prev, contactInfo: contactData }));
    setStep(5);
  };

  const handleSignupDone = () => {
    console.log('🚀 CRITICAL - handleSignupDone called!');
    console.log('📊 CRITICAL - Current onboarding data:', onboardingData);
    console.log('📊 CRITICAL - Current step:', step);
    console.log('📊 CRITICAL - Max step:', maxStep);
    
    if (!onboardingData.business) {
      console.error('❌ CRITICAL - Missing business data!', onboardingData.business);
      alert('Missing business information. Please go back and complete step 1.');
      return;
    }
    
    if (!onboardingData.servicePreference) {
      console.error('❌ CRITICAL - Missing service preference!', onboardingData.servicePreference);
      alert('Missing service preference. Please go back and complete step 2.');
      return;
    }
    
    if (!onboardingData.faqData) {
      console.error('❌ CRITICAL - Missing FAQ data!', onboardingData.faqData);
      alert('Missing FAQ data. Please go back and complete step 3.');
      return;
    }
    
    console.log('✅ All required data present, formatting for storage...');
    console.log('📝 DETAILED onboarding data check:');
    console.log('  - Business:', onboardingData.business);
    console.log('  - Service Preference:', onboardingData.servicePreference);  
    console.log('  - FAQ Data:', onboardingData.faqData);
    console.log('  - Contact Info:', onboardingData.contactInfo);
    
    const formattedData = {
      step1: {
        businessName: onboardingData.business?.name,
        businessDetails: onboardingData.business
      },
      step2: {
        voicemail: onboardingData.servicePreference === 'voicemail_handling' || onboardingData.servicePreference === 'full_service',
        scheduling: onboardingData.servicePreference === 'appointment_scheduling' || onboardingData.servicePreference === 'full_service',
        faq: onboardingData.servicePreference === 'basic_questions' || onboardingData.servicePreference === 'full_service'
      },
      step3: {
        scheduleType: 'business_hours'
      },
      step3b: {
        categoryId: onboardingData.faqData?.category,
        categoryLabel: 'Other Business',
        answers: onboardingData.faqData?.answers || {}
      },
      step4: onboardingData.contactInfo || {},
      step5: {
        selectedPlan: onboardingData.servicePreference || 'starter'
      }
    };
    
    console.log('💾 Formatted data for SetupLoading:', formattedData);
    
    try {
      localStorage.setItem('onboarding_data', JSON.stringify(formattedData));
      console.log('✅ Saved onboarding_data to localStorage');
      
      if (onboardingData.business) {
        localStorage.setItem('selectedBusiness', JSON.stringify(onboardingData.business));
        localStorage.setItem('onboarding_business', JSON.stringify(onboardingData.business));
        console.log('✅ Saved business data to localStorage');
      }
      
      if (onboardingData.servicePreference) {
        localStorage.setItem('selectedPlan', JSON.stringify(onboardingData.servicePreference));
        console.log('✅ Saved service preference to localStorage');
      }
      
      if (onboardingData.faqData) {
        localStorage.setItem('businessFAQ', JSON.stringify(onboardingData.faqData));
        console.log('✅ Saved FAQ data to localStorage');
      }
      
      localStorage.setItem('new_onboarding_data', JSON.stringify(onboardingData));
      console.log('✅ Saved complete onboarding data to localStorage');
      
      console.log('🎯 All data saved successfully, navigating to signup...');
      navigate('/signup');
      
    } catch (error) {
      console.error('❌ Error saving data to localStorage:', error);
      alert('Failed to save onboarding data. Please try again.');
    }
  };

  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  // Get step labels for display
  const getStepLabel = () => {
    if (step === 1) return "Find Business";
    if (step === 2) return "Select Plan";
    if (step === 3) return "Configure AI";
    if (step === 4 && maxStep === 5) return "Contact Info";
    if (step === 5 || (step === 4 && maxStep === 4)) return "Finalize";
    return "Setup";
  };

  // Get category label from FAQ data
  const getCategoryLabel = () => {
    if (!onboardingData.faqData?.category) return null;
    const categories = [
      { id: "restaurants", label: "Restaurants & Food" },
      { id: "healthcare", label: "Healthcare & Medical" },
      { id: "legal", label: "Legal & Law Firms" },
      { id: "real_estate", label: "Real Estate" },
      { id: "automotive", label: "Automotive Services" },
      { id: "fitness", label: "Fitness & Wellness" },
      { id: "others", label: "Other Business" }
    ];
    const cat = categories.find(c => c.id === onboardingData.faqData?.category);
    return cat?.label || "Other Business";
  };

  // Calculate progress percentage
  const progressPercentage = (step / steps.length) * 100;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col lg:flex-row overflow-hidden font-sans h-screen w-screen">
      {/* Sidebar (Left 30%) */}
      <div className="w-full lg:w-[280px] xl:w-[320px] bg-gray-50 border-r border-gray-200/60 p-5 flex flex-col justify-between h-full hidden lg:flex shadow-[inset_-10px_0_20px_-10px_rgba(0,0,0,0.05)] relative z-10 shrink-0">

        {/* Header & Progress */}
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-2 cursor-pointer mb-6" onClick={() => navigate('/')}>
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
               <h3 className="text-base font-bold text-gray-900">{getStepLabel()}</h3>
               <p className="text-xs text-gray-500 mt-0.5">Step {step} of {steps.length}</p>
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
                <div className="font-bold text-gray-900 text-xs leading-tight truncate" title={onboardingData.business?.name}>
                  {onboardingData.business?.name || <span className="text-gray-400 font-normal italic">Not selected</span>}
                </div>
                {onboardingData.business?.types?.[0] && (
                   <div className="text-[9px] text-brand-600 font-medium mt-0.5 truncate capitalize">{onboardingData.business.types[0].replace(/_/g, ' ')}</div>
                )}
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="space-y-1.5">
               {(showFullProfile || onboardingData.business) && (
                 <div className="flex items-start gap-2 text-[10px] overflow-hidden">
                    <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 leading-snug truncate" title={onboardingData.business?.address}>
                      {onboardingData.business?.address || <span className="text-gray-300 italic">Address pending...</span>}
                    </span>
                 </div>
               )}

               {(showFullProfile || onboardingData.business) && (
                 <div className="flex items-center gap-2 text-[10px] overflow-hidden">
                    <Phone size={12} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 truncate">
                      {onboardingData.business?.phone || onboardingData.business?.formatted_phone_number || <span className="text-gray-300 italic">Phone pending...</span>}
                    </span>
                 </div>
               )}

               <div className="h-px bg-gray-100 my-1"></div>

               {/* Plan & Industry Compact Row */}
               <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[9px] text-gray-400 font-medium mb-0.5">Plan</div>
                    {onboardingData.servicePreference ? (
                       <div className="flex items-center gap-1">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 truncate">
                            {onboardingData.servicePreference === 'full_service' ? 'Pro' : 'Starter'}
                          </span>
                       </div>
                    ) : <span className="text-gray-300 text-[10px]">--</span>}
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-400 font-medium mb-0.5">Industry</div>
                    <div className="text-[10px] font-bold text-gray-800 truncate">
                      {getCategoryLabel() || <span className="text-gray-300 font-normal">--</span>}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area (Right 70%) */}
      <div className="flex-1 h-full relative bg-white overflow-hidden flex flex-col">
         {/* Mobile Header */}
         <div className="lg:hidden p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-20 shrink-0">
            <span className="font-bold text-brand-700 text-sm">Step {step} of {steps.length}</span>
            <button onClick={() => navigate('/')} className="p-2 bg-gray-50 rounded-full text-gray-600"><ArrowLeft size={20} /></button>
         </div>

         {/* Content Wrapper */}
         <div className="flex-1 overflow-hidden relative flex flex-col">
            <div className="absolute inset-0 pointer-events-none z-0">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-brand-50/50 to-transparent rounded-bl-full opacity-50"></div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
               {step === 1 && <BusinessSearch onDone={handleBusinessSearchDone} onBack={step > 1 ? handlePrev : undefined} />}
               {step === 2 && <ServicePreferenceSelect onDone={handleServicePrefDone} onBack={handlePrev} />}
               {step === 3 && <BusinessFAQ onDone={handleFAQDone} onBack={handlePrev} />}
               {step === 4 && maxStep === 5 && <ContactInfo onDone={handleContactInfoDone} onBack={handlePrev} />}
               {step === 4 && maxStep === 4 && <SignupStep onDone={handleSignupDone} onBack={handlePrev} />}
               {step === 5 && <SignupStep onDone={handleSignupDone} onBack={handlePrev} />}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Onboarding;
