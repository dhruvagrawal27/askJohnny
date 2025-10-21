-- Create campaigns table for outbound calls
-- Run this SQL in your Supabase SQL editor

-- Campaigns table
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  vapi_campaign_id TEXT NOT NULL, -- Campaign ID from VAPI API
  name TEXT NOT NULL,
  description TEXT,
  call_script TEXT,
  campaign_type TEXT,
  agent_id TEXT, -- VAPI agent ID
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Paused', 'Completed', 'Failed', 'Scheduled', 'In Progress')),
  recipients_count INTEGER DEFAULT 0,
  calls_completed INTEGER DEFAULT 0,
  calls_failed INTEGER DEFAULT 0,
  webhook_data JSONB, -- Store the full webhook response
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
CREATE POLICY "Users can view own campaigns" ON campaigns 
  FOR SELECT USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert own campaigns" ON campaigns 
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can update own campaigns" ON campaigns 
  FOR UPDATE USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can delete own campaigns" ON campaigns 
  FOR DELETE USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

-- Create indexes for better performance
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_vapi_campaign_id ON campaigns(vapi_campaign_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON campaigns 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE campaigns IS 'Outbound call campaigns created by users';
COMMENT ON COLUMN campaigns.vapi_campaign_id IS 'Campaign ID from VAPI API webhook response';
COMMENT ON COLUMN campaigns.agent_id IS 'VAPI agent ID used for this campaign';
COMMENT ON COLUMN campaigns.webhook_data IS 'Full webhook response data from campaign creation';
COMMENT ON COLUMN campaigns.recipients_count IS 'Number of recipients in the campaign';
COMMENT ON COLUMN campaigns.calls_completed IS 'Number of successfully completed calls';
COMMENT ON COLUMN campaigns.calls_failed IS 'Number of failed calls';
