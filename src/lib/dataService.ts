// src/lib/dataService.ts
// Data service layer to replace MongoDB backend calls
import { supabase, getUserByClerkId, upsertUser, updateUserAgent, saveBusinessProfile, saveCallPreferences, saveSubscription } from './supabaseClient'
import { syncClerkUserToSupabase } from './clerkWebhook'
import type { OnboardingData as OnboardingStepData } from '../types'

// ====================================
// USER OPERATIONS
// ====================================

export async function fetchUserByClerkId(clerkUserId: string, userEmail?: string, autoCreate = false) {
  try {
    console.log('Fetching user by Clerk ID:', clerkUserId)
    let userData = await getUserByClerkId(clerkUserId)
    
    // Only create user if explicitly requested (e.g., during onboarding)
    if (!userData && userEmail && autoCreate) {
      console.log('User not found, creating in Supabase...')
      await syncClerkUserToSupabase(clerkUserId, userEmail)
      userData = await getUserByClerkId(clerkUserId)
    }
    
    if (!userData) {
      console.log('User not found in database. This is normal for new users who need onboarding.')
      return null
    }

    console.log('User found:', userData)
    return transformUserForFrontend(userData)
  } catch (error) {
    console.error('Error fetching user by Clerk ID:', error)
    throw error
  }
}

export async function createOrUpdateUser(
  clerkUserId: string, 
  email: string, 
  additionalData: any = {}
) {
  try {
    console.log('Creating/updating user:', { clerkUserId, email })
    
    const user = await upsertUser(clerkUserId, email, additionalData)
    const fullUserData = await getUserByClerkId(clerkUserId)
    
    return transformUserForFrontend(fullUserData!)
  } catch (error) {
    console.error('Error creating/updating user:', error)
    throw error
  }
}

export async function updateUserAgentInfo(
  clerkUserId: string,
  agentData: {
    agent_id?: string | null // Changed from number to string for UUID
    agent_name?: string | null
    agent_status?: string | null
    phone_id?: string | null
    phone_number?: string | null
  }
) {
  try {
    console.log('Updating user agent info:', { clerkUserId, agentData })
    
    const updatedUser = await updateUserAgent(clerkUserId, agentData)
    const fullUserData = await getUserByClerkId(clerkUserId)
    
    return transformUserForFrontend(fullUserData!)
  } catch (error) {
    console.error('Error updating user agent info:', error)
    throw error
  }
}

// ====================================
// ONBOARDING OPERATIONS  
// ====================================

