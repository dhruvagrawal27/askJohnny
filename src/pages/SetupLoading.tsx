import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useOnboarding, ONBOARDING_STORAGE_KEY } from '../context/OnboardingContext'
import { supabase } from '../lib/supabaseClient'
import { syncClerkUserToSupabase } from '../lib/clerkWebhook'

interface OnboardingData {
  step1?: any
  step2?: any
  step3?: any
  step3b?: any
  step4?: any
  step5?: any
  business?: any        // New onboarding structure
  servicePreference?: any
  faqData?: any
}

const SetupLoading = () => {
  const { user, isSignedIn, isLoaded } = useUser()
  const { state, dispatch } = useOnboarding()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [status, setStatus] = useState('Initializing your account...')
  const [error, setError] = useState<string | null>(null)
  const hasRunRef = useRef(false)

  const steps = [
    'Creating user account...',
    'Setting up business profile...',
    'Configuring call preferences...',
    'Activating subscription...',
    'Training AI agent...',
    'Finalizing setup...',
    'Complete! Redirecting to dashboard...'
  ]

  useEffect(() => {
    console.log('🔄 SetupLoading - Initial check:', { isLoaded, isSignedIn, hasRun: hasRunRef.current });
    
    // Prevent multiple runs
    if (hasRunRef.current) {
      console.log('⚠️ Setup already running, skipping...');
      return;
    }
    
    if (isLoaded && isSignedIn && user) {
      console.log('✅ User authenticated, starting setup process...');
      console.log('👤 User info:', { id: user.id, email: user.emailAddresses[0]?.emailAddress });
      
      // First restore data from localStorage if needed
      restoreOnboardingData()
      // Then start setup
      setupUserAccount()
      hasRunRef.current = true
    } else if (isLoaded && !isSignedIn) {
      console.log('❌ User not signed in, redirecting to home...');
      // Not signed in, redirect to home
      navigate('/')
    } else {
      console.log('⏳ Still loading auth state...');
    }
  }, [isLoaded, isSignedIn, user])

  const restoreOnboardingData = () => {
    try {
      // Try to get onboarding data from new format first
      let stored = localStorage.getItem('onboarding_data')
      
      // Fallback to old format
      if (!stored) {
        stored = localStorage.getItem(ONBOARDING_STORAGE_KEY)
      }
      
      // Also try the new_onboarding_data format
      if (!stored) {
        stored = localStorage.getItem('new_onboarding_data')
      }
      
      if (stored) {
        const parsedData = JSON.parse(stored)
        console.log('Restoring onboarding data from localStorage:', parsedData)
        
        // Restore each step if context is empty
        if (!state.data.step1?.businessName && parsedData.step1) {
          dispatch({
            type: 'UPDATE_STEP_DATA',
            payload: { step: 'step1', data: parsedData.step1 }
          })
        }
        if (!state.data.step2 && parsedData.step2) {
          dispatch({
            type: 'UPDATE_STEP_DATA',
            payload: { step: 'step2', data: parsedData.step2 }
          })
        }
        if (!state.data.step3 && parsedData.step3) {
          dispatch({
            type: 'UPDATE_STEP_DATA',
            payload: { step: 'step3', data: parsedData.step3 }
          })
        }
        if (!state.data.step4 && parsedData.step4) {
          dispatch({
            type: 'UPDATE_STEP_DATA',
            payload: { step: 'step4', data: parsedData.step4 }
          })
        }
        if (!state.data.step3b && parsedData.step3b) {
          dispatch({
            type: 'UPDATE_STEP_DATA',
            payload: { step: 'step3b', data: parsedData.step3b }
          })
        }
        if (!state.data.step5?.selectedPlan && parsedData.step5) {
          dispatch({
            type: 'UPDATE_STEP_DATA',
            payload: { step: 'step5', data: parsedData.step5 }
          })
        }
      }
    } catch (err) {
      console.warn('Could not restore onboarding data:', err)
    }
  }

  const setupUserAccount = async () => {
    if (!user) {
      console.error('❌ User not found in setupUserAccount');
      setError('User not found')
      return
    }

    try {
      console.log('🚀 === STARTING SETUP PROCESS ===')
      console.log('👤 User ID:', user.id)
      console.log('📧 Email:', user.emailAddresses[0]?.emailAddress)

      // Get current onboarding data (either from context or localStorage)
      let onboardingData: OnboardingData = state.data
      
      // Fallback to localStorage if context is empty
      if (!onboardingData.step1?.businessName || !onboardingData.step5?.selectedPlan) {
        console.log('🔍 Context data incomplete, checking localStorage...');
        
        // Try multiple localStorage keys with debugging
        console.log('🔍 Checking all possible localStorage keys...');
        
        const keys = ['onboarding_data', ONBOARDING_STORAGE_KEY, 'new_onboarding_data', 'selectedBusiness', 'onboarding_business'];
        keys.forEach(key => {
          const value = localStorage.getItem(key);
          console.log(`📦 ${key}:`, value ? 'EXISTS' : 'NOT FOUND');
          if (value) {
            try {
              const parsed = JSON.parse(value);
              console.log(`📋 ${key} content:`, parsed);
            } catch (e) {
              console.log(`❌ ${key} not valid JSON:`, value);
            }
          }
        });
        
        let stored = localStorage.getItem('onboarding_data')
        if (!stored) {
          stored = localStorage.getItem(ONBOARDING_STORAGE_KEY)
        }
        if (!stored) {
          stored = localStorage.getItem('new_onboarding_data')
        }
        
        if (stored) {
          const parsedData = JSON.parse(stored)
          console.log('📦 Using onboarding data from localStorage:', parsedData)
          onboardingData = parsedData
        } else {
          // Try to reconstruct from individual pieces
          console.log('🔧 Attempting to reconstruct onboarding data from individual pieces...');
          
          const business = localStorage.getItem('onboarding_business') || localStorage.getItem('selectedBusiness');
          const servicePreference = localStorage.getItem('selectedPlan');
          const faqData = localStorage.getItem('businessFAQ');
          
          if (business) {
            console.log('🔧 Found business data, reconstructing...');
            const businessData = JSON.parse(business);
            
            onboardingData = {
              step1: {
                businessName: businessData.name,
                businessDetails: businessData
              },
              step2: {
                voicemail: true,
                scheduling: true,
                faq: true
              },
              step3: {
                scheduleType: 'business_hours'
              },
              step3b: {
                categoryId: 'other',
                categoryLabel: 'Other Business',
                answers: {}
              },
              step4: {},
              step5: {
                selectedPlan: 'starter'
              }
            };
            
            // Add service preference if available
            if (servicePreference) {
              const parsedPlan = JSON.parse(servicePreference);
              onboardingData.step5.selectedPlan = parsedPlan;
              onboardingData.step2 = {
                voicemail: parsedPlan === 'voicemail_handling' || parsedPlan === 'full_service',
                scheduling: parsedPlan === 'appointment_scheduling' || parsedPlan === 'full_service',
                faq: parsedPlan === 'basic_questions' || parsedPlan === 'full_service'
              };
            }
            
            // Add FAQ data if available
            if (faqData) {
              const parsedFAQ = JSON.parse(faqData);
              onboardingData.step3b = {
                categoryId: parsedFAQ.category || 'other',
                categoryLabel: 'Other Business',
                answers: parsedFAQ.answers || {}
              };
            }
            
            console.log('✅ Successfully reconstructed onboarding data:', onboardingData);
          } else {
            console.error('❌ No onboarding data found in localStorage!');
            throw new Error('Onboarding data not found. Please start the onboarding process again.');
          }
        }
      }

      console.log('📋 Final onboarding data being used:', onboardingData)

      // Check if phone number is available - updated for new onboarding structure
      const hasPhoneNumber = onboardingData.business?.phone ||  // New structure
                           onboardingData.step1?.phone ||     // Alternative structure  
                           onboardingData.step1?.businessDetails?.phone || 
                           onboardingData.step1?.businessDetails?.formatted_phone_number ||
                           onboardingData.step4?.phone;
      
      console.log('📞 Phone number check:', {
        newBusinessPhone: onboardingData.business?.phone,
        step1Phone: onboardingData.step1?.phone,
        step1BusinessPhone: onboardingData.step1?.businessDetails?.phone,
        step1Formatted: onboardingData.step1?.businessDetails?.formatted_phone_number,
        step4Phone: onboardingData.step4?.phone,
        hasPhoneNumber,
        fullBusinessData: onboardingData.business
      });
      
      if (!hasPhoneNumber) {
        console.log('⚠️ No phone number found in onboarding data');
        console.log('📋 Available onboarding data structure:', JSON.stringify(onboardingData, null, 2));
        
        // Try to continue without phone number for now - it can be added later
        console.log('🚀 Continuing setup without phone number - can be added later from dashboard');
      }

      // Validate required data - check both new and old structures
      const businessName = onboardingData.business?.name ||     // New structure
                          onboardingData.step1?.businessName ||  // Old structure
                          onboardingData.step1?.name;

      if (!businessName) {
        console.error('❌ Missing business name in onboarding data:', onboardingData);
        throw new Error('Business information is missing. Please complete the onboarding process again.');
      }
      
      // Use default plan if not provided
      const selectedPlan = onboardingData.step5?.selectedPlan || 'starter';
      console.log('💰 Using plan:', selectedPlan);

      // Step 1: Create/Get User Record
      console.log('📝 Step 1: Creating/updating user record...');
      setCurrentStep(1)
      setStatus(steps[0])
      await sleep(1500)

      let userId
      console.log('🔄 Ensuring user exists in Supabase...')
      
      // Use the sync function to ensure user exists
      const userEmail = user.emailAddresses[0]?.emailAddress || ''
      const syncedUser = await syncClerkUserToSupabase(user.id, userEmail)
      userId = syncedUser.id
      
      console.log('✅ User ready in Supabase:', userId)

      // Step 2: Save Business Profile
      console.log('🏢 Step 2: Saving business profile...');
      setCurrentStep(2)
      setStatus(steps[1])
      await sleep(1500)

      const businessDetails = onboardingData.step1?.businessDetails || {};
      
      const businessData = {
        user_id: userId,
        business_name: businessDetails.name || businessName,
        address: businessDetails.formatted_address || '',
        phone: businessDetails.phone || '',
        hours: businessDetails.openingHours?.weekday_text?.join(', ') || '',
        business_category: onboardingData.step3b?.categoryId || 'other',
        category_answers: onboardingData.step3b?.answers || {},
      }

      console.log('💾 Business data to save:', businessData)

      const { error: businessError } = await supabase
        .from('business_profiles')
        .upsert(businessData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })

      if (businessError) {
        console.error('❌ Business profile error:', businessError);
        throw new Error(`Failed to save business profile: ${businessError.message}`)
      }
      
      console.log('✅ Business profile saved successfully');

      // Step 3: Save Call Preferences
      console.log('📞 Step 3: Saving call preferences...');
      setCurrentStep(3)
      setStatus(steps[2])
      await sleep(1500)

      const preferencesData = {
        user_id: userId,
        voicemail: onboardingData.step2?.voicemail || false,
        scheduling: onboardingData.step2?.scheduling || false,
        faq: onboardingData.step2?.faq || false,
        schedule_type: onboardingData.step3?.scheduleType || 'business_hours',
        custom_schedule: onboardingData.step3?.customSchedule || {},
      }

      console.log('💾 Call preferences data to save:', preferencesData)

      const { error: preferencesError } = await supabase
        .from('call_preferences')
        .upsert(preferencesData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })

      if (preferencesError) {
        console.error('❌ Call preferences error:', preferencesError);
        throw new Error(`Failed to save call preferences: ${preferencesError.message}`)
      }
      
      console.log('✅ Call preferences saved successfully');

      // Step 4: Save Subscription
      console.log('💳 Step 4: Saving subscription...');
      setCurrentStep(4)
      setStatus(steps[3])
      await sleep(1500)

      const subscriptionData = {
        user_id: userId,
        plan_name: selectedPlan,
        price: getPlanPrice(selectedPlan),
        billing_cycle: 'monthly',
        start_date: new Date().toISOString(),
        status: 'active'
      }

      console.log('💾 Subscription data to save:', subscriptionData)

      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert(subscriptionData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })

      if (subscriptionError) {
        console.error('❌ Subscription error:', subscriptionError);
        throw new Error(`Failed to save subscription: ${subscriptionError.message}`)
      }
      
      console.log('✅ Subscription saved successfully');

      // Step 5: Train AI Agent
      console.log('🤖 Step 5: Training AI agent...');
      setCurrentStep(5)
      setStatus(steps[4])
      await sleep(1500)

      try {
        const phoneNumber = onboardingData.business?.phone ||  // New structure
                           onboardingData.step1?.phone ||     // Alternative
                           onboardingData.step1?.businessDetails?.phone || 
                           onboardingData.step1?.businessDetails?.formatted_phone_number ||
                           onboardingData.step4?.phone ||
                           ''; // Allow empty phone number

        // Format FAQ data properly with questions and answers
        const faqData = onboardingData.step3b || {};
        const formattedFAQData = formatFAQData(faqData);

        // Get businessDetails in the exact format required
        const businessDetails = onboardingData.step1?.businessDetails || {};
        
        const agentPayload = {
          user_id: user.id,
          user_email: user.emailAddresses[0]?.emailAddress || '',
          business_name: businessName,
          phone_number: phoneNumber,
          plan_name: selectedPlan,
          timestamp: new Date().toISOString(),
          businessDetails: businessDetails,
          faqData: formattedFAQData
        };

        console.log('🚀 Calling agent training webhook...');
        console.log('📡 Webhook payload:', agentPayload);

        const webhookResponse = await fetch(
          "https://glowing-g79w8.crab.containers.automata.host/webhook/f61980c4-6159-42a0-91ed-08b36ecc136c",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(agentPayload),
          }
        );

        if (!webhookResponse.ok) {
          console.error('❌ Webhook failed:', webhookResponse.status, webhookResponse.statusText);
          const errorText = await webhookResponse.text();
          console.error('❌ Webhook error response:', errorText);
          throw new Error(`Agent training failed: ${webhookResponse.status} - ${errorText}`);
        }

        const webhookData = await webhookResponse.json();
        console.log('✅ Agent training webhook response:', webhookData);

        // Process and save the agent webhook response using the data service
        if (webhookData && (Array.isArray(webhookData) ? webhookData.length > 0 : webhookData.id)) {
          console.log('📝 Processing agent webhook response with data service...');
          try {
            // Import the processAgentWebhookResponse function
            const { processAgentWebhookResponse } = await import('../lib/dataService');
            
            // Process the webhook response to update the user with agent info
            const updatedUserData = await processAgentWebhookResponse(user.id, webhookData);
            console.log('✅ Agent information processed and saved:', updatedUserData);
          } catch (agentProcessError) {
            console.error('❌ Error processing agent webhook response:', agentProcessError);
            
            // Fallback: Extract data manually and update directly
            const agent = Array.isArray(webhookData) ? webhookData[0] : webhookData;
            if (agent && agent.id) {
              console.log('📝 Fallback: Updating user with agent information directly...');
              const { error: agentUpdateError } = await supabase
                .from('users')
                .update({
                  agent_id: agent.id,
                  agent_name: agent.name || null,
                  agent_status: agent.status || 'active',
                  phone_id: agent.phoneid || agent.phone_id || null,
                  phone_number: agent.phone_number || null,
                  updated_at: new Date().toISOString()
                })
                .eq('id', userId);

              if (agentUpdateError) {
                console.warn('⚠️ Could not update user with agent info:', agentUpdateError);
              } else {
                console.log('✅ User updated with agent information via fallback');
              }
            }
          }
        }

      } catch (webhookError) {
        console.error('❌ Agent training webhook error:', webhookError);
        // Don't fail the entire setup process if webhook fails
        console.warn('⚠️ Continuing setup without agent training - can be done later from dashboard');
      }

      // Step 6: Save Comprehensive Onboarding Data (if table exists)
      console.log('📊 Step 6: Saving comprehensive onboarding data...');
      setCurrentStep(6)
      setStatus(steps[5])
      await sleep(1000)

      try {
        // Extract call_handling and call_schedule from step2 data
        const callHandlingArray = [];
        if (onboardingData.step2?.voicemail) callHandlingArray.push('voicemail');
        if (onboardingData.step2?.scheduling) callHandlingArray.push('scheduling');
        if (onboardingData.step2?.faq) callHandlingArray.push('faq');
        
        const onboardingRecord = {
          user_id: userId,
          step1_data: onboardingData.step1 || {},
          step2_data: onboardingData.step2 || {},
          step3_data: onboardingData.step3 || {},
          step3b_data: onboardingData.step3b || {},
          step4_data: onboardingData.step4 || {},
          step5_data: onboardingData.step5 || {},
          call_handling: callHandlingArray,
          call_schedule: onboardingData.step3?.scheduleType || 'business_hours',
          is_completed: true,
          completed_at: new Date().toISOString(),          
        }

        console.log('💾 Onboarding record to save:', onboardingRecord)

        const { error: onboardingError } = await supabase
          .from('onboarding_data')
          .upsert(onboardingRecord, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          })

        if (onboardingError) {
          console.warn('⚠️ Could not save onboarding data:', onboardingError)
          // Don't fail the entire process if this optional table fails
        } else {
          console.log('✅ Onboarding data saved successfully')
        }
      } catch (err) {
        console.warn('⚠️ Onboarding data table might not exist:', err)
        // Continue without failing
      }

      // Step 7: Complete
      console.log('🎉 Step 7: Finalizing setup...');
      setCurrentStep(7)
      setStatus(steps[6])
      await sleep(2000)

      console.log('🎊 === SETUP COMPLETE ===')
      
      // Clear all onboarding localStorage keys since data is now in database
      localStorage.removeItem(ONBOARDING_STORAGE_KEY)
      localStorage.removeItem('onboarding_data')
      localStorage.removeItem('new_onboarding_data')
      localStorage.removeItem('selectedBusiness')
      localStorage.removeItem('onboarding_business')
      localStorage.removeItem('selectedPlan')
      localStorage.removeItem('businessFAQ')
      
      console.log('🧹 Cleared localStorage');
      
      // Clear onboarding state
      dispatch({ type: 'RESET' })
      
      console.log('🎯 Redirecting to dashboard...');
      // Redirect to dashboard
      navigate('/dashboard')

    } catch (error) {
      console.error('💥 Setup error:', error)
      setError(error instanceof Error ? error.message : 'Setup failed')
      setCurrentStep(1)
    }
  }

  const formatFAQData = (faqData: any) => {
    if (!faqData || !faqData.categoryId || !faqData.answers) {
      return {};
    }

    // Get questions for the category
    const categoryQuestions = getCategoryQuestions(faqData.categoryId);
    
    // Create properly formatted question-answer pairs
    const questionsAndAnswers = categoryQuestions.map((question, index) => ({
      question: question,
      answer: faqData.answers[index] || ""
    }));

    return {
      category: faqData.categoryId,
      categoryLabel: getCategoryLabel(faqData.categoryId),
      questionsAndAnswers: questionsAndAnswers
    };
  }

  const getCategoryQuestions = (categoryId: string): string[] => {
    const categoryQuestionsMap: { [key: string]: string[] } = {
      restaurants: [
        "Is your restaurant vegetarian, non-vegetarian, or both? What cuisines do you specialize in?",
        "Do you offer specials like discounts, live music, big screen, outdoor seating, or happy hours?",
        "What type of establishment are you (cafe, casual, fine dining, bar)? Do you serve alcohol?",
      ],
      healthcare: [
        "What type of practice (general, dental, specialty, urgent care) and primary services?",
        "Do you accept insurance, offer payment plans, and what are after-hours procedures?",
        "Do you need confirmations, prescription refills, or telehealth support?",
      ],
      legal: [
        "What areas of law (injury, family, criminal, corporate)? Any emergency cases?",
        "Do you offer free consults, payment plans, or contingency fees?",
        "What is your intake process? Need document collection or case management support?",
      ],
      real_estate: [
        "Residential, commercial, or rentals? What areas do you serve?",
        "Services: buying, selling, property management, investments?",
        "Need lead qualification, showings, or follow-ups?",
      ],
      automotive: [
        "What services (repairs, maintenance, inspections, sales)? Specialize in types/brands?",
        "Do you offer emergency services, towing, rentals, or warranty work?",
        "Typical appointment duration? Provide estimates or parts ordering?",
      ],
      fitness: [
        "What type (gym, yoga, PT, dance) and what classes/services?",
        "Membership packages, PT, groups, or programs (seniors/beginners)?",
        "Peak hours, cancellation policies, equipment rentals or nutrition counseling?",
      ],
      others: [
        "What type of business and primary products/services customers ask about?",
        "Most popular products/services and pricing ranges? Any packages or promotions?",
        "What info do callers usually want (availability, delivery, rates, service areas, fees, booking)?",
      ],
    };
    
    return categoryQuestionsMap[categoryId] || categoryQuestionsMap.others;
  }

  const getCategoryLabel = (categoryId: string): string => {
    const categoryLabels: { [key: string]: string } = {
      restaurants: "Restaurants & Food Service",
      healthcare: "Healthcare & Medical",
      legal: "Legal & Law Firms",
      real_estate: "Real Estate",
      automotive: "Automotive Services",
      fitness: "Fitness & Wellness",
      others: "Other Business"
    };
    
    return categoryLabels[categoryId] || "Other Business";
  }

  const getPlanPrice = (planId: string): number => {
    console.log('💰 Getting price for plan:', planId);
    const prices = { 
      starter: 29,
      basic: 29,
      professional: 79,
      premium: 79,
      enterprise: 199,
      full_service: 149,
      voicemail_handling: 39,
      appointment_scheduling: 69,
      basic_questions: 29
    }
    const price = prices[planId as keyof typeof prices] || 29;
    console.log('💰 Plan price determined:', price);
    return price;
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const handleRetry = () => {
    setError(null)
    setCurrentStep(1)
    hasRunRef.current = false
    setupUserAccount()
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Setup Failed</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-semibold transition-colors shadow-md shadow-brand-500/30"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/onboarding')}
              className="w-full px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              Back to Onboarding
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-brand-100 to-brand-200 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-brand-500/20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-200 border-t-brand-600"></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Setting Up Your Account
          </h2>
          <p className="text-slate-600">
            Please wait while we configure everything for you...
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-center space-x-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-500 ${
                  index + 1 < currentStep
                    ? 'w-8 bg-brand-600 shadow-sm shadow-brand-500/50'
                    : index + 1 === currentStep
                    ? 'w-12 bg-gradient-to-r from-brand-500 to-brand-600 animate-pulse shadow-md shadow-brand-500/50'
                    : 'w-8 bg-slate-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-600 font-medium">{status}</p>
        </div>

        {/* Current step details */}
        {currentStep <= steps.length && (
          <div className="mb-6">
            <div className="bg-white rounded-xl p-5 border border-brand-100 shadow-lg shadow-brand-500/10">
              <p className="text-xs text-brand-600 font-semibold uppercase tracking-wide mb-2">Current Step</p>
              <p className="text-sm text-slate-800 font-medium">{steps[currentStep - 1]}</p>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="bg-gradient-to-r from-purple-50 to-brand-50 border border-brand-200 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-brand-700">⏳ Please don't close this window.</span><br />
            <span className="text-slate-600">This process usually takes 30-60 seconds.</span>
          </p>
        </div>

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-slate-100 rounded-lg">
            <p className="text-xs text-slate-600 mb-2">Debug Info:</p>
            <p className="text-xs text-slate-500">User ID: {user?.id}</p>
            <p className="text-xs text-slate-500">Step: {currentStep}</p>
            <p className="text-xs text-slate-500">Has Business Name: {state.data.step1?.businessName ? 'Yes' : 'No'}</p>
            <p className="text-xs text-slate-500">Has Plan: {state.data.step5?.selectedPlan ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SetupLoading