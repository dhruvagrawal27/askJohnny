// src/lib/clerkWebhook.ts
// This handles Clerk user events and syncs them to Supabase

import { supabase } from './supabaseClient'

export interface ClerkUserEvent {
  type: 'user.created' | 'user.updated' | 'user.deleted'
  data: {
    id: string
    email_addresses: Array<{
      email_address: string
      id: string
    }>
    first_name?: string
    last_name?: string
    created_at: number
    updated_at: number
  }
}

/**
 * Handle Clerk user created event
 */
export async function handleUserCreated(clerkUser: ClerkUserEvent['data']) {
  try {
    console.log('Creating user in Supabase for Clerk user:', clerkUser.id)
    
    const email = clerkUser.email_addresses[0]?.email_address || ''
    
    // Create user in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        clerk_user_id: clerkUser.id,
        email: email,
        created_at: new Date(clerkUser.created_at).toISOString(),
        updated_at: new Date(clerkUser.updated_at).toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user in Supabase:', error)
      throw error
    }

    console.log('User created successfully in Supabase:', user)
    return user
  } catch (error) {
    console.error('Failed to create user in Supabase:', error)
    throw error
  }
}

/**
 * Handle Clerk user updated event
 */
export async function handleUserUpdated(clerkUser: ClerkUserEvent['data']) {
  try {
    console.log('Updating user in Supabase for Clerk user:', clerkUser.id)
    
    const email = clerkUser.email_addresses[0]?.email_address || ''
    
    const { data: user, error } = await supabase
      .from('users')
      .update({
        email: email,
        updated_at: new Date(clerkUser.updated_at).toISOString()
      })
      .eq('clerk_user_id', clerkUser.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user in Supabase:', error)
      throw error
    }

    console.log('User updated successfully in Supabase:', user)
    return user
  } catch (error) {
    console.error('Failed to update user in Supabase:', error)
    throw error
  }
}

/**
 * Sync user data from Clerk to Supabase (for immediate use)
 */
export async function syncClerkUserToSupabase(clerkUserId: string, email: string) {
  try {
    console.log('Syncing Clerk user to Supabase:', { clerkUserId, email })
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existingUser) {
      console.log('User already exists in Supabase:', existingUser.id)
      return existingUser
    }

    // Create new user with upsert to handle race conditions
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .upsert(
        {
          clerk_user_id: clerkUserId,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'clerk_user_id',
          ignoreDuplicates: false
        }
      )
      .select()
      .single()

    if (createError) {
      // If it's a duplicate key error, fetch the existing user
      if (createError.code === '23505') {
        console.log('User already exists (race condition), fetching...')
        const { data: fetchedUser, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_user_id', clerkUserId)
          .single()
        
        if (fetchError) throw fetchError
        return fetchedUser
      }
      throw createError
    }

    console.log('New user created in Supabase:', newUser)
    return newUser
  } catch (error) {
    console.error('Error syncing Clerk user to Supabase:', error)
    throw error
  }
}
