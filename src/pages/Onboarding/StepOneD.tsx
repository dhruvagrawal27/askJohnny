import React, { useState } from 'react';
import { ArrowLeft, Sun, Clock as ClockIcon, CalendarClock, Check, X } from 'lucide-react';
import { StepProps } from './types';
import { StepHeader, ContentContainer } from './SharedComponents';

interface DaySchedule {
  enabled: boolean;
  openTime: string;
  closeTime: string;
}

interface CustomSchedule {
  [key: string]: DaySchedule;
}

const StepOneD: React.FC<StepProps> = ({ state, setState, handleNext, handleBack }) => {
  const [selectedSchedule, setSelectedSchedule] = useState<string>(
    state.callSchedule || ''
  );
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customSchedule, setCustomSchedule] = useState<CustomSchedule>(
    state.customSchedule || {
      monday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
      tuesday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
      wednesday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
      thursday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
      friday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
      saturday: { enabled: false, openTime: '09:00', closeTime: '17:00' },
      sunday: { enabled: false, openTime: '09:00', closeTime: '17:00' }
    }
  );

  const scheduleOptions = [
    {
      id: 'business_hours',
      icon: Sun,
      title: 'Business Hours Only',
      description: "Johnny will answer your calls during your specified business hours.",
      color: 'orange',
      recommended: true
    },
    {
      id: '24_7',
      icon: ClockIcon,
      title: '24/7 Coverage',
      description: "Johnny will answer your calls 24 hours a day, 7 days a week.",
      color: 'blue'
    },
    {
      id: 'custom',
      icon: CalendarClock,
      title: 'Custom Schedule',
      description: "Create a custom schedule with different hours for different days of the week.",
      color: 'purple'
    }
  ];

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const handleSelectSchedule = (scheduleId: string) => {
    setSelectedSchedule(scheduleId);
    if (scheduleId === 'custom') {
      setShowCustomModal(true);
    }
  };

  const handleDayToggle = (day: string) => {
    setCustomSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled
      }
    }));
  };

  const handleTimeChange = (day: string, field: 'openTime' | 'closeTime', value: string) => {
    setCustomSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSaveCustomSchedule = () => {
    setShowCustomModal(false);
  };

  const handleContinue = () => {
    if (!selectedSchedule) {
      alert('Please select a schedule option');
      return;
    }
    setState(prev => ({ 
      ...prev, 
      callSchedule: selectedSchedule,
      customSchedule: selectedSchedule === 'custom' ? customSchedule : undefined
    }));
    handleNext();
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      orange: {
        border: isSelected ? 'border-orange-500' : 'border-gray-200',
        bg: isSelected ? 'bg-orange-50' : 'bg-white',
        icon: isSelected ? 'bg-orange-500' : 'bg-orange-100',
        iconText: isSelected ? 'text-white' : 'text-orange-600',
        badge: 'bg-orange-100 text-orange-700',
        check: 'bg-orange-500'
      },
      blue: {
        border: isSelected ? 'border-blue-500' : 'border-gray-200',
        bg: isSelected ? 'bg-blue-50' : 'bg-white',
        icon: isSelected ? 'bg-blue-500' : 'bg-blue-100',
        iconText: isSelected ? 'text-white' : 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700',
        check: 'bg-blue-500'
      },
      purple: {
        border: isSelected ? 'border-purple-500' : 'border-gray-200',
        bg: isSelected ? 'bg-purple-50' : 'bg-white',
        icon: isSelected ? 'bg-purple-500' : 'bg-purple-100',
        iconText: isSelected ? 'text-white' : 'text-purple-600',
        badge: 'bg-purple-100 text-purple-700',
        check: 'bg-purple-500'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <>
      {/* Custom Schedule Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Custom Schedule</h2>
                <p className="text-sm text-gray-500 mt-1">Set different hours for each day of the week</p>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {daysOfWeek.map((day) => (
                  <div
                    key={day.key}
                    className={`border-2 rounded-xl p-4 transition-all ${
                      customSchedule[day.key].enabled
                        ? 'border-brand-200 bg-brand-50/30'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={customSchedule[day.key].enabled}
                            onChange={() => handleDayToggle(day.key)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                        <span className="font-bold text-gray-900">{day.label}</span>
                      </div>
                      {!customSchedule[day.key].enabled && (
                        <span className="text-sm text-gray-500 font-medium">Closed</span>
                      )}
                    </div>

                    {customSchedule[day.key].enabled && (
                      <div className="flex items-center gap-4 ml-14">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 font-medium mb-1 block">Open</label>
                          <input
                            type="time"
                            value={customSchedule[day.key].openTime}
                            onChange={(e) => handleTimeChange(day.key, 'openTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                          />
                        </div>
                        <span className="text-gray-400 mt-6">→</span>
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 font-medium mb-1 block">Close</label>
                          <input
                            type="time"
                            value={customSchedule[day.key].closeTime}
                            onChange={(e) => handleTimeChange(day.key, 'closeTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowCustomModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomSchedule}
                className="flex-1 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg hover:shadow-xl"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      <ContentContainer>
        <StepHeader 
          step="04" 
          title="When should Johnny answer calls?" 
          subtitle="Choose when you want Johnny to answer calls for your business."
          onBack={handleBack}
          showBack={true}
        />

        <div className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto pb-8">
        <div className="w-full max-w-3xl mx-auto space-y-4">
          {scheduleOptions.map((option) => {
            const isSelected = selectedSchedule === option.id;
            const colors = getColorClasses(option.color, isSelected);
            const Icon = option.icon;

            return (
              <div
                key={option.id}
                onClick={() => handleSelectSchedule(option.id)}
                className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${colors.border} ${colors.bg} hover:shadow-lg group`}
              >
                {option.recommended && (
                  <div className={`absolute -top-2.5 left-6 px-3 py-1 rounded-full text-[10px] font-bold ${colors.badge}`}>
                    RECOMMENDED
                  </div>
                )}
                
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

                  {/* Radio/Checkmark */}
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
            disabled={!selectedSchedule}
            className="w-full btn-primary-custom py-4 font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Continue <ArrowLeft size={16} className="rotate-180" />
          </button>
        </div>
      </div>
    </ContentContainer>
    </>
  );
};

export default StepOneD;
