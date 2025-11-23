// Google Calendar OAuth Service
import { supabase } from './supabaseClient';

export interface CalendarIntegration {
  id: string;
  user_id: string;
  provider: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  connected_at: string;
  status: 'connected' | 'expired' | 'error';
  email?: string;
  name?: string;
}

export interface CreateCalendarIntegrationData {
  user_id: string;
  provider: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  email?: string;
  name?: string;
}

export interface UpdateCalendarIntegrationData {
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  status?: 'connected' | 'expired' | 'error';
  email?: string;
  name?: string;
}

// Get user's calendar integrations
export const getCalendarIntegrations = async (userId: string): Promise<CalendarIntegration[]> => {
  try {
    const { data, error } = await supabase
      .from('calendar_integrations')
      .select('*')
      .eq('user_id', userId)
      .order('connected_at', { ascending: false });

    if (error) {
      console.error('Error fetching calendar integrations:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCalendarIntegrations:', error);
    throw error;
  }
};

// Get specific calendar integration
export const getCalendarIntegration = async (userId: string, provider: string): Promise<CalendarIntegration | null> => {
  try {
    const { data, error } = await supabase
      .from('calendar_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error fetching calendar integration:', error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error in getCalendarIntegration:', error);
    throw error;
  }
};

// Create or update calendar integration (upsert)
export const upsertCalendarIntegration = async (integrationData: CreateCalendarIntegrationData): Promise<CalendarIntegration> => {
  try {
    const { data, error } = await supabase
      .from('calendar_integrations')
      .upsert([{
        ...integrationData,
        status: 'connected',
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }], {
        onConflict: 'user_id,provider',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting calendar integration:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in upsertCalendarIntegration:', error);
    throw error;
  }
};

// Create calendar integration
export const createCalendarIntegration = async (integrationData: CreateCalendarIntegrationData): Promise<CalendarIntegration> => {
  try {
    const { data, error } = await supabase
      .from('calendar_integrations')
      .insert([{
        ...integrationData,
        status: 'connected',
        connected_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating calendar integration:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createCalendarIntegration:', error);
    throw error;
  }
};

// Update calendar integration
export const updateCalendarIntegration = async (id: string, updateData: UpdateCalendarIntegrationData): Promise<CalendarIntegration> => {
  try {
    const { data, error } = await supabase
      .from('calendar_integrations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating calendar integration:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateCalendarIntegration:', error);
    throw error;
  }
};

// Delete calendar integration
export const deleteCalendarIntegration = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('calendar_integrations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting calendar integration:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteCalendarIntegration:', error);
    throw error;
  }
};

// Google Calendar OAuth Helper Functions
export const generateGoogleAuthUrl = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  // Use current origin to build redirect URI dynamically
  const redirectUri = `${window.location.origin}/dashboard/integrations`;
  
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent'
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

// Exchange authorization code for tokens
export const exchangeCodeForTokens = async (code: string) => {
  try {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
    // Use current origin to build redirect URI dynamically
    const redirectUri = `${window.location.origin}/dashboard/integrations`;

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OAuth token exchange failed: ${errorData.error_description || errorData.error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw error;
  }
};

// Get user info from Google
export const getGoogleUserInfo = async (accessToken: string) => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info from Google');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Google user info:', error);
    throw error;
  }
};

// Refresh access token using refresh token
export const refreshGoogleAccessToken = async (refreshToken: string) => {
  try {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Token refresh failed: ${errorData.error_description || errorData.error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
};

// Calendar Event Interfaces
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus: string;
  }>;
  location?: string;
  creator?: {
    email: string;
    displayName?: string;
  };
  status: string;
  htmlLink: string;
}

export interface GoogleCalendarList {
  kind: string;
  etag: string;
  summary: string;
  items: GoogleCalendarEvent[];
  nextPageToken?: string;
}

// Get user's calendar events
export const getCalendarEvents = async (
  accessToken: string,
  calendarId: string = 'primary',
  timeMin?: string,
  timeMax?: string,
  maxResults: number = 50
): Promise<GoogleCalendarEvent[]> => {
  try {
    const params = new URLSearchParams({
      calendarId,
      maxResults: maxResults.toString(),
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    if (timeMin) params.append('timeMin', timeMin);
    if (timeMax) params.append('timeMax', timeMax);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }

    const data: GoogleCalendarList = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};

// Get user's calendar list
export const getCalendarList = async (accessToken: string) => {
  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch calendar list');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching calendar list:', error);
    throw error;
  }
};

// Helper function to ensure valid access token
export const ensureValidAccessToken = async (integration: CalendarIntegration): Promise<string> => {
  try {
    console.log("Checking token validity. Expires at:", integration.expires_at);
    
    // Check if token is expired
    if (integration.expires_at && new Date(integration.expires_at) <= new Date()) {
      console.log("Token is expired, refreshing...");
      
      if (!integration.refresh_token) {
        throw new Error('Token expired and no refresh token available');
      }

      // Refresh the token
      const tokens = await refreshGoogleAccessToken(integration.refresh_token);
      console.log("Token refreshed successfully");
      
      const expiresAt = tokens.expires_in 
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null;

      // Update the integration with new token (but don't trigger re-renders)
      await updateCalendarIntegration(integration.id, {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || integration.refresh_token,
        expires_at: expiresAt,
        status: 'connected'
      });

      return tokens.access_token;
    }

    console.log("Token is still valid");
    return integration.access_token!;
  } catch (error) {
    console.error('Error ensuring valid access token:', error);
    // Don't update status to error automatically to prevent loops
    throw error;
  }
};
