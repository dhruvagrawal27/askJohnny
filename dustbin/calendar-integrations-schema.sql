-- Calendar Integrations Schema
-- This table stores OAuth tokens and integration details for calendar providers

CREATE TABLE IF NOT EXISTS calendar_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'google', 'outlook', etc.
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'expired', 'error')),
    email TEXT,
    name TEXT,
    
    -- Ensure one integration per user per provider
    UNIQUE(user_id, provider)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_id ON calendar_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_provider ON calendar_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_status ON calendar_integrations(status);

-- Fix Calendar Integrations RLS Policies
-- Drop any existing policies that require JWT authentication
DROP POLICY IF EXISTS "calendar_integrations_user_policy" ON calendar_integrations;
DROP POLICY IF EXISTS "calendar_integrations_service_policy" ON calendar_integrations;
DROP POLICY IF EXISTS "Users can view their own calendar integrations" ON calendar_integrations;
DROP POLICY IF EXISTS "Users can insert their own calendar integrations" ON calendar_integrations;
DROP POLICY IF EXISTS "Users can update their own calendar integrations" ON calendar_integrations;
DROP POLICY IF EXISTS "Users can delete their own calendar integrations" ON calendar_integrations;

-- For now, disable RLS entirely since we're using Clerk auth instead of Supabase auth
-- The application will handle user authorization at the service layer
ALTER TABLE calendar_integrations DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS enabled but allow all operations
-- (since authorization is handled at the application level)
-- ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations on calendar_integrations" ON calendar_integrations FOR ALL USING (true);

-- Update function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_calendar_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_calendar_integrations_updated_at ON calendar_integrations;
CREATE TRIGGER update_calendar_integrations_updated_at
    BEFORE UPDATE ON calendar_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_integrations_updated_at();

-- Grant permissions to authenticated users
GRANT ALL ON calendar_integrations TO authenticated;
GRANT ALL ON calendar_integrations TO anon;
