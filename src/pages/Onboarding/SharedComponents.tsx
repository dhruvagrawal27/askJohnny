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

interface ContentContainerProps {
  children: React.ReactNode;
}

export const ContentContainer: React.FC<ContentContainerProps> = ({ children }) => (
  <div className="w-full px-6 md:px-8 lg:px-12 flex flex-col py-6 h-full overflow-hidden">
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
              {state.step === 2 && "Voice Preview"}
              {state.step === 3 && "Call Handling"}
              {state.step === 4 && "Call Schedule"}
              {state.step === 5 && "Select Plan"}
              {state.step === 6 && "Configure AI"}
              {state.step === 7 && "Finalize"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Step {state.step} of 7</p>
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
              {state.businessDetails?.types?.[0] && (
                <div className="text-[9px] text-brand-600 font-medium mt-0.5 truncate">{state.businessDetails.types[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
              )}
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="space-y-1.5">
            {(showFullProfile || state.businessDetails) && (
              <div className="flex items-start gap-2 text-[10px] overflow-hidden">
                <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 leading-snug truncate" title={state.businessDetails?.formatted_address}>
                  {state.businessDetails?.formatted_address || <span className="text-gray-300 italic">Address pending...</span>}
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
