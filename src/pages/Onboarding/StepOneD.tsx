import React, { useState } from 'react';
import { ArrowLeft, Sun, Clock as ClockIcon, CalendarClock, Check, X, Sparkles } from 'lucide-react';
import { StepProps } from './types';
import { StepHeader } from './SharedComponents';

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
      description: "Johnny answers during your business hours. After hours? Voicemail time.",
      recommended: true
    },
    {
      id: '24_7',
      icon: ClockIcon,
      title: '24/7 Coverage',
      description: "Johnny never sleeps. Literally. He'll answer calls at 3 AM while you're dreaming.",
    },
    {
      id: 'custom',
      icon: CalendarClock,
      title: 'Custom Schedule',
      description: "Get fancy with different hours for each day. Johnny adapts to your schedule.",
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

  const getScheduleInfo = () => {
    if (!selectedSchedule) return null;
    
    const info = {
      business_hours: {
        title: "Smart Choice!",
        description: "Johnny will handle calls during business hours. After hours, he'll take messages or let voicemail handle it. Perfect for work-life balance.",
        icon: Sun
      },
      '24_7': {
        title: "Always On Duty!",
        description: "Johnny is ready to answer calls 24/7, even at 3 AM. Your customers will never hear a voicemail again. Johnny doesn't need sleep, coffee, or bathroom breaks.",
        icon: ClockIcon
      },
      custom: {
        title: "Schedule Maestro!",
        description: "You've configured a custom schedule. Johnny will adapt to your specific hours for each day of the week. Flexibility at its finest.",
        icon: CalendarClock
      }
    };
    
    return info[selectedSchedule as keyof typeof info];
  };

  const scheduleInfo = getScheduleInfo();

  return (
    <>
      {/* Custom Schedule Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-brand-50 to-purple-50 border-b border-brand-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarClock size={20} className="text-brand-600" />
                    <h2 className="text-xl font-bold text-gray-900">Custom Schedule</h2>
                  </div>
                  <p className="text-sm text-gray-600">Configure Johnny's working hours for each day</p>
                </div>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="p-2 hover:bg-white/80 rounded-lg transition-all"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {daysOfWeek.map((day) => (
                  <div
                    key={day.key}
                    className={`border-2 rounded-xl p-4 transition-all ${
                      customSchedule[day.key].enabled
                        ? 'border-brand-200 bg-gradient-to-br from-brand-50/50 to-purple-50/30 shadow-sm'
                        : 'border-gray-200 bg-gray-50/50'
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
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-100 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-brand-500 peer-checked:to-brand-600 shadow-inner"></div>
                        </label>
                        <span className="font-bold text-gray-900">{day.label}</span>
                      </div>
                      {!customSchedule[day.key].enabled && (
                        <span className="text-xs text-gray-500 font-semibold px-2 py-1 bg-gray-200 rounded-md">CLOSED</span>
                      )}
                    </div>

                    {customSchedule[day.key].enabled && (
                      <div className="flex items-center gap-3 ml-14">
                        <div className="flex-1">
                          <label className="text-xs text-gray-600 font-semibold mb-1.5 block">Opening Time</label>
                          <input
                            type="time"
                            value={customSchedule[day.key].openTime}
                            onChange={(e) => handleTimeChange(day.key, 'openTime', e.target.value)}
                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-white"
                          />
                        </div>
                        <span className="text-brand-400 font-bold mt-6">→</span>
                        <div className="flex-1">
                          <label className="text-xs text-gray-600 font-semibold mb-1.5 block">Closing Time</label>
                          <input
                            type="time"
                            value={customSchedule[day.key].closeTime}
                            onChange={(e) => handleTimeChange(day.key, 'closeTime', e.target.value)}
                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowCustomModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-white hover:border-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomSchedule}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-bold hover:from-brand-700 hover:to-brand-800 transition-all shadow-lg hover:shadow-xl"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 to-brand-50/30 flex flex-col">
        <div className="px-4 lg:px-6 py-3">
          <StepHeader 
            step="04" 
            title="When should Johnny answer calls?" 
            subtitle="Choose when you want Johnny to answer calls for your business."
            onBack={handleBack}
            showBack={true}
          />
        </div>

        {/* Two Column Container */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 px-4 lg:px-6 pb-4 min-h-0 overflow-hidden">
          {/* Left Column - Schedule Options */}
          <div className="flex-1 lg:w-[45%] flex flex-col min-h-0 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-br from-brand-50 to-white">
              <div className="flex items-center gap-2">
                <ClockIcon size={20} className="text-brand-600" />
                <h3 className="font-bold text-gray-900">Schedule Options</h3>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {scheduleOptions.map((option) => {
                const isSelected = selectedSchedule === option.id;
                const Icon = option.icon;

                return (
                  <div
                    key={option.id}
                    onClick={() => handleSelectSchedule(option.id)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group ${
                      isSelected 
                        ? 'border-brand-500 bg-gradient-to-br from-brand-50 to-purple-50 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-sm'
                    }`}
                  >
                    {option.recommended && (
                      <div className="absolute -top-2 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700 shadow-sm">
                        RECOMMENDED
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isSelected 
                          ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md' 
                          : 'bg-brand-50 text-brand-600'
                      }`}>
                        <Icon size={22} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 mb-1">{option.title}</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">{option.description}</p>
                      </div>

                      {/* Checkmark */}
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isSelected ? 'bg-brand-600 scale-100' : 'bg-gray-200 scale-90'
                      }`}>
                        {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Info & Continue */}
          <div className="flex-1 lg:w-[55%] flex flex-col min-h-0">
            <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
              {/* Info Section */}
              <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
                <div className="text-center max-w-md w-full my-auto">
                  {scheduleInfo ? (
                    <>
                      <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/30">
                        <div className="absolute inset-0 rounded-2xl bg-brand-400 opacity-30 animate-ping"></div>
                        {React.createElement(scheduleInfo.icon, { size: 40, className: "text-white relative z-10" })}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {scheduleInfo.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {scheduleInfo.description}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
                        <Sparkles size={32} className="text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Pick a Schedule</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        Select when Johnny should be answering your business calls. He's ready when you are!
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Continue Button */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleContinue}
                  disabled={!selectedSchedule}
                  className="w-full btn-primary-custom py-3.5 font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Continue <ArrowLeft size={16} className="rotate-180" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StepOneD;