# Google Calendar Integration Feature

## Overview

This feature enables users to connect their Google Calendar to view their schedule and provide the AI agent with access to calendar tokens for appointment scheduling and availability checking.

## Setup Instructions

### 1. Database Setup

Run the following SQL script in your Supabase database:

```sql
-- Execute the content of calendar-integrations-schema.sql
```

This creates the `calendar_integrations` table with RLS disabled (to work with Clerk authentication).

### 2. Environment Variables

Add the following to your `.env` file:

```env
# Google Calendar OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here  
VITE_GOOGLE_API_KEY=your_google_api_key_here
VITE_GOOGLE_REDIRECT_URL=http://localhost:5173/dashboard/integrations/google/callback
```

**Note**: Replace the placeholder values with your actual Google OAuth credentials from Google Cloud Console.

### 3. Google Cloud Console Setup

Ensure your Google Cloud project has:
- Google Calendar API enabled
- OAuth consent screen configured
- Authorized redirect URIs including your callback URL

## Features

### User Dashboard Features

1. **Connect Google Calendar**
   - OAuth 2.0 flow with offline access
   - Stores refresh tokens securely in Supabase
   - Shows connection status and user information

2. **Calendar View**
   - Display weekly calendar events
   - Navigate between weeks
   - View event details (time, location, attendees)
   - Open events in Google Calendar

3. **Integration Management**
   - View connected integrations
   - Refresh expired tokens
   - Disconnect integrations
   - Connection status monitoring

### Agent Access

The AI agent can access the stored tokens to:
- Check user availability
- Schedule appointments
- Find free time slots
- All calendar operations happen independently from the dashboard

## File Structure

```
src/
├── lib/
│   └── googleCalendarService.ts           # OAuth & calendar operations
├── components/
│   └── GoogleCalendarView.tsx             # Calendar display component
└── pages/
    └── DashboardIntegrations.tsx          # Main integration page
```

## Security Considerations

1. **Refresh Tokens**: Stored securely in Supabase (RLS disabled for Clerk compatibility)
2. **Access Tokens**: Generated on-demand and automatically refreshed
3. **User Isolation**: Application-level authorization ensures users only access their data
4. **Token Expiry**: Automatic refresh token handling with error fallbacks

## Usage Flow

1. User navigates to Integrations page
2. Clicks "Connect" for Google Calendar
3. Completes OAuth flow on Google
4. Returns with authorization code
5. System exchanges code for tokens
6. Refresh token stored in database
7. User can view calendar in dashboard
8. Agent can independently access calendar using stored tokens

## Calendar Display Features

- **Weekly View**: Shows events for the current week
- **Navigation**: Previous/Next week, Today button
- **Event Details**: Time, location, attendees, descriptions
- **Status Indicators**: Event confirmation status
- **External Links**: Click to open events in Google Calendar
- **Automatic Refresh**: Updates when tokens are refreshed

## Error Handling

- OAuth errors are displayed to the user
- Token refresh failures trigger reconnection prompts
- API errors are logged and user-friendly messages shown
- Connection status is monitored and updated
- Calendar view gracefully handles expired or invalid tokens

## Future Enhancements

- Support for other calendar providers (Outlook, Apple Calendar)
- Calendar event creation from dashboard
- Meeting link integration (Zoom, Meet)
- Different calendar view modes (daily, monthly)
- Timezone handling improvements
- Event filtering and search

## Troubleshooting

1. **OAuth Errors**: Check redirect URI configuration
2. **Token Issues**: Verify client ID/secret are correct
3. **API Failures**: Ensure Calendar API is enabled
4. **Calendar Not Loading**: Check token status and refresh if needed
5. **Database Issues**: Verify calendar_integrations table exists and RLS is disabled
6. **Infinite Loading**: Check browser console for errors, try manual refresh
7. **Duplicate Key Error**: Fixed with upsert functionality - old integrations are updated automatically

## Common Issues & Solutions

### Page Continuously Loading
- **Cause**: Infinite re-render loop
- **Solution**: Fixed by removing `loadIntegrations` from useEffect dependencies and preventing auto-refresh loops

### "Connect" Button Still Showing When Connected
- **Cause**: UI not recognizing existing connection
- **Solution**: Fixed with conditional rendering based on integration status

### Calendar Events Not Loading
- **Cause**: Token expiry or API errors
- **Solution**: Check console logs, use manual refresh button, verify token refresh functionality

## Development Notes

- The component handles OAuth callback automatically via URL params
- Tokens are refreshed automatically when expired
- Calendar view updates in real-time when integration status changes
- All calendar operations include proper error handling and loading states
- The UI is responsive and works well on mobile devices

## Agent Integration

The agent doesn't need to communicate through this dashboard. Instead:
- Agent accesses tokens directly from the database
- Agent performs calendar operations independently
- Dashboard shows the results of agent actions
- User can monitor and manage the integration through the dashboard
