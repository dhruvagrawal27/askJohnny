# Database Migration - Call Handling & Schedule Fields

## Overview
This migration adds two new columns to the `onboarding_data` table to store call handling preferences and call schedule settings.

## SQL Migration File
Run the SQL file: `add-call-handling-columns.sql`

You can run this in your Supabase SQL Editor:

```sql
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
```

## What Was Fixed

### 1. **Database Schema Issue**
- The `call_preferences` table expects: `business_hours`, `24_7`, or `custom`
- Your code was sending: `all_time` instead of `24_7`
- **Fixed**: Updated StepOneD.tsx to use `24_7` instead of `all_time`

### 2. **Missing Data in Supabase Insert**
- The `onboarding_data` table insert was missing the new fields
- **Fixed**: Updated SetupLoading.tsx to include:
  - `call_handling`: Array extracted from step2 data (voicemail, scheduling, faq)
  - `call_schedule`: String from step3 data (business_hours, 24_7, custom)

### 3. **Data Flow**
The data now flows correctly:
1. **Step 3 (StepOneC)**: User selects call handling options → saved to `state.callHandling[]`
2. **Step 4 (StepOneD)**: User selects schedule type → saved to `state.callSchedule`
3. **Step 7 (StepFour)**: Data formatted and saved to localStorage
4. **SetupLoading**: Data extracted and inserted into:
   - `call_preferences` table (step2 and step3 data)
   - `onboarding_data` table (all step data + new call_handling and call_schedule columns)

## Files Modified

1. **src/pages/Onboarding/StepOneD.tsx**
   - Changed schedule option ID from `all_time` to `24_7`

2. **src/pages/SetupLoading.tsx**
   - Added logic to extract call_handling array from step2 data
   - Added `call_handling` and `call_schedule` fields to onboarding_data insert

3. **add-call-handling-columns.sql**
   - Updated comment to reflect correct enum value `24_7` instead of `all_time`

## Testing Steps

1. **Run the SQL migration** in Supabase
2. **Clear your browser localStorage** (to start fresh)
3. **Go through the onboarding flow**:
   - Step 1: Select a business
   - Step 2: Preview voice
   - Step 3: Select call handling options (voicemail, scheduling, faq)
   - Step 4: Select call schedule (business_hours, 24_7, or custom)
   - Step 5: Select plan
   - Step 6: Configure AI
   - Step 7: Create account
4. **Check Supabase tables**:
   - `onboarding_data` should have `call_handling` and `call_schedule` populated
   - `call_preferences` should have correct `schedule_type` value

## Expected Values

### call_handling (TEXT[] array)
- `voicemail` - Basic voicemail replacement
- `scheduling` - Appointment scheduling
- `faq` - FAQ answering

Example: `{voicemail, scheduling, faq}`

### call_schedule (TEXT)
- `business_hours` - Business hours only (default, recommended)
- `24_7` - 24/7 coverage
- `custom` - Custom schedule

## Error Resolution

The original error:
```
Failed to save call preferences: new row for relation "call_preferences" 
violates check constraint "call_preferences_schedule_type_check"
```

Was caused by sending `all_time` instead of `24_7` to the database.

This is now **FIXED** ✅
