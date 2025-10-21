import { useState } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'

const pricingPlans = [
  {
    id: 'starter',
    title: 'Starter',
    price: 29,
    description: 'Perfect for small businesses',
    features: [
      'Basic voicemail replacement',
      'Appointment scheduling',
      'FAQ answering',
      'Business hours coverage',
      'Email support'
    ]
  },
  {
    id: 'professional',
    title: 'Professional',
    price: 79,
    description: 'Ideal for growing businesses',
    features: [
      'Everything in Starter',
      '24/7 call coverage',
      'Advanced scheduling',
      'Custom voice training',
      'Priority support',
      'Analytics dashboard'
    ]
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    price: 199,
    description: 'For large organizations',
    features: [
      'Everything in Professional',
      'Custom integrations',
      'Dedicated account manager',
      'Advanced analytics',
      'White-label options',
      'API access'
    ]
  }
]

const Step5_Pricing = () => {
  const { state, dispatch, nextStep } = useOnboarding()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePlanSelect = async (planId: string) => {
    setIsProcessing(true)
    setError(null)

    try {
      console.log('Selecting plan:', planId)
      
      // Update the selected plan in context with correct structure
      dispatch({
        type: 'UPDATE_STEP_DATA',
        payload: { 
          step: 'step5', 
          data: { selectedPlan: planId }
        }
      })

      console.log('Plan selected successfully:', planId)

      // Small delay for better UX
      setTimeout(() => {
        console.log('Moving to next step...')
        nextStep() // This should navigate to step 6
        setIsProcessing(false)
      }, 800)

    } catch (error) {
      console.error('Error selecting plan:', error)
      setError('Failed to select plan. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50/30 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/25 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700 bg-clip-text text-transparent mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
            Select the perfect plan for your business needs and unlock the power of AI-driven customer service.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 max-w-md mx-auto">
            <div className="bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mb-8 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-purple-100">
              <div className="flex items-center space-x-3 text-purple-700">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent"></div>
                <span className="font-medium">Processing your selection...</span>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {pricingPlans.map((plan, index) => {
            const isSelected = state.data.step5?.selectedPlan === plan.id
            const isProfessional = plan.id === 'professional'
            
            return (
              <div
                key={plan.id}
                className={`
                  relative group cursor-pointer transition-all duration-300 transform
                  ${isProcessing ? 'pointer-events-none opacity-70' : 'hover:-translate-y-2'}
                  ${isProfessional ? 'lg:-mt-4 lg:mb-4' : ''}
                `}
                onClick={() => !isProcessing && handlePlanSelect(plan.id)}
              >
                {/* Most Popular Badge */}
                {isProfessional && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Card */}
                <div className={`
                  relative h-full bg-white/70 backdrop-blur-sm rounded-3xl border-2 transition-all duration-300
                  shadow-xl hover:shadow-2xl overflow-hidden
                  ${isSelected 
                    ? 'border-purple-400 bg-gradient-to-br from-purple-50/80 to-white/80 shadow-purple-500/20' 
                    : 'border-purple-100 hover:border-purple-300 hover:shadow-purple-500/10'
                  }
                  ${isProfessional ? 'border-purple-300 shadow-purple-500/15' : ''}
                `}>
                  
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-transparent to-purple-50/10 rounded-3xl"></div>
                  
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-6 right-6 w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="relative p-8">
                    {/* Plan Header */}
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">{plan.title}</h3>
                      <div className="mb-4">
                        <span className="text-5xl font-bold bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">
                          ${plan.price}
                        </span>
                        <span className="text-slate-600 text-lg font-medium">/month</span>
                      </div>
                      <p className="text-slate-600 font-medium">{plan.description}</p>
                    </div>
                    
                    {/* Features List */}
                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start">
                          <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-slate-700 font-medium leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Select Button */}
                    <button
                      className={`
                        w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200
                        focus:outline-none focus:ring-4 focus:ring-purple-200
                        shadow-md hover:shadow-lg transform hover:-translate-y-0.5
                        ${isSelected
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-500/25'
                          : isProfessional
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-purple-500/20'
                          : 'bg-white/80 backdrop-blur-sm text-purple-700 border-2 border-purple-200 hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-700 hover:text-white hover:border-purple-600'
                        }
                      `}
                      disabled={isProcessing}
                    >
                      {isSelected ? (
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Selected
                        </span>
                      ) : (
                        'Select Plan'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Free Trial Banner */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-purple-100/80 to-white/80 backdrop-blur-sm border-2 border-purple-200/70 rounded-2xl p-6 shadow-lg shadow-purple-500/10">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-2xl">🎉</span>
            </div>
            <p className="text-purple-800 font-bold text-lg">
              Start with a 7-day free trial on any plan!
            </p>
            <p className="text-purple-600 text-sm mt-1">
              No credit card required • Cancel anytime
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-slate-600 font-medium">
            Click on any plan to continue to account setup
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mt-10 flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
            <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
            <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
            <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full shadow-sm"></div>
            <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step5_Pricing