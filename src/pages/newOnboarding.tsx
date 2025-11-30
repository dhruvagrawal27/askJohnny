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
    <div className="fixed inset-0 z-[100] bg-white flex flex-col lg:flex-row overflow-hidden font-sans h-screen w-screen">
      <Sidebar state={state} onClose={onClose} />
      
      {/* Main Content Area (Right 70%) */}
      <div className="flex-1 h-full relative bg-white overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-20 shrink-0">
          <span className="font-bold text-brand-700 text-sm">Step {state.step} of 7</span>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-600">
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-brand-50/50 to-transparent rounded-bl-full opacity-50"></div>
          </div>
          
          <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
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
    </div>
  );
};

export default newOnboarding;
