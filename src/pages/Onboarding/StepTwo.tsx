import React from 'react';
import { Star, Zap, Check } from 'lucide-react';
import { StepProps } from './types';
import { StepHeader, ContentContainer } from './SharedComponents';

const StepTwo: React.FC<StepProps> = ({ state, setState, handleNext, handleBack }) => {
  const selectPlan = (plan: 'starter' | 'pro') => {
    setState(prev => ({ ...prev, plan }));
    // Optional: Auto advance or let user click next
    setTimeout(() => handleNext(), 300);
  };

  return (
    <ContentContainer>
      <StepHeader 
        step="05" 
        title="Choose Your Plan" 
        subtitle="Select the plan that best fits your business needs."
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
};

export default StepTwo;
