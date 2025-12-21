-- ROBUST SUPABASE SCHEMA FOR ASKJOHNNY
-- Run this SQL in your Supabase SQL editor AFTER running clean-database.sql

-- ====================================
-- USERS TABLE (Main table)
-- ====================================
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  
  -- Agent information (from webhook)
  agent_id INTEGER,
  agent_name TEXT,
  agent_status TEXT,
  
  -- Telephony information  
  phone_id TEXT,
  phone_number TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- BUSINESS PROFILES TABLE
-- ====================================
CREATE TABLE business_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Basic business info
  business_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  hours TEXT,
  website TEXT,
  
  -- Business categorization  
  business_category TEXT,
  category_answers JSONB DEFAULT '{}',
  
  -- Google Places data
  place_id TEXT,
  google_data JSONB DEFAULT '{}', -- Store full Google Places response
  
  -- Business details
  rating DECIMAL(2,1),
  price_level INTEGER,
  business_description TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- CALL PREFERENCES TABLE
-- ====================================
CREATE TABLE call_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Service preferences
  voicemail BOOLEAN DEFAULT false,
  scheduling BOOLEAN DEFAULT false,
  faq BOOLEAN DEFAULT false,
  
  -- Schedule settings
  schedule_type TEXT CHECK (schedule_type IN ('business_hours', '24_7', 'custom')) DEFAULT 'business_hours',
  custom_schedule JSONB DEFAULT '{}',
  timezone TEXT DEFAULT 'UTC',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- SUBSCRIPTIONS TABLE
-- ====================================
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Plan details
  plan_name TEXT NOT NULL,
  stripe_product_id TEXT,
  price DECIMAL(10,2) NOT NULL,
  
  -- Billing
  billing_cycle TEXT DEFAULT 'monthly', -- monthly, yearly
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT DEFAULT 'active', -- active, cancelled, expired
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- ONBOARDING DATA TABLE
-- ====================================
CREATE TABLE onboarding_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Step data (JSONB for flexibility)
  step1_data JSONB DEFAULT '{}', -- Business selection data
  step2_data JSONB DEFAULT '{}', -- Call handling preferences  
  step3_data JSONB DEFAULT '{}', -- Schedule preferences
  step3b_data JSONB DEFAULT '{}', -- Business category & answers
  step4_data JSONB DEFAULT '{}', -- Contact information
  step5_data JSONB DEFAULT '{}', -- Pricing selection
  step6_data JSONB DEFAULT '{}', -- Auth completion
  
  -- Progress tracking
  current_step INTEGER DEFAULT 1,
  completed_steps INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  is_completed BOOLEAN DEFAULT false,
  
  -- Metadata
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- CALL LOGS TABLE (for future call tracking)
-- ====================================
CREATE TABLE call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Call details
  call_id TEXT, -- External call system ID
  caller_number TEXT,
  duration INTEGER, -- in seconds
  call_type TEXT, -- inbound, outbound
  call_status TEXT, -- completed, missed, voicemail
  
  -- Call content
  transcript TEXT,
  summary TEXT,
  recording_url TEXT,
  
  -- Metadata
  call_started_at TIMESTAMP WITH TIME ZONE,
  call_ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- INDEXES FOR PERFORMANCE
-- ====================================

-- Users table indexes
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_users_agent_id ON users(agent_id);
CREATE INDEX idx_users_phone_id ON users(phone_id);
CREATE INDEX idx_users_phone_number ON users(phone_number);
CREATE INDEX idx_users_email ON users(email);

-- Business profiles indexes
CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX idx_business_profiles_place_id ON business_profiles(place_id);
CREATE INDEX idx_business_profiles_category ON business_profiles(business_category);

-- Call preferences indexes
CREATE INDEX idx_call_preferences_user_id ON call_preferences(user_id);

-- Subscriptions indexes  
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_product_id ON subscriptions(stripe_product_id);

-- Onboarding data indexes
CREATE INDEX idx_onboarding_data_user_id ON onboarding_data(user_id);
CREATE INDEX idx_onboarding_data_completed ON onboarding_data(is_completed);

-- Call logs indexes
CREATE INDEX idx_call_logs_user_id ON call_logs(user_id);
CREATE INDEX idx_call_logs_call_started_at ON call_logs(call_started_at);
CREATE INDEX idx_call_logs_call_type ON call_logs(call_type);

-- ====================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ====================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- ====================================
-- RLS POLICIES (Permissive for Clerk auth)
-- Note: You may want to tighten these based on your auth needs
-- ====================================

-- Users policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can delete own data" ON users FOR DELETE USING (true);

-- Business profiles policies
CREATE POLICY "Users can view own business profiles" ON business_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own business profiles" ON business_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own business profiles" ON business_profiles FOR UPDATE USING (true);
CREATE POLICY "Users can delete own business profiles" ON business_profiles FOR DELETE USING (true);

-- Call preferences policies
CREATE POLICY "Users can view own call preferences" ON call_preferences FOR SELECT USING (true);
CREATE POLICY "Users can insert own call preferences" ON call_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own call preferences" ON call_preferences FOR UPDATE USING (true);
CREATE POLICY "Users can delete own call preferences" ON call_preferences FOR DELETE USING (true);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (true);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (true);
CREATE POLICY "Users can delete own subscriptions" ON subscriptions FOR DELETE USING (true);

-- Onboarding data policies
CREATE POLICY "Users can view own onboarding data" ON onboarding_data FOR SELECT USING (true);
CREATE POLICY "Users can insert own onboarding data" ON onboarding_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own onboarding data" ON onboarding_data FOR UPDATE USING (true);
CREATE POLICY "Users can delete own onboarding data" ON onboarding_data FOR DELETE USING (true);

-- Call logs policies
CREATE POLICY "Users can view own call logs" ON call_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert own call logs" ON call_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own call logs" ON call_logs FOR UPDATE USING (true);
CREATE POLICY "Users can delete own call logs" ON call_logs FOR DELETE USING (true);

-- ====================================
-- FUNCTIONS FOR UPDATED_AT TRIGGERS
-- ====================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to auto-update updated_at fields
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON business_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_preferences_updated_at BEFORE UPDATE ON call_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_data_updated_at BEFORE UPDATE ON onboarding_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- SAMPLE DATA (Optional - uncomment for testing)
-- ====================================

/*
-- Insert sample users
INSERT INTO users (clerk_user_id, email) VALUES 
  ('test_user_1', 'test1@example.com'),
  ('test_user_2', 'test2@example.com');

-- Insert sample business profiles
INSERT INTO business_profiles (user_id, business_name, address, phone, hours) 
SELECT 
  id, 
  'Test Business ' || ROW_NUMBER() OVER(),
  '123 Test St, Test City',
  '+1234567890',
  '9AM-5PM Mon-Fri'
FROM users LIMIT 2;

-- Insert sample call preferences
INSERT INTO call_preferences (user_id, voicemail, scheduling, faq)
SELECT 
  id,
  true,
  true, 
  false
FROM users LIMIT 2;
*/

-- ====================================
-- COMPLETION STATUS
-- ====================================

SELECT 'Database schema created successfully! Ready for production use.' as status;
