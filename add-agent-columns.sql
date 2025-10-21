-- Migration: Add agent columns to users table
-- Run this SQL in your Supabase SQL editor to add the new columns

-- Add new columns for agent information
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS agent_id INTEGER,
ADD COLUMN IF NOT EXISTS agent_name TEXT,
ADD COLUMN IF NOT EXISTS agent_status TEXT;

-- Add comments for documentation
COMMENT ON COLUMN users.agent_id IS 'Agent ID received from webhook response';
COMMENT ON COLUMN users.agent_name IS 'Agent name received from webhook response';
COMMENT ON COLUMN users.agent_status IS 'Agent status received from webhook response';

-- Create index for better performance when querying by agent_id
CREATE INDEX IF NOT EXISTS idx_users_agent_id ON users(agent_id);

-- Migration: Add telephony columns to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone_id TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT;

COMMENT ON COLUMN users.phone_id IS 'Provider phone/resource ID created via n8n';
COMMENT ON COLUMN users.phone_number IS 'E.164 formatted phone number purchased/linked via n8n';

-- Optional but handy for lookups
CREATE INDEX IF NOT EXISTS idx_users_phone_id ON users(phone_id);
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
