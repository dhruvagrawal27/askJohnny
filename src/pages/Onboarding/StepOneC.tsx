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
      color: 'blue'
    },
    {
      id: 'scheduling',
      icon: Calendar,
      title: 'Appointment Scheduling',
      description: "Johnny will answer calls, take messages, and help callers schedule appointments on your calendar.",
      color: 'green'
    },
    {
      id: 'faq',
      icon: HelpCircle,
      title: 'FAQ Answering',
      description: "Johnny will answer common questions about your business, take messages, and schedule appointments.",
      color: 'purple'
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

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: {
        border: isSelected ? 'border-blue-500' : 'border-gray-200',
        bg: isSelected ? 'bg-blue-50' : 'bg-white',
        icon: isSelected ? 'bg-blue-500' : 'bg-blue-100',
        iconText: isSelected ? 'text-white' : 'text-blue-600',
        check: 'bg-blue-500'
      },
      green: {
        border: isSelected ? 'border-green-500' : 'border-gray-200',
        bg: isSelected ? 'bg-green-50' : 'bg-white',
        icon: isSelected ? 'bg-green-500' : 'bg-green-100',
        iconText: isSelected ? 'text-white' : 'text-green-600',
        check: 'bg-green-500'
      },
      purple: {
        border: isSelected ? 'border-purple-500' : 'border-gray-200',
        bg: isSelected ? 'bg-purple-50' : 'bg-white',
        icon: isSelected ? 'bg-purple-500' : 'bg-purple-100',
        iconText: isSelected ? 'text-white' : 'text-purple-600',
        check: 'bg-purple-500'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <ContentContainer>
      <StepHeader 
        step="03" 
        title="How should Johnny handle your calls?" 
        subtitle="Choose how you want Johnny to respond when someone calls your business. Select all that apply."
        onBack={handleBack}
        showBack={true}
      />

      <div className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto pb-8">
        <div className="w-full max-w-3xl mx-auto space-y-4">
          {options.map((option) => {
            const isSelected = selectedOptions.includes(option.id);
            const colors = getColorClasses(option.color, isSelected);
            const Icon = option.icon;

            return (
              <div
                key={option.id}
                onClick={() => handleToggleOption(option.id)}
                className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${colors.border} ${colors.bg} hover:shadow-lg group`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl ${colors.icon} ${colors.iconText} flex items-center justify-center flex-shrink-0 transition-all duration-300`}>
                    <Icon size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{option.description}</p>
                  </div>

                  {/* Checkmark */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isSelected ? `${colors.check} scale-100` : 'bg-gray-200 scale-90'
                  }`}>
                    {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="w-full max-w-3xl mx-auto mt-8">
          <button
            onClick={handleContinue}
            disabled={selectedOptions.length === 0}
            className="w-full btn-primary-custom py-4 font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Continue <ArrowLeft size={16} className="rotate-180" />
          </button>
        </div>
      </div>
    </ContentContainer>
  );
};

export default StepOneC;
