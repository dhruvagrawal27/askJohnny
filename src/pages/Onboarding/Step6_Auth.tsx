import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignUp, useUser } from '@clerk/clerk-react'
import { useOnboarding, ONBOARDING_STORAGE_KEY } from '../../context/OnboardingContext'

const Step6_Auth = () => {
  const { state, dispatch } = useOnboarding()
  const { user, isSignedIn, isLoaded } = useUser()
  const navigate = useNavigate()
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Ensure data is persisted to localStorage before authentication
  useEffect(() => {
    // Save current state to localStorage to ensure persistence through auth flow
    const dataToSave = {
      step1: state.data.step1,
      step2: state.data.step2,
      step3: state.data.step3,
      step3b: state.data.step3b,
      step4: state.data.step4,
      step5: state.data.step5
    }
    
    console.log('Saving onboarding data to localStorage before auth:', dataToSave)
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(dataToSave))
  }, [state.data])

  // Redirect to loading page when user signs up successfully
  useEffect(() => {
    if (isLoaded && isSignedIn && user && !isRedirecting) {
      console.log('User authenticated successfully!')
      console.log('User ID:', user.id)
      console.log('User Email:', user.emailAddresses[0]?.emailAddress)
      
      setIsRedirecting(true)
      
      // Small delay to ensure Clerk is fully loaded
      setTimeout(() => {
        console.log('Redirecting to loading page...')
        navigate('/setup-loading')
      }, 1000)
    }
  }, [isLoaded, isSignedIn, user, navigate, isRedirecting])

  // Validate that we have required data
  const hasRequiredData = state.data.step1?.businessName && state.data.step5?.selectedPlan

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Create Your Account</h2>
        <p className="text-lg text-slate-600">
          Almost there! Create your account to complete the setup.
        </p>
        {!hasRequiredData && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Warning: Some required information is missing. Please go back and complete all steps.
            </p>
          </div>
        )}
      </div>

      {isRedirecting && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center space-x-2 text-emerald-800">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
            <span>Account created successfully! Setting up your dashboard...</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="min-h-[400px]">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg w-full transition-colors duration-200',
                card: 'shadow-none border-none',
                headerTitle: 'text-2xl font-bold text-slate-900',
                headerSubtitle: 'text-slate-600',
                formFieldInput: 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500',
                footerActionLink: 'text-emerald-600 hover:text-emerald-700'
              },
              layout: {
                socialButtonsPlacement: 'bottom'
              }
            }}
            redirectUrl="/setup-loading"
            afterSignUpUrl="/setup-loading"
          />
        </div>

        {/* Setup Summary */}
        <div className="mt-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Setup Summary</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="block text-sm font-medium text-slate-700">Business Name</span>
                <span className="text-sm text-slate-600">
                  {state.data.step1?.businessName || 'Not set'}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-slate-700">Selected Plan</span>
                <span className="text-sm text-slate-600 capitalize">
                  {state.data.step5?.selectedPlan || 'Not selected'}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-slate-700">Contact Email</span>
                <span className="text-sm text-slate-600">
                  {state.data.step4?.email || 'Not provided'}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="block text-sm font-medium text-slate-700">Call Handling Features</span>
                <span className="text-sm text-slate-600">
                  {[
                    state.data.step2?.voicemail && 'Voicemail',
                    state.data.step2?.scheduling && 'Scheduling',
                    state.data.step2?.faq && 'FAQ'
                  ].filter(Boolean).join(', ') || 'Not configured'}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-slate-700">Schedule Type</span>
                <span className="text-sm text-slate-600">
                  {state.data.step3?.scheduleType || 'Not set'}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-slate-700">Business Hours</span>
                <span className="text-sm text-slate-600">
                  {state.data.step1?.businessDetails?.hours || 'Not set'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Data validation status */}
          <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
            <h4 className="text-sm font-medium text-slate-900 mb-2">Setup Validation</h4>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <div className={`w-2 h-2 rounded-full mr-2 ${state.data.step1?.businessName ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={state.data.step1?.businessName ? 'text-green-700' : 'text-red-700'}>
                  Business Name: {state.data.step1?.businessName ? 'Complete' : 'Missing'}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <div className={`w-2 h-2 rounded-full mr-2 ${state.data.step5?.selectedPlan ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={state.data.step5?.selectedPlan ? 'text-green-700' : 'text-red-700'}>
                  Plan Selection: {state.data.step5?.selectedPlan ? 'Complete' : 'Missing'}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <div className={`w-2 h-2 rounded-full mr-2 ${state.data.step4?.email ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className={state.data.step4?.email ? 'text-green-700' : 'text-yellow-700'}>
                  Contact Info: {state.data.step4?.email ? 'Complete' : 'Optional'}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <div className={`w-2 h-2 rounded-full mr-2 ${(state.data.step2?.voicemail || state.data.step2?.scheduling || state.data.step2?.faq) ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className={(state.data.step2?.voicemail || state.data.step2?.scheduling || state.data.step2?.faq) ? 'text-green-700' : 'text-yellow-700'}>
                  Call Handling: {(state.data.step2?.voicemail || state.data.step2?.scheduling || state.data.step2?.faq) ? 'Configured' : 'Basic Setup'}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <div className={`w-2 h-2 rounded-full mr-2 ${state.data.step3?.scheduleType ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className={state.data.step3?.scheduleType ? 'text-green-700' : 'text-yellow-700'}>
                  Schedule: {state.data.step3?.scheduleType ? 'Configured' : 'Default'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action needed warning */}
          {!hasRequiredData && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-2">Action Required</h4>
              <p className="text-sm text-red-700 mb-3">
                Please complete the missing required information before creating your account.
              </p>
              <button
                onClick={() => navigate('/onboarding')}
                className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Go Back to Complete Setup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Step6_Auth