import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  Loader2,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  CalendarIntegration,
  GoogleCalendarEvent,
  getCalendarEvents,
  ensureValidAccessToken
} from "../lib/googleCalendarService";

interface GoogleCalendarViewProps {
  integration: CalendarIntegration;
  onIntegrationUpdate: () => void;
}

export const GoogleCalendarView: React.FC<GoogleCalendarViewProps> = ({
  integration,
  onIntegrationUpdate
}) => {
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load calendar events
  const loadEvents = async () => {
    if (!integration.access_token) {
      console.log("No access token available");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("Loading calendar events for integration:", integration.id);

      // Get start and end of the week
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      console.log("Date range:", startOfWeek.toISOString(), "to", endOfWeek.toISOString());

      const validAccessToken = await ensureValidAccessToken(integration);
      console.log("Got valid access token, fetching events...");
      
      const calendarEvents = await getCalendarEvents(
        validAccessToken,
        'primary',
        startOfWeek.toISOString(),
        endOfWeek.toISOString(),
        50
      );

      console.log("Fetched calendar events:", calendarEvents);
      setEvents(calendarEvents);
      // onIntegrationUpdate(); // Removed to prevent infinite loops
    } catch (error) {
      console.error('Error loading calendar events:', error);
      setError(error.message || 'Failed to load calendar events');
    } finally {
      setIsLoading(false);
    }
  };

  // Load events when integration or date changes
  useEffect(() => {
    if (integration.status === 'connected') {
      loadEvents();
    }
  }, [integration, currentDate]);

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format event time
  const formatEventTime = (event: GoogleCalendarEvent) => {
    if (event.start.date) {
      // All-day event
      return 'All day';
    }

    if (event.start.dateTime && event.end.dateTime) {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      
      return `${start.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      })} - ${end.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      })}`;
    }

    return '';
  };

  // Format event date
  const formatEventDate = (event: GoogleCalendarEvent) => {
    const date = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date!);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get week range display
  const getWeekRange = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return `${startOfWeek.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} - ${endOfWeek.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })}`;
  };

  // Group events by date
  const groupEventsByDate = (events: GoogleCalendarEvent[]) => {
    const grouped: { [key: string]: GoogleCalendarEvent[] } = {};
    
    events.forEach(event => {
      const date = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date!);
      const dateKey = date.toDateString();
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  };

  const groupedEvents = groupEventsByDate(events);

  if (integration.status !== 'connected') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {integration.status === 'expired' 
                ? 'Calendar integration has expired. Please refresh the connection.' 
                : 'Calendar integration is not connected.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Google Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadEvents}
              disabled={isLoading}
              className="gap-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">{getWeekRange()}</span>
            <Button variant="ghost" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 text-gray-300 mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading calendar events...</p>
          </div>
        ) : Object.keys(groupedEvents).length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground">No events found for this week.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your upcoming events will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEvents)
              .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
              .map(([dateKey, dayEvents]) => (
                <div key={dateKey}>
                  <h3 className="font-medium text-foreground mb-3">
                    {new Date(dateKey).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  <div className="space-y-2">
                    {dayEvents
                      .sort((a, b) => {
                        const timeA = a.start.dateTime || a.start.date!;
                        const timeB = b.start.dateTime || b.start.date!;
                        return new Date(timeA).getTime() - new Date(timeB).getTime();
                      })
                      .map((event) => (
                        <div
                          key={event.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-foreground">
                                  {event.summary || 'Untitled Event'}
                                </h4>
                                {event.status === 'confirmed' && (
                                  <Badge variant="secondary" className="text-xs">
                                    Confirmed
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatEventTime(event)}
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate max-w-[200px]">
                                      {event.location}
                                    </span>
                                  </div>
                                )}
                                {event.attendees && event.attendees.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {event.attendees.length} attendee{event.attendees.length > 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>

                              {event.description && (
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(event.htmlLink, '_blank')}
                              className="ml-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
