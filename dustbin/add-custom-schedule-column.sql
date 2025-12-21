-- Add custom_schedule column to call_preferences table
-- This column stores the custom weekly schedule as a JSONB object
-- Format: { "monday": { "enabled": true, "openTime": "09:00", "closeTime": "17:00" }, ... }

ALTER TABLE call_preferences 
ADD COLUMN IF NOT EXISTS custom_schedule JSONB DEFAULT NULL;

COMMENT ON COLUMN call_preferences.custom_schedule IS 'Custom weekly schedule configuration in JSON format. Used when schedule_type is "custom". Structure: { day: { enabled, openTime, closeTime } }';

-- Update existing records to have NULL custom_schedule (if they don't have one)
UPDATE call_preferences 
SET custom_schedule = NULL 
WHERE custom_schedule IS NULL;
