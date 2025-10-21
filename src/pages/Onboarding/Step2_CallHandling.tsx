import { useState } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'

const Step2_CallHandling = () => {
  const { state, dispatch, nextStep, prevStep } = useOnboarding()
  const [preferences, setPreferences] = useState({
    voicemail: state.data.step2.voicemail,
    scheduling: state.data.step2.scheduling,
    faq: state.data.step2.faq
  })

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleNext = () => {
    dispatch({
      type: 'UPDATE_STEP_DATA',
      payload: {
        step: 'step2',
        data: preferences
      }
    })
    nextStep()
  }

  const isNextDisabled = !preferences.voicemail && !preferences.scheduling && !preferences.faq

  const callHandlingOptions = [
    {
      id: 'voicemail',
      title: 'Basic Voicemail Replacement',
      description: 'Answer calls, introduce your business, and take detailed messages for follow-up.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200/60',
      textColor: 'text-blue-700'
    },
    {
      id: 'scheduling',
      title: 'Appointment Scheduling',
      description: 'Help customers book appointments directly through phone calls with calendar integration.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200/60',
      textColor: 'text-emerald-700'
    },
    {
      id: 'faq',
      title: 'FAQ Answering',
      description: 'Provide instant answers to common questions and handle complex inquiries professionally.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-200/60',
      textColor: 'text-amber-700'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-lg shadow-purple-200/50 mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-3">
          Call Handling Preferences
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Configure how your AI assistant should handle incoming calls and interact with customers
        </p>
      </div>

      {/* Selection Notice */}
      <div className="bg-gradient-to-r from-purple-50/80 to-purple-100/40 border border-purple-200/60 rounded-xl p-4 mb-8 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-purple-800 font-medium">Choose at least one option</p>
            <p className="text-purple-700 text-sm">You can always modify these settings later in your dashboard</p>
          </div>
        </div>
      </div>

      {/* Call Handling Options */}
      <div className="grid gap-6 mb-10">
        {callHandlingOptions.map((option) => {
          const isSelected = preferences[option.id as keyof typeof preferences]
          return (
            <div
              key={option.id}
              className={`relative group cursor-pointer transition-all duration-300 ${
                isSelected 
                  ? 'transform scale-[1.02]' 
                  : 'hover:transform hover:scale-[1.01]'
              }`}
              onClick={() => handlePreferenceChange(option.id as keyof typeof preferences)}
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
                <div className="flex items-start space-x-4">
                  {/* Custom Checkbox */}
                  <div className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 border-purple-600 shadow-lg shadow-purple-200/50'
                      : 'border-purple-200 hover:border-purple-400 bg-white'
                  }`}>
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        isSelected 
                          ? `bg-gradient-to-r ${option.gradient} text-white shadow-lg` 
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                      }`}>
                        {option.icon}
                      </div>
                      
                      {/* Title */}
                      <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                        isSelected ? 'text-purple-800' : 'text-slate-800 group-hover:text-purple-700'
                      }`}>
                        {option.title}
                      </h3>
                    </div>
                    
                    {/* Description */}
                    <p className={`text-sm leading-relaxed transition-colors duration-200 ${
                      isSelected ? 'text-slate-700' : 'text-slate-600'
                    }`}>
                      {option.description}
                    </p>
                  </div>

                  {/* Selection Indicator */}
                  <div className={`flex-shrink-0 transition-all duration-200 ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                  }`}>
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Error State */}
      {isNextDisabled && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/60 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.872-.833-2.64 0L3.173 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-red-700 font-medium">Please select at least one option</p>
              <p className="text-red-600 text-sm">Choose how you'd like your AI assistant to handle calls</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-2">
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
          disabled={isNextDisabled}
          className="group relative px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
        >
          <span className="flex items-center">
            Continue Setup
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform duration-200 group-disabled:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
          
          {/* Disabled overlay */}
          {isNextDisabled && (
            <div className="absolute inset-0 bg-slate-200/50 rounded-xl flex items-center justify-center">
              <span className="text-slate-500 text-sm font-medium">Select an option to continue</span>
            </div>
          )}
        </button>
      </div>

      {/* Selected Count Indicator */}
      {(preferences.voicemail || preferences.scheduling || preferences.faq) && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100/80 to-purple-200/40 border border-purple-200/60 rounded-full shadow-sm">
            <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium text-purple-700">
              {Object.values(preferences).filter(Boolean).length} of 3 options selected
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Step2_CallHandling