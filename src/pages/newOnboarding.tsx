import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { OnboardingState } from './Onboarding/types';
import { Sidebar } from './Onboarding/SharedComponents';
import StepOne from './Onboarding/StepOne';
import StepOneB from './Onboarding/StepOneB';
import StepOneC from './Onboarding/StepOneC';
import StepOneD from './Onboarding/StepOneD';
import StepTwo from './Onboarding/StepTwo';
import StepThree from './Onboarding/StepThree';
import StepFour from './Onboarding/StepFour';

interface OnboardingProps {
  onClose: () => void;
}

const newOnboarding: React.FC<OnboardingProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get initial step from URL, default to 1
  const urlStep = parseInt(searchParams.get('step') || '1', 10);
  const initialStep = urlStep >= 1 && urlStep <= 7 ? urlStep : 1;
  
  const [state, setState] = useState<OnboardingState>({
    step: initialStep,
    businessName: '',
    businessAddress: '',
    businessDetails: null,
    callHandling: [],
    callSchedule: '',
    plan: null,
    category: null,
    answers: {},
    email: '',
    password: ''
  });

  // Update URL when step changes
  useEffect(() => {
    const currentUrlStep = parseInt(searchParams.get('step') || '1', 10);
    if (currentUrlStep !== state.step) {
      navigate(`?step=${state.step}`, { replace: false });
    }
  }, [state.step, navigate, searchParams]);

  // Sync state when URL changes (for browser back/forward buttons)
  useEffect(() => {
    const urlStep = parseInt(searchParams.get('step') || '1', 10);
    const validStep = urlStep >= 1 && urlStep <= 7 ? urlStep : 1;
    if (validStep !== state.step) {
      setState(prev => ({ ...prev, step: validStep }));
    }
  }, [searchParams]);

  const handleNext = () => {
    if (state.step < 7) setState(prev => ({ ...prev, step: prev.step + 1 }));
  };

  const handleBack = () => {
    if (state.step > 1) setState(prev => ({ ...prev, step: prev.step - 1 }));
    else onClose(); 
  };

  const stepProps = {
    state,
    setState,
    handleNext,
    handleBack
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex overflow-hidden font-sans h-screen">
      <Sidebar state={state} onClose={onClose} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Mobile Header */}
        <div className="lg:hidden px-4 py-3 border-b border-gray-200 bg-white flex justify-between items-center z-20 shrink-0">
          <span className="font-bold text-brand-700 text-xs">Step {state.step} of 7</span>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* Content Wrapper - No scrolling, fits in viewport */}
        <div className="flex-1 overflow-hidden h-full">
          {state.step === 1 && <StepOne {...stepProps} />}
          {state.step === 2 && <StepOneB {...stepProps} />}
          {state.step === 3 && <StepOneC {...stepProps} />}
          {state.step === 4 && <StepOneD {...stepProps} />}
          {state.step === 5 && <StepTwo {...stepProps} />}
          {state.step === 6 && <StepThree {...stepProps} />}
          {state.step === 7 && <StepFour {...stepProps} />}
        </div>
      </div>
    </div>
  );
};

export default newOnboarding;
