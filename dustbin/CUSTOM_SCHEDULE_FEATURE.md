# Custom Schedule Feature Documentation

## Overview
The custom schedule feature allows users to set different business hours for each day of the week during the onboarding process.

## Implementation Details

### 1. User Interface (StepOneD.tsx)
- **Location**: `/src/pages/Onboarding/StepOneD.tsx`
- **Modal UI**: Full-screen modal with day-by-day schedule configuration
- **Features**:
  - Toggle each day on/off
  - Set open and close times for each day
  - Visual toggle switches
  - Time inputs (HH:MM format)
  - Save/Cancel buttons

### 2. Data Structure (types.ts)
```typescript
export interface DaySchedule {
  enabled: boolean;
  openTime: string;   // Format: "HH:MM" (e.g., "09:00")
  closeTime: string;  // Format: "HH:MM" (e.g., "17:00")
}

export interface CustomSchedule {
  [key: string]: DaySchedule;  // Keys: monday, tuesday, wednesday, etc.
}
```

### 3. Default Schedule
Monday-Friday:
- Enabled: true
- Hours: 9:00 AM - 5:00 PM

Saturday-Sunday:
- Enabled: false
- Closed

### 4. Data Flow
1. User selects "Custom Schedule" radio button
2. Modal opens with default schedule
3. User modifies days/times as needed
4. User clicks "Save Schedule"
5. Modal closes and data is stored in state
6. On "Continue", customSchedule is saved to onboarding state
7. In StepFour, customSchedule is included in formatted data (step3.customSchedule)
8. Data persists to localStorage
9. In SetupLoading, customSchedule is saved to call_preferences.custom_schedule as JSONB

### 5. Database Schema
**Table**: `call_preferences`
**Column**: `custom_schedule`
**Type**: JSONB
**Default**: NULL

Example JSON stored in database:
```json
{
  "monday": { "enabled": true, "openTime": "09:00", "closeTime": "17:00" },
  "tuesday": { "enabled": true, "openTime": "09:00", "closeTime": "17:00" },
  "wednesday": { "enabled": true, "openTime": "09:00", "closeTime": "17:00" },
  "thursday": { "enabled": true, "openTime": "09:00", "closeTime": "17:00" },
  "friday": { "enabled": true, "openTime": "09:00", "closeTime": "17:00" },
  "saturday": { "enabled": false, "openTime": "09:00", "closeTime": "17:00" },
  "sunday": { "enabled": false, "openTime": "09:00", "closeTime": "17:00" }
}
```

### 6. Migration SQL
**File**: `/add-custom-schedule-column.sql`

Run this SQL in your Supabase SQL editor to add the custom_schedule column:
```sql
ALTER TABLE call_preferences 
ADD COLUMN IF NOT EXISTS custom_schedule JSONB DEFAULT NULL;
```

## Testing Checklist

- [ ] Click "Custom Schedule" radio button
- [ ] Verify modal opens
- [ ] Toggle days on/off
- [ ] Change time values
- [ ] Click Cancel - verify modal closes without saving
- [ ] Click "Custom Schedule" again
- [ ] Make changes and click "Save Schedule"
- [ ] Verify modal closes
- [ ] Complete onboarding flow
- [ ] Check localStorage for custom_schedule in step3
- [ ] Check Supabase call_preferences table for JSONB data
- [ ] Verify custom_schedule is only saved when schedule_type is "custom"

## Files Modified

1. `/src/pages/Onboarding/types.ts` - Added DaySchedule and CustomSchedule interfaces
2. `/src/pages/Onboarding/StepOneD.tsx` - Added modal UI and handlers
3. `/src/pages/Onboarding/StepFour.tsx` - Added customSchedule to formatted data
4. `/src/pages/SetupLoading.tsx` - Already had custom_schedule field (line 344)
5. `/add-custom-schedule-column.sql` - Database migration script

## Usage Example

When a user selects "Custom Schedule":
1. Modal appears with 7 days
2. User disables Saturday and Sunday (closed)
3. User sets Monday-Friday to 8:00 AM - 6:00 PM
4. User saves and continues
5. System stores this configuration
6. AI agent will only answer calls during these specific hours
