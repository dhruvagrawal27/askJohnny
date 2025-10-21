import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ====================================
// DATABASE TYPES (matching new schema)
// ====================================

export interface User {
  id: string
  clerk_user_id: string
  email: string
  agent_id?: string | null // Changed from number to string for UUID
  agent_name?: string | null
  agent_status?: string | null
  phone_id?: string | null
  phone_number?: string | null
  created_at: string
  updated_at: string
}

export interface BusinessProfile {
  id: string
  user_id: string
  business_name: string
  address?: string | null
  phone?: string | null
  hours?: string | null
  website?: string | null
  business_category?: string | null
  category_answers?: any
  place_id?: string | null
  google_data?: any
  rating?: number | null
  price_level?: number | null
  business_description?: string | null
  created_at: string
  updated_at: string
}

export interface CallPreferences {
  id: string
  user_id: string
  voicemail: boolean
  scheduling: boolean
  faq: boolean
  schedule_type: 'business_hours' | '24_7' | 'custom'
  custom_schedule?: any
  timezone: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_name: string
  stripe_product_id?: string | null
  price: number
  billing_cycle: string
  start_date: string
  end_date?: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface OnboardingData {
  id: string
  user_id: string
  step1_data?: any
  step2_data?: any
  step3_data?: any
  step3b_data?: any
  step4_data?: any
  step5_data?: any
  step6_data?: any
  current_step: number
  completed_steps: number[]
  is_completed: boolean
  completed_at?: string | null
  created_at: string
  updated_at: string
}

export interface CallLog {
  id: string
  user_id: string
  call_id?: string | null
  caller_number?: string | null
  duration?: number | null
  call_type?: string | null
  call_status?: string | null
  transcript?: string | null
  summary?: string | null
  recording_url?: string | null
  call_started_at?: string | null
  call_ended_at?: string | null
  created_at: string
}

// ====================================
// UTILITY FUNCTIONS
// ====================================

/**
 * Get user by Clerk ID with all related data
 */
export async function getUserByClerkId(clerkUserId: string) {
  try {
    // First get the user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle() // Use maybeSingle to handle no results gracefully

    if (userError) {
      console.error('Error fetching user:', userError)
      throw userError
    }
    
    if (!user) {
      console.log('No user found for clerk_user_id:', clerkUserId)
      return null
    }

    console.log('Found user:', user)

    // Get related data with proper error handling
    const [businessProfileResult, callPreferencesResult, subscriptionResult, onboardingDataResult] = await Promise.allSettled([
      supabase.from('business_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('call_preferences').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('onboarding_data').select('*').eq('user_id', user.id).maybeSingle()
    ])

    // Extract data from settled promises
    const businessProfile = businessProfileResult.status === 'fulfilled' ? businessProfileResult.value.data : null
    const callPreferences = callPreferencesResult.status === 'fulfilled' ? callPreferencesResult.value.data : null
    const subscription = subscriptionResult.status === 'fulfilled' ? subscriptionResult.value.data : null
    const onboardingData = onboardingDataResult.status === 'fulfilled' ? onboardingDataResult.value.data : null

    return {
      ...user,
      business_profile: businessProfile,
      call_preferences: callPreferences,
      subscription: subscription,
      onboarding_data: onboardingData
    }
  } catch (error) {
    console.error('Error fetching user by clerk ID:', error)
    throw error
  }
}

/**
 * Create or update user by Clerk ID
 */
export async function upsertUser(clerkUserId: string, email: string, additionalData: Partial<User> = {}) {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          clerk_user_id: clerkUserId,
          email,
          ...additionalData
        },
        {
          onConflict: 'clerk_user_id',
          ignoreDuplicates: false
        }
      )
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error upserting user:', error)
    throw error
  }
}

/**
 * Update user agent information
 */
export async function updateUserAgent(
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
    const { data, error } = await supabase
      .from('users')
      .update(agentData)
      .eq('clerk_user_id', clerkUserId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating user agent:', error)
    throw error
  }
}

/**
 * Save onboarding step data
 */
export async function saveOnboardingStep(
  userId: string,
  stepNumber: number,
  stepData: any,
  isCompleted = false
) {
  try {
    const stepColumn = `step${stepNumber}_data`
    const updateData: any = {
      [stepColumn]: stepData,
      current_step: Math.max(stepNumber, 1)
    }

    if (isCompleted) {
      updateData.is_completed = true
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('onboarding_data')
      .upsert(
        {
          user_id: userId,
          ...updateData
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false
        }
      )
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error saving onboarding step:', error)
    throw error
  }
}

/**
 * Save business profile
 */
export async function saveBusinessProfile(userId: string, profileData: Partial<BusinessProfile>) {
  try {
    const { data, error } = await supabase
      .from('business_profiles')
      .upsert(
        {
          user_id: userId,
          ...profileData
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false
        }
      )
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error saving business profile:', error)
    throw error
  }
}

/**
 * Save call preferences
 */
export async function saveCallPreferences(userId: string, preferences: Partial<CallPreferences>) {
  try {
    const { data, error } = await supabase
      .from('call_preferences')
      .upsert(
        {
          user_id: userId,
          ...preferences
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false
        }
      )
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error saving call preferences:', error)
    throw error
  }
}

/**
 * Save subscription
 */
export async function saveSubscription(userId: string, subscriptionData: Partial<Subscription>) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: userId,
          ...subscriptionData
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false
        }
      )
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error saving subscription:', error)
    throw error
  }
}
