import React from 'react';
import { ArrowLeft, Store, Sparkles, MapPin, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { OnboardingState, categories } from './types';

interface StepHeaderProps {
  step: string;
  title: string;
  subtitle: string;
  onBack?: () => void;
  showBack?: boolean;
}

export const StepHeader: React.FC<StepHeaderProps> = ({ step, title, subtitle, onBack, showBack }) => (
  <div className="mb-3 w-full flex justify-between items-start gap-3 shrink-0">
    <div className="text-left flex-1 min-w-0">
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[9px] font-bold uppercase tracking-wider mb-1.5">
        Step {step}
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{title}</h2>
      <p className="text-xs text-gray-500 leading-snug">{subtitle}</p>
    </div>
    {showBack && (
      <button 
        onClick={onBack}
        className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 hover:border-brand-300 hover:text-brand-700 transition-all text-xs shrink-0"
      >
        <ArrowLeft size={12} /> Back
      </button>
    )}
  </div>
);

interface ContentContainerProps {
  children: React.ReactNode;
}

export const ContentContainer: React.FC<ContentContainerProps> = ({ children }) => (
  <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-6 lg:py-8 flex flex-col">
    {children}
  </div>
);

interface SidebarProps {
  state: OnboardingState;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ state, onClose }) => {
  const [showFullProfile, setShowFullProfile] = React.useState(false);
  const currentCategory = categories.find(c => c.id === state.category);
  const progressPercentage = (state.step / 7) * 100;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="hidden lg:flex w-[240px] bg-gradient-to-br from-gray-50 to-white border-r border-gray-200 p-4 flex-col justify-between shrink-0 h-screen">
      
      {/* Header & Progress */}
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-2 cursor-pointer mb-4 group" onClick={onClose}>
          <span className="text-brand-700 font-extrabold text-lg tracking-tight group-hover:text-brand-800 transition-colors">Ask Johnny</span>
        </div>

        <div className="flex flex-col items-center relative">
          {/* Circular Progress Chart */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 overflow-visible">
              <circle cx="50%" cy="50%" r={radius} stroke="#E5E7EB" strokeWidth="6" fill="transparent" />
              <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" className="text-brand-600 transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gray-900">{Math.round(progressPercentage)}%</span>
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <h3 className="text-sm font-bold text-gray-900">
              {state.step === 1 && "Find Business"}
              {state.step === 2 && "Voice Preview"}
              {state.step === 3 && "Call Handling"}
              {state.step === 4 && "Call Schedule"}
              {state.step === 5 && "Select Plan"}
              {state.step === 6 && "Configure AI"}
              {state.step === 7 && "Finalize"}
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Step {state.step} of 7</p>
          </div>
        </div>
      </div>

      {/* Live Profile Preview - Compact Card */}
      <div className="mt-auto relative w-full">
        <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex flex-col gap-2">
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Sparkles size={11} className="text-brand-500 fill-brand-500" />
              <h3 className="text-[9px] font-extrabold text-brand-900/70 uppercase tracking-wider">Live Preview</h3>
            </div>
          </div>
          
          {/* Main Identity */}
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm flex-shrink-0 bg-gradient-to-br from-brand-500 to-brand-700`}>
              <Store size={13} className="text-white" />
            </div>
            <div className="overflow-hidden min-w-0 flex-1">
              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wide truncate">Business</div>
              <div className="font-bold text-gray-900 text-xs leading-tight truncate" title={state.businessDetails?.name || state.businessName}>
                {state.businessDetails?.name || state.businessName || <span className="text-gray-400 font-normal italic text-[10px]">Not selected</span>}
              </div>
            </div>
          </div>

          {/* Compact Stats */}
          <div className="space-y-1.5">
            {state.businessDetails && (
              <div className="flex items-center gap-1.5 text-[10px] overflow-hidden">
                <MapPin size={10} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-600 truncate" title={state.businessDetails?.formatted_address}>
                  {state.businessDetails?.formatted_address}
                </span>
              </div>
            )}
            
            {/* Plan & Industry Row */}
            <div className="flex items-center gap-2 text-[9px]">
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Plan:</span>
                {state.plan ? (
                  <span className={`font-bold px-1.5 py-0.5 rounded ${
                    state.plan === 'pro' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {state.plan === 'starter' ? 'Start' : 'Pro'}
                  </span>
                ) : <span className="text-gray-300">--</span>}
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1 truncate">
                <span className="text-gray-400">Type:</span>
                <span className="font-bold text-gray-800 truncate">
                  {currentCategory?.label || <span className="text-gray-300 font-normal">--</span>}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
