// Google Calendar API Helper for Agent Usage
// This service provides functions that your AI agent can use to interact with Google Calendar

import { getCalendarIntegration } from './googleCalendarService';

interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
}

interface AvailabilitySlot {
  start: string;
  end: string;
  available: boolean;
}

// Get fresh access token using refresh token
export const getFreshAccessToken = async (refreshToken: string): Promise<string> => {
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

  const data = await response.json();
  return data.access_token;
};

// Check availability for a specific time range
export const checkAvailability = async (
  accessToken: string,
  startTime: string,
  endTime: string,
  timeZone: string = 'UTC'
): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/freeBusy`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeMin: startTime,
          timeMax: endTime,
          timeZone: timeZone,
          items: [{ id: 'primary' }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to check availability: ${response.statusText}`);
    }

    const data = await response.json();
    const busyTimes = data.calendars?.primary?.busy || [];
    
    // If there are any busy times in the requested range, user is not available
    return busyTimes.length === 0;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
};

// Get available time slots for a specific date
export const getAvailableSlots = async (
  accessToken: string,
  date: string, // YYYY-MM-DD format
  workingHours: { start: string; end: string } = { start: '09:00', end: '17:00' },
  slotDuration: number = 60, // minutes
  timeZone: string = 'UTC'
): Promise<AvailabilitySlot[]> => {
  try {
    const startTime = `${date}T${workingHours.start}:00`;
    const endTime = `${date}T${workingHours.end}:00`;

    // Get busy times for the day
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/freeBusy`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeMin: startTime,
          timeMax: endTime,
          timeZone: timeZone,
          items: [{ id: 'primary' }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get availability: ${response.statusText}`);
    }

    const data = await response.json();
    const busyTimes = data.calendars?.primary?.busy || [];

    // Generate time slots
    const slots: AvailabilitySlot[] = [];
    const startDateTime = new Date(`${date}T${workingHours.start}:00`);
    const endDateTime = new Date(`${date}T${workingHours.end}:00`);
    
    let currentTime = new Date(startDateTime);
    
    while (currentTime < endDateTime) {
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60 * 1000);
      
      // Check if this slot conflicts with any busy time
      const isAvailable = !busyTimes.some((busy: any) => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        
        return (
          (slotStart >= busyStart && slotStart < busyEnd) ||
          (slotEnd > busyStart && slotEnd <= busyEnd) ||
          (slotStart <= busyStart && slotEnd >= busyEnd)
        );
      });
      
      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        available: isAvailable,
      });
      
      currentTime = new Date(currentTime.getTime() + slotDuration * 60 * 1000);
    }
    
    return slots;
  } catch (error) {
    console.error('Error getting available slots:', error);
    throw error;
  }
};

// Create a calendar event
export const createCalendarEvent = async (
  accessToken: string,
  event: CalendarEvent
): Promise<any> => {
  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to create event: ${response.statusText} - ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

// Get upcoming events
export const getUpcomingEvents = async (
  accessToken: string,
  maxResults: number = 10,
  timeMin?: string,
  timeMax?: string
): Promise<any[]> => {
  try {
    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      orderBy: 'startTime',
      singleEvents: 'true',
    });

    if (timeMin) params.append('timeMin', timeMin);
    if (timeMax) params.append('timeMax', timeMax);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get events: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    throw error;
  }
};

// Example usage functions for your AI agent

// Agent function: Check if user is available for a meeting
export const agentCheckAvailability = async (
  userId: string,
  startDateTime: string,
  endDateTime: string
): Promise<{ available: boolean; message: string }> => {
  try {
    // Get user's calendar integration from your database
    // This would be called from your backend/agent
    const integration = await getCalendarIntegration(userId, 'google');
    
    if (!integration || !integration.refresh_token) {
      return {
        available: false,
        message: 'Calendar integration not found or invalid. Please connect your Google Calendar first.'
      };
    }

    // Get fresh access token
    const accessToken = await getFreshAccessToken(integration.refresh_token);
    
    // Check availability
    const isAvailable = await checkAvailability(accessToken, startDateTime, endDateTime);
    
    return {
      available: isAvailable,
      message: isAvailable 
        ? 'You are available during this time.' 
        : 'You have a conflict during this time.'
    };
  } catch (error) {
    console.error('Error in agentCheckAvailability:', error);
    return {
      available: false,
      message: 'Sorry, I encountered an error while checking your calendar. Please try again.'
    };
  }
};

// Agent function: Schedule a meeting
export const agentScheduleMeeting = async (
  userId: string,
  eventDetails: {
    title: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    attendeeEmail?: string;
    attendeeName?: string;
  }
): Promise<{ success: boolean; message: string; eventLink?: string }> => {
  try {
    // Get user's calendar integration
    const integration = await getCalendarIntegration(userId, 'google');
    
    if (!integration || !integration.refresh_token) {
      return {
        success: false,
        message: 'Calendar integration not found. Please connect your Google Calendar first.'
      };
    }

    // Get fresh access token
    const accessToken = await getFreshAccessToken(integration.refresh_token);
    
    // First, check if the time slot is available
    const isAvailable = await checkAvailability(
      accessToken,
      eventDetails.startDateTime,
      eventDetails.endDateTime
    );

    if (!isAvailable) {
      return {
        success: false,
        message: 'This time slot is not available. Please choose a different time.'
      };
    }

    // Create the calendar event
    const event: CalendarEvent = {
      summary: eventDetails.title,
      description: eventDetails.description,
      start: {
        dateTime: eventDetails.startDateTime,
      },
      end: {
        dateTime: eventDetails.endDateTime,
      },
    };

    if (eventDetails.attendeeEmail) {
      event.attendees = [{
        email: eventDetails.attendeeEmail,
        displayName: eventDetails.attendeeName,
      }];
    }

    const createdEvent = await createCalendarEvent(accessToken, event);
    
    return {
      success: true,
      message: 'Meeting scheduled successfully!',
      eventLink: createdEvent.htmlLink
    };
  } catch (error) {
    console.error('Error in agentScheduleMeeting:', error);
    return {
      success: false,
      message: 'Sorry, I encountered an error while scheduling the meeting. Please try again.'
    };
  }
};

// Note: You'll need to import getCalendarIntegration from your service
// This is just showing the structure for agent usage
