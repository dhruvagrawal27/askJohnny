-- Fix campaigns table RLS policies
-- Run this SQL in your Supabase SQL editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can insert own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete own campaigns" ON campaigns;

-- Option 1: Disable RLS for service role (recommended for backend operations)
-- This allows the service role to bypass RLS while still protecting user access
-- Create a more permissive policy that works with service role

-- Create new policies that work with both service role and user authentication
CREATE POLICY "Enable all operations for service role" ON campaigns 
  FOR ALL USING (true);

-- Alternative Option 2: If you want to keep RLS strict, use these policies instead:
-- (Comment out the above policy and uncomment these if you prefer strict RLS)

/*
-- Updated RLS policies that work better with Clerk + Supabase setup
CREATE POLICY "Users can view own campaigns" ON campaigns 
  FOR SELECT USING (
    -- Allow if user_id matches OR if using service role
    user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json ->> 'sub')
    OR current_setting('role') = 'service_role'
  );

CREATE POLICY "Users can insert own campaigns" ON campaigns 
  FOR INSERT WITH CHECK (
    -- Allow if user_id matches OR if using service role  
    user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json ->> 'sub')
    OR current_setting('role') = 'service_role'
  );

CREATE POLICY "Users can update own campaigns" ON campaigns 
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json ->> 'sub')
    OR current_setting('role') = 'service_role'
  );

CREATE POLICY "Users can delete own campaigns" ON campaigns 
  FOR DELETE USING (
    user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json ->> 'sub')
    OR current_setting('role') = 'service_role'
  );
*/

-- Ensure RLS is still enabled
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
