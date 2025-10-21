// Test database connection and schema
// Run this with: node test-db-connection.js

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful')
    
    // Check if tables exist
    const tables = ['users', 'business_profiles', 'call_preferences', 'subscriptions', 'onboarding_data']
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (tableError) {
          console.log(`❌ Table ${table} not accessible:`, tableError.message)
        } else {
          console.log(`✅ Table ${table} accessible`)
        }
      } catch (e) {
        console.log(`❌ Table ${table} error:`, e.message)
      }
    }
    
    // Check users table structure
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .limit(1)
      
      if (userError) {
        console.log('❌ Users table query failed:', userError.message)
      } else {
        console.log('✅ Users table query successful')
        if (userData && userData.length > 0) {
          console.log('Sample user data keys:', Object.keys(userData[0]))
        }
      }
    } catch (e) {
      console.log('❌ Users table structure check failed:', e.message)
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return false
  }
}

// Run the test
testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Database connection test completed successfully!')
  } else {
    console.log('\n💥 Database connection test failed!')
    process.exit(1)
  }
})
