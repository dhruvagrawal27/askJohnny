import React from 'react';
import { Star, Zap, Check, ArrowLeft, Sparkles } from 'lucide-react';
import { StepProps } from './types';
import { StepHeader } from './SharedComponents';

const StepTwo: React.FC<StepProps> = ({ state, setState, handleNext, handleBack }) => {
  const selectPlan = (plan: 'starter' | 'pro') => {
    setState(prev => ({ ...prev, plan }));
  };

  const handleContinue = () => {
    if (!state.plan) {
      alert('Please select a plan');
      return;
    }
    handleNext();
  };

  const plans = [
    {
      id: 'starter',
      icon: Star,
      name: 'Starter',
      description: 'Perfect for small businesses.',
      price: 49,
      features: ['150 minutes included', 'Standard voice options', 'Email summaries', 'Basic Support']
    },
    {
      id: 'pro',
      icon: Zap,
      name: 'Business PRO',
      description: 'For growing teams & power.',
      price: 99,
      features: ['300 minutes included', 'Priority support', 'Advanced analytics', 'Multiple numbers'],
      recommended: true
    }
  ];

  const getPlanInfo = () => {
    if (!state.plan) return null;
    
    const info = {
      starter: {
        title: "Smart Start!",
        description: "Great choice for getting started. The Starter plan gives you everything you need to let Johnny handle your calls without breaking the bank. Small but mighty!"
      },
      pro: {
        title: "Power Move!",
        description: "Look at you, going PRO! With double the minutes, priority support, and advanced analytics, you're ready to scale. Johnny's pumped to work overtime for your success."
      }
    };
    
    return info[state.plan as keyof typeof info];
  };

  const planInfo = getPlanInfo();

  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 to-brand-50/30 flex flex-col">
      <div className="px-4 lg:px-6 py-3">
        <StepHeader 
          step="05" 
          title="Choose Your Plan" 
          subtitle="Select the plan that best fits your business needs."
          onBack={handleBack}
          showBack={true}
        />
      </div>

      {/* Two Column Container */}
      <div className="flex-1 flex flex-col px-4 lg:px-6 pb-4 min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 overflow-y-auto justify-center items-start pt-4">
          {/* Starter Plan - Left Column */}
          <div 
            onClick={() => selectPlan('starter')}
            className={`w-full lg:w-auto lg:flex-1 lg:max-w-sm p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col ${
              state.plan === 'starter' 
                ? 'border-brand-500 bg-gradient-to-br from-brand-50 to-purple-50 shadow-xl' 
                : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-lg'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                state.plan === 'starter' 
                  ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md' 
                  : 'bg-brand-50 text-brand-600'
              }`}>
                <Star size={22} />
              </div>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                state.plan === 'starter' ? 'bg-brand-600 scale-100' : 'bg-gray-200 scale-90'
              }`}>
                {state.plan === 'starter' && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Starter</h3>
            <p className="text-xs text-gray-500 mb-4">Perfect for small businesses.</p>
            
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold text-gray-900 tracking-tight">$49</span>
              <span className="text-gray-500 font-medium text-xs">/mo</span>
            </div>
            
            <p className="text-[10px] text-gray-500 mb-4">Billed monthly • Cancel anytime</p>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4"></div>

            <p className="text-xs font-semibold text-gray-700 mb-2">What's included:</p>
            
            <div className="space-y-2.5">
              {['150 minutes included', 'Standard voice options', 'Email summaries', 'Basic Support'].map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-gray-600">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                    <Check size={10} strokeWidth={3} />
                  </div>
                  {feat}
                </div>
              ))}
            </div>
          </div>

          {/* Pro Plan - Right Column */}
          <div 
            onClick={() => selectPlan('pro')}
            className={`relative w-full lg:w-auto lg:flex-1 lg:max-w-sm p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col ${
              state.plan === 'pro' 
                ? 'border-brand-500 bg-gradient-to-br from-brand-50 to-purple-50 shadow-xl' 
                : 'border-brand-300 bg-gradient-to-br from-white to-brand-50/50 hover:border-brand-400 hover:shadow-lg'
            }`}
          >
            <div className="absolute -top-2 left-5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md uppercase tracking-wider">
              Recommended
            </div>

            <div className="flex items-start justify-between mb-4 pt-1">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                state.plan === 'pro' 
                  ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md' 
                  : 'bg-brand-100 text-brand-600'
              }`}>
                <Zap size={22} />
              </div>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                state.plan === 'pro' ? 'bg-brand-600 scale-100' : 'bg-gray-200 scale-90'
              }`}>
                {state.plan === 'pro' && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Business PRO</h3>
            <p className="text-xs text-gray-500 mb-4">For growing teams.</p>
            
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold text-gray-900 tracking-tight">$99</span>
              <span className="text-gray-500 font-medium text-xs">/mo</span>
            </div>
            
            <p className="text-[10px] text-gray-500 mb-4">Billed monthly • Cancel anytime</p>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent mb-4"></div>

            <p className="text-xs font-semibold text-gray-700 mb-2">What's included:</p>
            
            <div className="space-y-2.5">
              {['300 minutes included', 'Priority support', 'Advanced analytics', 'Multiple numbers'].map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-gray-700 font-medium">
                  <div className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
                    <Check size={10} strokeWidth={3} />
                  </div>
                  {feat}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-4 flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!state.plan}
            className="px-8 btn-primary-custom py-2.5 font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Continue <ArrowLeft size={14} className="rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
