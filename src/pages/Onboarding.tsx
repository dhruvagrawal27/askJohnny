// components/onboarding/NewOnboarding.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingState } from "../types/onboarding";

// We'll import these step components later
import BusinessSearch from "./steps/BusinessSearch";
import ServicePreferenceSelect from "./steps/ServicePreferenceSelect";
import BusinessFAQ from "./steps/BusinessFAQ";
import ContactInfo from "./steps/ContactInfo";
import SignupStep from "./steps/SignupStep";

const NewOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [maxStep, setMaxStep] = useState<number>(4); // Will be 5 if phone number needed
  const [onboardingData, setOnboardingData] = useState<OnboardingState>({
    business: null,
    servicePreference: null,
    faqData: null,
    completed: false,
  });

  // Dynamic steps based on whether phone number is needed
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

  // Step handlers - these will be called by child components
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
    
    // Check if we need to collect phone number
    const hasPhoneNumber = onboardingData.business?.phone || 
                          onboardingData.business?.formatted_phone_number;
    
    if (!hasPhoneNumber) {
      console.log('📞 Phone number needed, going to contact info step');
      setMaxStep(5);
      setStep(4); // Go to contact info step
    } else {
      console.log('📞 Phone number available, skipping to signup');
      setMaxStep(4);
      setStep(4); // Go directly to signup
    }
  };

  const handleContactInfoDone = (contactData: any) => {
    console.log('✅ Step 4 Complete - Contact Info:', contactData);
    setOnboardingData(prev => ({ ...prev, contactInfo: contactData }));
    setStep(5); // Go to signup
  };

  const handleSignupDone = () => {
    console.log('🚀 Step 4 Complete - Starting Signup Process');
    console.log('📊 Final onboarding data:', onboardingData);
    
    // Validate we have all required data
    if (!onboardingData.business) {
      console.error('❌ Missing business data!');
      alert('Missing business information. Please go back and complete step 1.');
      return;
    }
    
    if (!onboardingData.servicePreference) {
      console.error('❌ Missing service preference!');
      alert('Missing service preference. Please go back and complete step 2.');
      return;
    }
    
    if (!onboardingData.faqData) {
      console.error('❌ Missing FAQ data!');
      alert('Missing FAQ data. Please go back and complete step 3.');
      return;
    }
    
    console.log('✅ All required data present, formatting for storage...');
    
    // Convert to the format expected by SetupLoading
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
        scheduleType: 'business_hours' // default
      },
      step3b: {
        categoryId: onboardingData.faqData?.category,
        categoryLabel: 'Other Business', // Will be set by BusinessFAQ component
        answers: onboardingData.faqData?.answers || {}
      },
      step4: onboardingData.contactInfo || {}, // Contact info if collected
      step5: {
        selectedPlan: onboardingData.servicePreference || 'starter'
      }
    };
    
    console.log('💾 Formatted data for SetupLoading:', formattedData);
    
    try {
      // Save in the format SetupLoading expects
      localStorage.setItem('onboarding_data', JSON.stringify(formattedData));
      console.log('✅ Saved onboarding_data to localStorage');
      
      // Also save individual components as backup for SetupProfile compatibility
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
      
      // Save complete new format for backup
      localStorage.setItem('new_onboarding_data', JSON.stringify(onboardingData));
      console.log('✅ Saved complete onboarding data to localStorage');
      
      console.log('🎯 All data saved successfully, navigating to signup...');
      
      // Navigate to signup - user will be redirected to setup-loading after auth
      navigate('/signup');
      
    } catch (error) {
      console.error('❌ Error saving data to localStorage:', error);
      alert('Failed to save onboarding data. Please try again.');
    }
  };

  // Navigation
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
                <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Setup Your AI Agent</h1>
                <p className="text-sm text-slate-500 mt-0.5">Quick setup in just 4 simple steps</p>
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
            {step === 4 && maxStep === 4 && <SignupStep onDone={handleSignupDone} />}
            {step === 5 && <SignupStep onDone={handleSignupDone} />}
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