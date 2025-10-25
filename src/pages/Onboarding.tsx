// Fixed NewOnboarding component - NO AUTHENTICATION CHECKS
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { OnboardingState } from "../types/onboarding";

// Step components
import BusinessSearch from "./steps/BusinessSearch";
import ServicePreferenceSelect from "./steps/ServicePreferenceSelect";
import BusinessFAQ from "./steps/BusinessFAQ";
import ContactInfo from "./steps/ContactInfo";
import SignupStep from "./steps/SignupStep";

const NewOnboarding: React.FC = () => {
  console.log('🔥 CLEAN NewOnboarding V5.0 - NO AUTH CHECKS');
  
  const navigate = useNavigate();
  const { isSignedIn, isLoaded, user } = useUser();
  const [step, setStep] = useState<number>(1);
  const [maxStep, setMaxStep] = useState<number>(4);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-white to-purple-50/40">
      {/* Progress Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-200/50">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Setup Your AI Agent ✅ V5.0 CLEAN</h1>
                <p className="text-sm text-slate-500 mt-0.5">Quick setup - No authentication required until signup!</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 px-4 py-2 rounded-full border border-purple-200/40 shadow-sm">
              <span className="text-sm font-medium text-purple-700">
                Step {step} of {steps.length}
              </span>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex justify-center space-x-2 mb-4">
            {steps.map((s) => (
              <div
                key={s.id}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  step === s.id
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-200/50"
                    : step > s.id
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-purple-100/60 shadow-xl shadow-purple-100/20 overflow-hidden">
          <div className="p-8">
            {step === 1 && <BusinessSearch onDone={handleBusinessSearchDone} />}
            {step === 2 && <ServicePreferenceSelect onDone={handleServicePrefDone} />}
            {step === 3 && <BusinessFAQ onDone={handleFAQDone} />}
            {step === 4 && maxStep === 5 && <ContactInfo onDone={handleContactInfoDone} />}
            {step === 4 && maxStep === 4 && (
              <div>
                <div className="mb-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-blue-800 text-sm">DEBUG: SignupStep rendered (step 4 of 4)</p>
                </div>
                <SignupStep onDone={handleSignupDone} />
              </div>
            )}
            {step === 5 && (
              <div>
                <div className="mb-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-blue-800 text-sm">DEBUG: SignupStep rendered (step 5 of 5)</p>
                </div>
                <SignupStep onDone={handleSignupDone} />
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        {step > 1 && (
          <div className="flex justify-start mt-6">
            <button
              className="px-6 py-3 bg-white/70 backdrop-blur-sm text-slate-600 rounded-lg hover:bg-white/90 transition-all duration-200 border border-slate-200/60 shadow-sm"
              onClick={handlePrev}
            >
              ← Previous
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewOnboarding;