export async function saveOnboardingStepData(
  clerkUserId: string,
  stepNumber: number,
  stepData: any,
  isCompleted = false
) {
  try {
    console.log('Saving onboarding step:', { clerkUserId, stepNumber, stepData })
    
    // Get user first
    const userData = await getUserByClerkId(clerkUserId)
    if (!userData) {
      throw new Error('User not found')
    }

    // Handle special step 3b case
    let actualStepColumn = `step${stepNumber}_data`
    if (stepNumber === 3 && stepData.categoryId) {
      actualStepColumn = 'step3b_data'
    }

    // Save step data
    const updateData: any = {
      [actualStepColumn]: stepData,
      current_step: Math.max(stepNumber, 1)
    }

    if (isCompleted) {
      updateData.is_completed = true
      updateData.completed_at = new Date().toISOString()
    }

    await supabase
      .from('onboarding_data')
      .upsert(
        {
          user_id: userData.id,
          ...updateData
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false
        }
      )

    // Also save to appropriate tables for easier querying
    if (stepNumber === 1 && stepData.businessDetails) {
      await saveBusinessProfile(userData.id, {
        business_name: stepData.businessName || stepData.businessDetails.name,
        address: stepData.businessDetails.address,
        phone: stepData.businessDetails.phone,
        hours: stepData.businessDetails.hours,
        website: stepData.businessDetails.website,
        place_id: stepData.businessDetails.placeId,
        google_data: stepData.businessDetails,
        rating: stepData.businessDetails.rating,
        business_description: stepData.businessDetails.businessDescription
      })
    }

    if (stepNumber === 2) {
      await saveCallPreferences(userData.id, {
        voicemail: stepData.voicemail,
        scheduling: stepData.scheduling,
        faq: stepData.faq
      })
    }

    if (stepNumber === 3 && stepData.scheduleType) {
      await saveCallPreferences(userData.id, {
        schedule_type: stepData.scheduleType,
        custom_schedule: stepData.customSchedule
      })
    }

    // Handle step 3b (business category)
    if (stepNumber === 3 && stepData.categoryId) {
      await saveBusinessProfile(userData.id, {
        business_category: stepData.categoryId,
        category_answers: stepData.answers || {}
      })
    }

    if (stepNumber === 5 && stepData.selectedPlan) {
      // Note: You might want to handle Stripe integration here
      await saveSubscription(userData.id, {
        plan_name: stepData.selectedPlan,
        price: getPlanPrice(stepData.selectedPlan), // You'll need to implement this
        status: 'pending' // Until payment is confirmed
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving onboarding step:', error)
    throw error
  }
}

export async function completeOnboarding(clerkUserId: string) {
  try {
    const userData = await getUserByClerkId(clerkUserId)
    if (!userData) {
      throw new Error('User not found')
    }

    await supabase
      .from('onboarding_data')
      .upsert(
        {
          user_id: userData.id,
          step6_data: { completed: true },
          is_completed: true,
          completed_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false
        }
      )
    
    return { success: true }
  } catch (error) {
    console.error('Error completing onboarding:', error)
    throw error
  }
}

// ====================================
// WEBHOOK OPERATIONS (replace backend calls)
// ====================================

export async function processAgentWebhookResponse(
  clerkUserId: string,
  webhookResponse: any
) {
  try {
    console.log('Processing agent webhook response:', webhookResponse)
    
    // Extract agent data from webhook response
    const agent = Array.isArray(webhookResponse) ? webhookResponse[0] : webhookResponse
    
    if (!agent || !agent.id) {
      throw new Error('Invalid agent response from webhook')
    }

    // Update user with agent information - keep agent_id as string since it's a UUID
    const agentData = {
      agent_id: agent.id, // Keep as string UUID
      agent_name: agent.name || null,
      agent_status: agent.status || 'active',
      phone_id: agent.phoneid || agent.phone_id || null,
      phone_number: agent.phone_number || agent.assigned_phone_number || null
    }

    console.log('Updating user with agent data:', agentData)
    return await updateUserAgentInfo(clerkUserId, agentData)
  } catch (error) {
    console.error('Error processing webhook response:', error)
    throw error
  }
}

// ====================================
// UTILITY FUNCTIONS
// ====================================

/**
 * Transform Supabase user data to match frontend expectations
 */
function transformUserForFrontend(userData: any) {
  if (!userData) {
    return null
  }

  const businessName = userData.business_profile?.business_name || 
                      userData.business_profile?.google_data?.name || 
                      userData.onboarding_data?.step1_data?.businessName ||
                      'Unknown Business'

  // Merge business details from both business_profile and onboarding_data for complete information
  const mergeBusinessDetails = () => {
    const businessProfile = userData.business_profile
    const step1Data = userData.onboarding_data?.step1_data
    const step3bData = userData.onboarding_data?.step3b_data

    if (!businessProfile && !step1Data) {
      return null
    }

    // Use the full Google Maps data from onboarding if available, otherwise use business profile
    const fullGoogleData = step1Data?.businessDetails || businessProfile?.google_data || {}
    
    return {
      businessName: businessName,
      data: {
        // Prefer onboarding data (more complete) over business profile
        ...(fullGoogleData || {}),
        name: businessName,
        address: fullGoogleData.formatted_address || businessProfile?.address || '',
        phone: fullGoogleData.phone || businessProfile?.phone || '',
        hours: businessProfile?.hours || '',
        website: fullGoogleData.website || businessProfile?.website || null,
        rating: fullGoogleData.rating || businessProfile?.rating || null,
        types: fullGoogleData.types || [],
        openingHours: fullGoogleData.openingHours || {},
        reviews: fullGoogleData.reviews || [],
        photos: fullGoogleData.photos || [],
        place_id: fullGoogleData.place_id || businessProfile?.place_id || null,
        geometry: fullGoogleData.geometry || null,
        vicinity: fullGoogleData.vicinity || null,
        userRatingsTotal: fullGoogleData.userRatingsTotal || null,
        utcOffsetMinutes: fullGoogleData.utcOffsetMinutes || null,
        location: fullGoogleData.location || null,
        priceLevel: fullGoogleData.priceLevel || businessProfile?.price_level || null,
        businessDescription: fullGoogleData.businessDescription || businessProfile?.business_description || '',
        isOpen: fullGoogleData.isOpen || null
      },
      // Include FAQ data from step3b
      faqData: step3bData ? {
        category: step3bData.categoryId || businessProfile?.business_category || 'others',
        categoryLabel: step3bData.categoryLabel || getCategoryLabel(step3bData.categoryId || businessProfile?.business_category || 'others'),
        answers: step3bData.answers || []
      } : {}
    }
  }

  return {
    _id: userData.id, // Keep for backward compatibility
    name: businessName,
    email: userData.email,
    agent_id: userData.agent_id || null, // Keep as string UUID
    agent_name: userData.agent_name,
    agent_status: userData.agent_status,
    assigned_phone_number: userData.phone_number,
    clerk_id: userData.clerk_user_id,
    
    // Enhanced business details with full onboarding data
    businessDetails: mergeBusinessDetails(),

    // Preferences (transformed from call_preferences)
    preferences: userData.call_preferences ? {
      voicemail: userData.call_preferences.voicemail,
      scheduling: userData.call_preferences.scheduling,
      faq: userData.call_preferences.faq,
      scheduleType: userData.call_preferences.schedule_type,
      customSchedule: userData.call_preferences.custom_schedule,
      timezone: userData.call_preferences.timezone
    } : null,

    // Active plan (transformed from subscription)
    activePlan: userData.subscription ? {
      stripeProductId: userData.subscription.plan_name,
      planName: userData.subscription.plan_name,
      price: userData.subscription.price,
      status: userData.subscription.status
    } : null,

    // Calendar tokens (placeholder - implement if needed)
    calendar_tokens: {
      access_token: null,
      refresh_token: null
    }
  }
}

/**
 * Get category label for business category
 */
function getCategoryLabel(categoryId: string): string {
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

/**
 * Get plan price (implement your pricing logic)
 */
function getPlanPrice(planName: string): number {
  const pricing = {
    'starter': 29.99,
    'professional': 79.99,
    'enterprise': 199.99
  }
  return pricing[planName as keyof typeof pricing] || 0
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth() {
  try {
    console.log('Checking database connection...')
    
    // Simple query to test connection
    const { data, error, count } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })

    if (error) {
      console.error('Database health check failed:', error)
      throw error
    }
    
    console.log('Database connection successful. User count:', count)
    return { 
      status: 'healthy', 
      message: 'Database connection successful',
      userCount: count,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Database health check failed:', error)
    return { 
      status: 'unhealthy', 
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Set default voice for agent (placeholder for webhook call)
 */
export async function setDefaultVoice(agentId: string | number, voiceData: {
  provider: string,
  voice_id: string,
  agent_id: string | number
}) {
  try {
    // This would typically be a webhook call to your voice service
    // For now, we'll just log it and return success
    console.log('Setting default voice:', { agentId, voiceData });
    
    // TODO: Implement actual voice setting logic
    // This might involve calling an external API or webhook
    
    return { success: true, message: 'Voice updated successfully' };
  } catch (error) {
    console.error('Error setting default voice:', error);
    throw error;
  }
}

// Export all functions
export default {
  fetchUserByClerkId,
  createOrUpdateUser,
  updateUserAgentInfo,
  saveOnboardingStepData,
  completeOnboarding,
  processAgentWebhookResponse,
  checkDatabaseHealth,
  setDefaultVoice
}
