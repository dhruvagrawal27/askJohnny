-- CLEAN DATABASE SCRIPT
-- ⚠️ WARNING: This script will delete ALL existing tables and data
-- Run this in your NEW Supabase SQL editor to start fresh

-- Drop all existing tables (if they exist) in correct order to avoid FK constraint issues
DROP TABLE IF EXISTS onboarding_data CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS call_preferences CASCADE;
DROP TABLE IF EXISTS business_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop any remaining indexes
DROP INDEX IF EXISTS idx_users_clerk_user_id;
DROP INDEX IF EXISTS idx_users_agent_id;
DROP INDEX IF EXISTS idx_users_phone_id;
DROP INDEX IF EXISTS idx_users_phone_number;
DROP INDEX IF EXISTS idx_business_profiles_user_id;
DROP INDEX IF EXISTS idx_call_preferences_user_id;
DROP INDEX IF EXISTS idx_subscriptions_user_id;
DROP INDEX IF EXISTS idx_onboarding_data_user_id;

-- Confirm cleanup
SELECT 'Database cleaned successfully. All tables removed.' as status;
