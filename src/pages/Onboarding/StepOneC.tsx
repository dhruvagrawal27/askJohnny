import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Calendar, HelpCircle, Check } from 'lucide-react';
import { StepProps } from './types';
import { StepHeader, ContentContainer } from './SharedComponents';

const StepOneC: React.FC<StepProps> = ({ state, setState, handleNext, handleBack }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    state.callHandling || []
  );

  const options = [
    {
      id: 'voicemail',
      icon: MessageSquare,
      title: 'Basic Voicemail Replacement',
      description: "Johnny will answer calls, introduce your business, and take messages. You'll receive detailed summaries of each call.",
    },
    {
      id: 'scheduling',
      icon: Calendar,
      title: 'Appointment Scheduling',
      description: "Johnny will answer calls, take messages, and help callers schedule appointments on your calendar.",
    },
    {
      id: 'faq',
      icon: HelpCircle,
      title: 'FAQ Answering',
      description: "Johnny will answer common questions about your business, take messages, and schedule appointments.",
    }
  ];

  const handleToggleOption = (optionId: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedOptions.length === 0) {
      alert('Please select at least one option');
      return;
    }
    setState(prev => ({ ...prev, callHandling: selectedOptions }));
    handleNext();
  };

  return (
    <div className="w-full h-full flex flex-col px-4 lg:px-6 py-3 overflow-hidden">
      <StepHeader 
        step="01C" 
        title="How should Johnny handle your calls?" 
        subtitle="Choose how you want Johnny to respond when someone calls your business. Select all that apply."
        onBack={handleBack}
        showBack={true}
      />

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Options */}
        <div className="flex-1 flex flex-col min-h-0 lg:w-[45%]">
          <div className="h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-br from-brand-50 to-purple-50 p-4 border-b border-brand-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                  <MessageSquare size={20} className="text-brand-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Call Handling Options</h3>
                  <p className="text-xs text-gray-600">Select all features you want Johnny to handle</p>
                </div>
              </div>
            </div>

            {/* Options List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {options.map((option, index) => {
                const isSelected = selectedOptions.includes(option.id);
                const Icon = option.icon;

                return (
                  <div
                    key={option.id}
                    onClick={() => handleToggleOption(option.id)}
                    className={`group relative rounded-xl p-4 border transition-all cursor-pointer overflow-hidden ${
                      isSelected 
                        ? 'border-brand-400 bg-gradient-to-br from-brand-50 via-purple-50 to-brand-50 ring-2 ring-brand-200 shadow-lg shadow-brand-100' 
                        : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-md hover:bg-gradient-to-br hover:from-gray-50 hover:to-brand-50/30'
                    }`}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-brand-400 to-purple-400 rounded-full blur-3xl transform translate-x-12 -translate-y-12"></div>
                    </div>

                    <div className="relative flex items-start gap-3">
                      {/* Icon */}
                      <div className={`relative w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isSelected 
                          ? 'bg-gradient-to-br from-brand-500 to-brand-600 shadow-md shadow-brand-300' 
                          : 'bg-brand-50 group-hover:bg-brand-100'
                      }`}>
                        {isSelected && (
                          <div className="absolute inset-0 rounded-lg bg-brand-400 opacity-30 animate-ping"></div>
                        )}
                        <Icon size={20} className={`relative z-10 ${isSelected ? 'text-white' : 'text-brand-600'}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 mb-1">{option.title}</h3>
                        <p className="text-[11px] text-gray-600 leading-relaxed">{option.description}</p>
                      </div>

                      {/* Checkmark */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-md ${
                        isSelected 
                          ? 'bg-gradient-to-br from-brand-500 to-brand-600 scale-100' 
                          : 'bg-gray-200 scale-90'
                      }`}>
                        {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                      </div>
                    </div>

                    {/* Bottom Accent Line */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-brand-500 via-purple-500 to-brand-500' 
                        : 'bg-transparent group-hover:bg-gradient-to-r group-hover:from-brand-300 group-hover:to-purple-300'
                    }`}></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selection Summary */}
        <div className="flex-1 flex flex-col min-h-0 lg:w-[55%]">
          <div className="h-full bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Info Section */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
              <div className="text-center max-w-md w-full my-auto">
                {selectedOptions.length > 0 ? (
                  <>
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/30">
                      <div className="absolute inset-0 rounded-2xl bg-brand-400 opacity-30 animate-ping"></div>
                      <Check size={40} className="text-white relative z-10" strokeWidth={3} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedOptions.length === 1 ? "Just One? Really?" : 
                       selectedOptions.length === 2 ? "Getting Better!" : 
                       "Wow, Going All In!"}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {selectedOptions.length === 1 ? 
                        "I mean... Johnny can do more than that. But hey, baby steps, right?" :
                       selectedOptions.length === 2 ? 
                        "Nice! Two features selected. You're warming up. Why not go for the hat-trick?" :
                        "Look at you, maxing out! Johnny's gonna be busier than a one-armed wallpaper hanger!"}
                    </p>
                    
                    {/* Selected Items List */}
                    <div className="space-y-2">
                      {selectedOptions.map(optionId => {
                        const option = options.find(o => o.id === optionId);
                        if (!option) return null;
                        const Icon = option.icon;
                        return (
                          <div key={optionId} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-brand-100 hover:border-brand-200 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center flex-shrink-0">
                              <Icon size={16} className="text-white" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900 text-left">{option.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
                      <MessageSquare size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Pick Your Features</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Choose at least one option from the left. Don't be shy, Johnny can handle it!
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Continue Button - Fixed at bottom */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <button 
                onClick={handleContinue}
                disabled={selectedOptions.length === 0}
                className="w-full btn-primary-custom py-3 font-bold text-sm rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Continue <ArrowLeft size={16} className="rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepOneC;
