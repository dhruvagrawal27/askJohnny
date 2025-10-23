import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  Trash2,
  RefreshCw,
  Clock,
  User,
  Mail
} from 'lucide-react';
import { useUser } from "@clerk/clerk-react";
import {
  CalendarIntegration,
  getCalendarIntegrations,
  getCalendarIntegration,
  createCalendarIntegration,
  updateCalendarIntegration,
  deleteCalendarIntegration,
  upsertCalendarIntegration,
  generateGoogleAuthUrl,
  exchangeCodeForTokens,
  getGoogleUserInfo,
  refreshGoogleAccessToken
} from "../lib/googleCalendarService";
import { GoogleCalendarView } from "../components/GoogleCalendarView";

export const DashboardIntegrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthProcessed, setOauthProcessed] = useState(false);
  
  const { isLoaded, isSignedIn, user } = useUser();

  // Load integrations
  const loadIntegrations = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const userIntegrations = await getCalendarIntegrations(user.id);
      setIntegrations(userIntegrations);
      console.log("Loaded integrations:", userIntegrations);
    } catch (error) {
      console.error("Error loading integrations:", error);
      setError("Failed to load integrations");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      loadIntegrations();
    }
  }, [isLoaded, isSignedIn, user]); // Removed loadIntegrations from dependencies

  // Handle OAuth callback from URL params
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (!user || oauthProcessed) return;

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        setError(`OAuth error: ${error}`);
        setOauthProcessed(true);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (code && state === 'google_calendar') {
        setOauthProcessed(true); // Prevent multiple processing
        setIsConnecting(true);
        try {
          console.log("Processing OAuth callback for user:", user.id);
          
          // Exchange code for tokens
          const tokens = await exchangeCodeForTokens(code);
          console.log("Received tokens:", tokens);

          // Get user info from Google
          const googleUser = await getGoogleUserInfo(tokens.access_token);
          console.log("Google user info:", googleUser);

          // Calculate expiry time
          const expiresAt = tokens.expires_in 
            ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
            : null;

          console.log("Upserting calendar integration...");
          // Upsert integration (create or update if exists)
          await upsertCalendarIntegration({
            user_id: user.id,
            provider: 'google',
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: expiresAt,
            email: googleUser.email,
            name: googleUser.name
          });

          console.log("Calendar integration upserted successfully");
          // Reload integrations
          await loadIntegrations();

          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
        } catch (error) {
          console.error("OAuth callback error:", error);
          setError(`Failed to connect Google Calendar: ${error.message}`);
        } finally {
          setIsConnecting(false);
        }
      }
    };

    handleOAuthCallback();
  }, [user, oauthProcessed]); // Removed loadIntegrations from dependencies

  // Connect to Google Calendar
  const connectGoogleCalendar = () => {
    // Clear any previous error
    setError(null);
    const authUrl = generateGoogleAuthUrl();
    // Add state parameter to identify the provider
    const urlWithState = `${authUrl}&state=google_calendar`;
    window.location.href = urlWithState;
  };

  // Disconnect integration
  const disconnectIntegration = async (integration: CalendarIntegration) => {
    try {
      await deleteCalendarIntegration(integration.id);
      await loadIntegrations();
    } catch (error) {
      console.error("Error disconnecting integration:", error);
      setError("Failed to disconnect integration");
    }
  };

  // Refresh integration
  const refreshIntegration = async (integration: CalendarIntegration) => {
    if (!integration.refresh_token) {
      setError("No refresh token available. Please reconnect.");
      return;
    }

    try {
      const tokens = await refreshGoogleAccessToken(integration.refresh_token);
      
      const expiresAt = tokens.expires_in 
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null;

      await updateCalendarIntegration(integration.id, {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || integration.refresh_token,
        expires_at: expiresAt,
        status: 'connected'
      });

      await loadIntegrations();
    } catch (error) {
      console.error("Error refreshing integration:", error);
      setError("Failed to refresh integration");
    }
  };

  const getIntegrationIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return <Calendar className="h-8 w-8 text-blue-600" />;
      default:
        return <Calendar className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
            <CheckCircle className="h-3 w-3" />
            Connected
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1">
            <Clock className="h-3 w-3" />
            Expired
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1">
            <AlertCircle className="h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="p-8 space-y-6">
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Connect your calendar and other services to enable advanced features for your AI assistant.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
            <div className="ml-auto flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={loadIntegrations}
                className="text-blue-600 hover:text-blue-800"
              >
                Refresh
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setError(null)}
              >
                ×
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {integrations.length > 0 && integrations.some(i => i.provider === 'google' && i.status === 'connected') && (
        <GoogleCalendarView 
          integration={integrations.find(i => i.provider === 'google' && i.status === 'connected')!}
          onIntegrationUpdate={loadIntegrations}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Integrations */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Available Integrations</CardTitle>
              <p className="text-sm text-muted-foreground">
                Connect your favorite services to enhance your AI assistant's capabilities
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Google Calendar Integration */}
              {!integrations.some(i => i.provider === 'google' && i.status === 'connected') && (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Google Calendar</h3>
                      <p className="text-sm text-muted-foreground">
                        Enable appointment scheduling and availability checking
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={connectGoogleCalendar}
                    disabled={isConnecting}
                    className="gap-2"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Show connected status for Google Calendar */}
              {integrations.some(i => i.provider === 'google' && i.status === 'connected') && (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800">Google Calendar</h3>
                      <p className="text-sm text-green-600">
                        Successfully connected and ready to use
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </Badge>
                </div>
              )}

              {/* Future integrations placeholder */}
              <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Settings className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">More Integrations</h3>
                    <p className="text-sm text-muted-foreground">
                      Additional integrations coming soon
                    </p>
                  </div>
                </div>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Integration Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Why Connect Calendar?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">AI-Powered Scheduling</h4>
                  <p className="text-sm text-muted-foreground">
                    Your AI agent can access your calendar to check availability and schedule appointments
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Real-time Availability</h4>
                  <p className="text-sm text-muted-foreground">
                    The agent can check your real-time availability and suggest optimal meeting times
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Calendar Management</h4>
                  <p className="text-sm text-muted-foreground">
                    View and manage your schedule directly from the dashboard
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connected Integrations */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Connected Integrations</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your active integrations
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">Loading integrations...</p>
                </div>
              ) : integrations.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">No integrations connected yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connect your first integration to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {integrations.map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          {getIntegrationIcon(integration.provider)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium capitalize">
                              {integration.provider} Calendar
                            </h4>
                            {getStatusBadge(integration.status)}
                          </div>
                          {integration.email && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <Mail className="h-3 w-3" />
                              {integration.email}
                            </div>
                          )}
                          {integration.name && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              {integration.name}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Connected: {formatDate(integration.connected_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {integration.status === 'expired' && integration.refresh_token && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => refreshIntegration(integration)}
                            className="gap-1"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Refresh
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => disconnectIntegration(integration)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
