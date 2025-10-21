import { supabase } from '../lib/supabaseClient'

export interface DbHealthStatus {
  isHealthy: boolean
  error?: string
  details?: any
}

export async function checkDatabaseHealth(): Promise<DbHealthStatus> {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      return {
        isHealthy: false,
        error: error.message,
        details: error
      }
    }
    
    return {
      isHealthy: true,
      details: { message: 'Database connection successful' }
    }
    
  } catch (error) {
    return {
      isHealthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }
  }
}

export async function checkTableAccess(): Promise<{ [key: string]: boolean }> {
  const tables = ['users', 'business_profiles', 'call_preferences', 'subscriptions', 'onboarding_data']
  const results: { [key: string]: boolean } = {}
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      results[table] = !error
    } catch {
      results[table] = false
    }
  }
  
  return results
}

export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error
  }
  
  if (error?.message) {
    return error.message
  }
  
  if (error?.details) {
    return error.details
  }
  
  return 'An unexpected error occurred'
}
