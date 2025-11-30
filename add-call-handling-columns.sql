-- Add new columns for call handling and call schedule to onboarding_data table

-- Add call_handling column to store array of selected options
ALTER TABLE onboarding_data 
ADD COLUMN IF NOT EXISTS call_handling TEXT[] DEFAULT '{}';

-- Add call_schedule column to store schedule type
ALTER TABLE onboarding_data 
ADD COLUMN IF NOT EXISTS call_schedule TEXT DEFAULT 'business_hours';

-- Add comments for documentation
COMMENT ON COLUMN onboarding_data.call_handling IS 'Array of call handling options: voicemail, scheduling, faq';
COMMENT ON COLUMN onboarding_data.call_schedule IS 'Call schedule type: business_hours, 24_7, or custom';

-- Update existing rows to have default values if needed
UPDATE onboarding_data 
SET call_handling = '{}'
WHERE call_handling IS NULL;

UPDATE onboarding_data 
SET call_schedule = 'business_hours'
WHERE call_schedule IS NULL;
