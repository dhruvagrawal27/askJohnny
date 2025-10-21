-- UPDATE AGENT_ID FIELD TO HANDLE UUID STRINGS
-- Run this SQL in your Supabase SQL editor to update the schema

-- Change agent_id from INTEGER to TEXT to handle UUID strings
ALTER TABLE users ALTER COLUMN agent_id TYPE TEXT;

-- Add a comment for clarity
COMMENT ON COLUMN users.agent_id IS 'Agent UUID from external webhook response';

-- Update any existing INTEGER agent_ids (if any) - this should be safe since we're converting to a larger type
-- No data conversion needed since we're going from INTEGER to TEXT

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'agent_id';
