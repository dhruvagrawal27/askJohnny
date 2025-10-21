import { useState } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'

const Step3_Schedule = () => {
  const { state, dispatch, nextStep, prevStep } = useOnboarding()
  const [scheduleType, setScheduleType] = useState(state.data.step3.scheduleType)
  const [customSchedule, setCustomSchedule] = useState(
    state.data.step3.customSchedule || {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: '09:00', end: '17:00' },
      sunday: { enabled: false, start: '09:00', end: '17:00' }
    }
  )

  const days = [
    { key: 'monday', label: 'Monday', shortLabel: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
    { key: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
    { key: 'friday', label: 'Friday', shortLabel: 'Fri' },
    { key: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
    { key: 'sunday', label: 'Sunday', shortLabel: 'Sun' }
  ]

  const handleCustomScheduleChange = (day: string, field: string, value: any) => {
    setCustomSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const handleNext = () => {
    dispatch({
      type: 'UPDATE_STEP_DATA',
      payload: {
        step: 'step3',
        data: {
          scheduleType,
          customSchedule: scheduleType === 'custom' ? customSchedule : undefined
        }
      }
    })
    nextStep()
  }

  const scheduleOptions = [
    {
      id: 'business_hours',
      title: 'Business Hours Only',
      description: 'Answer calls during standard business hours (9 AM - 5 PM, Monday - Friday)',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      badge: 'Recommended',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    },
    {
      id: '24_7',
      title: '24/7 Coverage',
      description: 'Never miss a call - answer anytime, day or night for maximum availability',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      badge: 'Premium',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    {
      id: 'custom',
      title: 'Custom Schedule',
      description: 'Configure specific hours for each day to match your unique business needs',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      ),
      badge: 'Flexible',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-lg shadow-purple-200/50 mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-3">
          Call Answering Schedule
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Define when your AI assistant should be available to answer incoming calls
        </p>
      </div>

      {/* Schedule Options */}
      <div className="grid gap-6 mb-8">
        {scheduleOptions.map((option) => {
          const isSelected = scheduleType === option.id
          return (
            <div
              key={option.id}
              className={`relative group cursor-pointer transition-all duration-300 ${
                isSelected 
                  ? 'transform scale-[1.02]' 
                  : 'hover:transform hover:scale-[1.01]'
              }`}
              onClick={() => setScheduleType(option.id as any)}
            >
              {/* Selection Glow Effect */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl blur-lg"></div>
              )}
              
              <div className={`relative bg-white border-2 rounded-xl p-6 transition-all duration-300 shadow-sm hover:shadow-lg ${
                isSelected 
                  ? 'border-purple-500/60 shadow-purple-100/50' 
                  : 'border-purple-100/60 hover:border-purple-300/70 hover:shadow-purple-50/50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Custom Radio Button */}
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 border-purple-600 shadow-lg shadow-purple-200/50'
                        : 'border-purple-200 hover:border-purple-400 bg-white'
                    }`}>
                      {isSelected && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                          isSelected 
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-200/50' 
                            : 'bg-slate-100 text-slate-500 group-hover:bg-purple-50 group-hover:text-purple-600'
                        }`}>
                          {option.icon}
                        </div>
                        
                        {/* Title and Badge */}
                        <div className="flex items-center space-x-3">
                          <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                            isSelected ? 'text-purple-800' : 'text-slate-800 group-hover:text-purple-700'
                          }`}>
                            {option.title}
                          </h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${option.badgeColor}`}>
                            {option.badge}
                          </span>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className={`text-sm leading-relaxed transition-colors duration-200 ${
                        isSelected ? 'text-slate-700' : 'text-slate-600'
                      }`}>
                        {option.description}
                      </p>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  <div className={`flex-shrink-0 transition-all duration-200 ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                  }`}>
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Custom Schedule Configuration */}
      {scheduleType === 'custom' && (
        <div className="bg-gradient-to-r from-purple-50/80 to-purple-100/40 border border-purple-200/60 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-purple-900">Configure Your Schedule</h3>
          </div>
          
          <div className="grid gap-4">
            {days.map((day) => {
              const dayData = customSchedule[day.key as keyof typeof customSchedule]
              return (
                <div key={day.key} className="bg-white/70 border border-purple-100/50 rounded-lg p-4 transition-all duration-200 hover:bg-white/90">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Day Toggle */}
                      <div className="flex items-center space-x-3 min-w-[140px]">
                        <div className={`relative w-12 h-6 rounded-full transition-all duration-200 cursor-pointer ${
                          dayData.enabled 
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg shadow-purple-200/50' 
                            : 'bg-slate-200'
                        }`}
                        onClick={() => handleCustomScheduleChange(day.key, 'enabled', !dayData.enabled)}>
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-200 shadow-sm ${
                            dayData.enabled ? 'left-6' : 'left-0.5'
                          }`}></div>
                        </div>
                        <label className={`text-sm font-medium cursor-pointer transition-colors duration-200 ${
                          dayData.enabled ? 'text-slate-800' : 'text-slate-500'
                        }`}>
                          {day.label}
                        </label>
                      </div>
                      
                      {/* Day Badge */}
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-200 ${
                        dayData.enabled 
                          ? 'bg-purple-100 text-purple-700 border-purple-200/60' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {day.shortLabel}
                      </div>
                    </div>
                    
                    {/* Time Inputs */}
                    {dayData.enabled && (
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-slate-600 font-medium">From</label>
                          <input
                            type="time"
                            value={dayData.start}
                            onChange={(e) => handleCustomScheduleChange(day.key, 'start', e.target.value)}
                            className="px-3 py-2 border border-purple-200/60 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          />
                        </div>
                        <div className="text-slate-400 font-medium">to</div>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-slate-600 font-medium">To</label>
                          <input
                            type="time"
                            value={dayData.end}
                            onChange={(e) => handleCustomScheduleChange(day.key, 'end', e.target.value)}
                            className="px-3 py-2 border border-purple-200/60 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Closed State */}
                    {!dayData.enabled && (
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-sm font-medium border border-slate-200">
                          Closed
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-purple-200/40">
            <div className="text-sm text-purple-700 font-medium">Quick Actions:</div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const allEnabled = { ...customSchedule }
                  Object.keys(allEnabled).forEach(day => {
                    allEnabled[day as keyof typeof allEnabled].enabled = true
                  })
                  setCustomSchedule(allEnabled)
                }}
                className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Enable All
              </button>
              <button
                onClick={() => {
                  const allDisabled = { ...customSchedule }
                  Object.keys(allDisabled).forEach(day => {
                    allDisabled[day as keyof typeof allDisabled].enabled = false
                  })
                  setCustomSchedule(allDisabled)
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Disable All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Preview */}
      {scheduleType && (
        <div className="bg-white border border-purple-100/60 rounded-xl p-6 mb-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Schedule Preview
          </h3>
          
          <div className="bg-gradient-to-r from-slate-50 to-purple-50/30 rounded-lg p-4 border border-slate-200/50">
            {scheduleType === 'business_hours' && (
              <div className="text-center">
                <p className="text-slate-700 font-medium">Monday - Friday: 9:00 AM - 5:00 PM</p>
                <p className="text-slate-500 text-sm mt-1">Weekends: Closed</p>
              </div>
            )}
            
            {scheduleType === '24_7' && (
              <div className="text-center">
                <p className="text-slate-700 font-medium">Available 24/7</p>
                <p className="text-slate-500 text-sm mt-1">Never miss a call</p>
              </div>
            )}
            
            {scheduleType === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                {days.map((day) => {
                  const dayData = customSchedule[day.key as keyof typeof customSchedule]
                  return (
                    <div key={day.key} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">{day.shortLabel}:</span>
                      <span className={`text-sm ${dayData.enabled ? 'text-slate-700' : 'text-slate-400'}`}>
                        {dayData.enabled ? `${dayData.start} - ${dayData.end}` : 'Closed'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevStep}
          className="group flex items-center px-6 py-3 bg-white border border-purple-200/60 text-purple-700 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:border-purple-300/70 hover:bg-purple-50/50"
        >
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Back
        </button>
        
        <button
          onClick={handleNext}
          className="group relative px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50 hover:from-purple-700 hover:to-purple-800 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="flex items-center">
            Continue Setup
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  )
}

export default Step3_Schedule