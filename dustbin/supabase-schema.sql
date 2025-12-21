-- AskJohnny Database Schema
-- Run this SQL in your Supabase SQL editor

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  agent_id INTEGER, -- Agent ID received from webhook response
  agent_name TEXT, -- Agent name received from webhook response
  agent_status TEXT, -- Agent status received from webhook response
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business profiles table
CREATE TABLE business_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  hours TEXT,
  business_category TEXT,
  category_answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Call preferences table
CREATE TABLE call_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  voicemail BOOLEAN DEFAULT false,
  scheduling BOOLEAN DEFAULT false,
  faq BOOLEAN DEFAULT false,
  schedule_type TEXT CHECK (schedule_type IN ('business_hours', '24_7', 'custom')),
  custom_schedule JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  plan_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comprehensive onboarding data table (for debugging and easy access)
CREATE TABLE onboarding_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  step1_data JSONB, -- Business selection data
  step2_data JSONB, -- Call handling preferences
  step3_data JSONB, -- Schedule preferences
  step3b_data JSONB, -- Business category & answers
  step4_data JSONB, -- Contact information
  step5_data JSONB, -- Pricing selection
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simplified for Clerk authentication)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);

CREATE POLICY "Users can view own business profiles" ON business_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own business profiles" ON business_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own business profiles" ON business_profiles FOR UPDATE USING (true);

CREATE POLICY "Users can view own call preferences" ON call_preferences FOR SELECT USING (true);
CREATE POLICY "Users can insert own call preferences" ON call_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own call preferences" ON call_preferences FOR UPDATE USING (true);

CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (true);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (true);

CREATE POLICY "Users can view own onboarding data" ON onboarding_data FOR SELECT USING (true);
CREATE POLICY "Users can insert own onboarding data" ON onboarding_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own onboarding data" ON onboarding_data FOR UPDATE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX idx_call_preferences_user_id ON call_preferences(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_onboarding_data_user_id ON onboarding_data(user_id);

-- Insert sample data (optional - for testing)
-- INSERT INTO users (clerk_user_id, email) VALUES 
--   ('test_user_1', 'test1@example.com'),
--   ('test_user_2', 'test2@example.com');

-- INSERT INTO business_profiles (user_id, business_name, address, phone, hours) VALUES 
--   ((SELECT id FROM users WHERE clerk_user_id = 'test_user_1'), 'Test Business 1', '123 Test St', '+1234567890', '9AM-5PM'),
--   ((SELECT id FROM users WHERE clerk_user_id = 'test_user_2'), 'Test Business 2', '456 Test Ave', '+0987654321', '8AM-6PM');
