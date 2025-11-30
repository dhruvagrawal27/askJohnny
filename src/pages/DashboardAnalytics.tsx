import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  PhoneCall,
  Clock,
  TrendingUp,
  Phone,
  UserCheck,
  UserX,
  PieChart,
  Users,
  AlertTriangle,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { fetchUserByClerkId, getCampaignsByClerkId } from "../lib/dataService";

const DashboardAnalytics: React.FC = () => {
  // Clerk user
  const { user, isLoaded, isSignedIn } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [allAgentIds, setAllAgentIds] = useState<string[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [callsLoading, setCallsLoading] = useState(false);
  const [callsError, setCallsError] = useState<string | null>(null);
  const [userDataLoading, setUserDataLoading] = useState(false);

  // Fetch user data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoaded || !isSignedIn || !user) return;
      
      setUserDataLoading(true);
      try {
        console.log('Fetching user data for analytics...');
        const userEmail = user.emailAddresses[0]?.emailAddress || user.id + '@clerk.temp';
        const userData = await fetchUserByClerkId(user.id, userEmail, false);
        
        if (!userData) {
          console.log('No user data found for analytics');
          setUserData(null);
          return;
        }
        
        console.log('User data loaded for analytics:', userData);
        setUserData(userData);
      } catch (e: any) {
        console.error('Error fetching user data for analytics:', e);
        setUserData(null);
      } finally {
        setUserDataLoading(false);
      }
    };

    // Fetch campaigns to get all agent IDs
    const fetchCampaigns = async () => {
      if (!isLoaded || !isSignedIn || !user) return;
      try {
        console.log('Fetching campaigns for analytics agent IDs...');
        const campaignsData = await getCampaignsByClerkId(user.id);
        setCampaigns(campaignsData || []);
        console.log('Analytics campaigns loaded:', campaignsData);
      } catch (e: any) {
        console.error('Error fetching campaigns for analytics:', e);
        setCampaigns([]);
      }
    };
    
    fetchUserData();
    fetchCampaigns();
  }, [isLoaded, isSignedIn, user]);

  // Combine all agent IDs (initial + campaign agents)
  useEffect(() => {
    const agentIds: string[] = [];
    
    // Add initial agent ID
    if (userData?.agent_id) {
      agentIds.push(userData.agent_id);
    }
    
    // Add campaign agent IDs
    campaigns.forEach(campaign => {
      if (campaign.agent_id && !agentIds.includes(campaign.agent_id)) {
        agentIds.push(campaign.agent_id);
      }
    });
    
    console.log('Combined agent IDs for analytics:', agentIds);
    setAllAgentIds(agentIds);
  }, [userData, campaigns]);

  // Fetch call history from Vapi API when agent IDs are available
  useEffect(() => {
    const fetchCalls = async () => {
      if (!allAgentIds || allAgentIds.length === 0) {
        console.log('No agent IDs available for fetching analytics calls');
        setCalls([]);
        return;
      }
      
      setCallsLoading(true);
      setCallsError(null);
      
      try {
        console.log('Fetching analytics calls for all agent IDs:', allAgentIds);
        
        const VAPI_KEY = import.meta.env.VITE_VAPI_KEY;
        if (!VAPI_KEY) {
          throw new Error('VAPI key not configured');
        }

        // Call VAPI API directly to get all calls
        const response = await fetch('https://api.vapi.ai/call', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${VAPI_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`VAPI API error: ${response.status} - ${errorText}`);
        }

        const allCalls = await response.json();
        console.log('All calls from VAPI for analytics:', allCalls);

        // Filter calls for all agent IDs
        const userCalls = Array.isArray(allCalls) 
          ? allCalls.filter(call => {
              const callAgentId = call.assistant?.id || call.assistantId;
              return allAgentIds.includes(callAgentId);
            })
          : [];
          
        console.log(`Filtered ${userCalls.length} analytics calls for ${allAgentIds.length} agents`);
        setCalls(userCalls);
      } catch (e: any) {
        console.error('Error fetching analytics calls from VAPI:', e);
        setCallsError(e?.message || "Failed to fetch call history");
        setCalls([]);
      } finally {
        setCallsLoading(false);
      }
    };
    
    fetchCalls();
  }, [allAgentIds]); // Changed dependency from userData?.agent_id to allAgentIds

  // ========== Analytics Computation ========== //
  const analytics = useMemo(() => {
    if (!calls || calls.length === 0) {
      return {
        totalCalls: 0,
        callsThisWeek: 0,
        minutesUsed: 0,
        minutesQuota: 300,
        avgDuration: 0,
        avgDurationStr: "0m 0s",
        answerRate: 0,
        conversionRate: 0,
        uniqueCallers: 0,
        peakHour: null,
        costTotal: 0,
        costBreakdown: {},
        callVolumeByDay: [0, 0, 0, 0, 0, 0, 0],
        durationByDay: [0, 0, 0, 0, 0, 0, 0],
        categories: {},
        missedCalls: 0,
        answeredCalls: 0,
        failedCalls: 0,
        topCallers: [],
      };
    }
    // Helper: get week start
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    let totalDuration = 0;
    let answered = 0;
    let missed = 0;
    let failed = 0;
    let costTotal = 0;
    let costBreakdown: Record<string, number> = {};
    let uniqueCallersSet = new Set();
    let callVolumeByDay = [0, 0, 0, 0, 0, 0, 0];
    let durationByDay = [0, 0, 0, 0, 0, 0, 0];
    let categories: Record<string, number> = {};
    let callsThisWeek = 0;
    let callersCount: Record<string, number> = {};

    calls.forEach((call) => {
      // Parse startedAt
      const startedAt = call.startedAt ? new Date(call.startedAt) : null;
      const endedAt = call.endedAt ? new Date(call.endedAt) : null;
      // Duration in seconds
      let duration = 0;
      if (startedAt && endedAt) {
        duration = (endedAt.getTime() - startedAt.getTime()) / 1000;
      }
      totalDuration += duration;
      // Answered/missed/failed
      if (call.status === "completed" || call.status === "answered") answered++;
      else if (call.status === "missed") missed++;
      else if (
        call.status === "failed" ||
        call.status === "call-start-error-neither-assistant-nor-server-set"
      )
        failed++;
      // Cost
      if (typeof call.cost === "number") costTotal += call.cost;
      if (call.costBreakdown) {
        Object.entries(call.costBreakdown).forEach(([k, v]) => {
          if (typeof v === "number")
            costBreakdown[k] = (costBreakdown[k] || 0) + v;
        });
      }
      // Unique callers
      if (call.customer?.externalId)
        uniqueCallersSet.add(call.customer.externalId);
      // By day of week
      if (startedAt) {
        const day = startedAt.getDay();
        callVolumeByDay[day]++;
        durationByDay[day] += duration / 60; // minutes
        // This week?
        if (startedAt >= weekStart) callsThisWeek++;
      }
      // Categories (by type)
      if (call.type) categories[call.type] = (categories[call.type] || 0) + 1;
      // Top callers
      if (call.customer?.externalId) {
        callersCount[call.customer.externalId] =
          (callersCount[call.customer.externalId] || 0) + 1;
      }
    });
    const totalCalls = calls.length;
    const avgDuration = totalCalls ? totalDuration / totalCalls : 0;
    const avgDurationStr = `${Math.floor(avgDuration / 60)}m ${Math.round(
      avgDuration % 60
    )}s`;
    const answerRate = totalCalls ? (answered / totalCalls) * 100 : 0;
    const conversionRate = totalCalls ? (answered / totalCalls) * 100 : 0; // Placeholder: define conversion logic
    const uniqueCallers = uniqueCallersSet.size;
    // Peak hour (by startedAt hour)
    let hourCounts: Record<number, number> = {};
    calls.forEach((call) => {
      if (call.startedAt) {
        const h = new Date(call.startedAt).getHours();
        hourCounts[h] = (hourCounts[h] || 0) + 1;
      }
    });
    let peakHour = null;
    let maxHourCount = 0;
    Object.entries(hourCounts).forEach(([h, c]) => {
      if (c > maxHourCount) {
        maxHourCount = c;
        peakHour = h;
      }
    });
    // Top callers
    const topCallers = Object.entries(callersCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, count]) => ({ id, count }));
    return {
      totalCalls,
      callsThisWeek,
      minutesUsed: Math.round(totalDuration / 60),
      minutesQuota: 300,
      avgDuration,
      avgDurationStr,
      answerRate: Math.round(answerRate),
      conversionRate: Math.round(conversionRate),
      uniqueCallers,
      peakHour,
      costTotal: +costTotal.toFixed(2),
      costBreakdown,
      callVolumeByDay,
      durationByDay,
      categories,
      missedCalls: missed,
      answeredCalls: answered,
      failedCalls: failed,
      topCallers,
    };
  }, [calls]);

  // ========== UI ========== //
  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <div className="flex items-center gap-4">
          {userDataLoading && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Loading user data...
            </span>
          )}
          {callsLoading && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Loading call data...
            </span>
          )}
          {callsError && (
            <span className="text-xs text-rose-500">
              <AlertTriangle className="inline w-4 h-4 mr-1" />
              {callsError}
            </span>
          )}
          {userData?.agent_id && (
            <span className="text-xs text-green-600">
              Tracking {allAgentIds.length} agent(s): {allAgentIds.join(', ') || userData.agent_id}
            </span>
          )}
        </div>
      </div>

      {/* Debug Info */}
      {!allAgentIds || allAgentIds.length === 0 && !userDataLoading && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">No Agent IDs Found</p>
                <p className="text-xs text-yellow-700">
                  Please complete agent training from the main dashboard to enable call analytics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {allAgentIds && allAgentIds.length > 0 && calls.length === 0 && !callsLoading && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">No Calls Yet</p>
                <p className="text-xs text-blue-700">
                  Make your first call to see analytics data here. Tracking {allAgentIds.length} agent(s): {allAgentIds.join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {/* Total Calls */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Calls
                </p>
                <p className="text-4xl font-bold mb-1">
                  {analytics.totalCalls}
                </p>
                <p className="text-xs text-muted-foreground">
                  {analytics.callsThisWeek} calls this week
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full">
                <PhoneCall className="h-6 w-6 text-[#A26BFF]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Minutes Used */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Minutes Used
                </p>
                <p className="text-4xl font-bold mb-1">
                  <span>{analytics.minutesUsed}</span>
                  <span className="text-lg text-muted-foreground">
                    {" "}
                    / {analytics.minutesQuota}
                  </span>
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Usage</span>
                  <span className="font-bold">
                    {analytics.minutesQuota
                      ? Math.round(
                          (analytics.minutesUsed / analytics.minutesQuota) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#A26BFF] to-[#7A57FF] h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        analytics.minutesQuota
                          ? Math.round(
                              (analytics.minutesUsed / analytics.minutesQuota) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full ml-4">
                <Clock className="h-6 w-6 text-[#7A57FF]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg. Duration & Answer Rate */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Avg. Duration
                </p>
                <p className="text-4xl font-bold mb-1">
                  {analytics.avgDurationStr}
                </p>
                <p className="text-xs text-muted-foreground">
                  {analytics.answerRate}% answer rate
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full">
                <Clock className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate & Unique Callers */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Conversion Rate
                </p>
                <p className="text-4xl font-bold mb-1">
                  {analytics.conversionRate}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {analytics.uniqueCallers} unique callers
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* More Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {/* Missed Calls */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Missed Calls
                </p>
                <p className="text-3xl font-bold mb-1">
                  {analytics.missedCalls}
                </p>
                <p className="text-xs text-muted-foreground">
                  Failed: {analytics.failedCalls}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <UserX className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Answered Calls */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Answered Calls
                </p>
                <p className="text-3xl font-bold mb-1">
                  {analytics.answeredCalls}
                </p>
                <p className="text-xs text-muted-foreground">
                  Top caller: {analytics.topCallers[0]?.id || "-"}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <UserCheck className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Peak Hour */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Peak Hour</p>
                <p className="text-3xl font-bold mb-1">
                  {analytics.peakHour !== null
                    ? `${analytics.peakHour}:00`
                    : "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Most active hour
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Volume Trends */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">
                  Call Volume Trends
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Daily distribution and average duration
                </p>
              </div>
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                Peak:{" "}
                {analytics.peakHour !== null
                  ? `${analytics.peakHour}:00 - ${analytics.peakHour + 1}:00`
                  : "-"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            {/* Simple Bar Chart for Call Volume by Day */}
            <div className="relative h-full w-full">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground py-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>
                    {Math.max(...analytics.callVolumeByDay, 4) - i}
                  </span>
                ))}
              </div>
              {/* Chart area */}
              <div
                className="ml-8 h-full border-b border-l border-gray-200 relative flex items-end overflow-hidden"
                style={{ height: "100%" }}
              >
                {analytics.callVolumeByDay.map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center justify-end mx-1"
                    style={{ minWidth: 0 }}
                  >
                    <div
                      className="w-4 md:w-6 bg-purple-600 rounded-t transition-all duration-300 flex-grow-0 max-h-full"
                      style={{
                        height: `${v === 0 ? 4 : Math.max(16, v * 18)}px`,
                        maxHeight: "100%",
                      }}
                    ></div>
                    <span className="text-xs mt-1 text-muted-foreground">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call Categories Pie Chart (textual) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Call Categories
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Topic distribution analysis
            </p>
          </CardHeader>
          <CardContent className="h-64 flex flex-col items-center justify-center">
            {Object.keys(analytics.categories).length === 0 ? (
              <div className="text-center">
                <p className="text-muted-foreground text-lg font-medium">
                  No call data available
                </p>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-2">
                {Object.entries(analytics.categories).map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">{cat}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {count} calls
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Callers Section */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Top Callers
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Most frequent callers (by externalId)
            </p>
          </CardHeader>
          <CardContent>
            {analytics.topCallers.length === 0 ? (
              <p className="text-muted-foreground">No call data available</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {analytics.topCallers.map((caller, idx) => (
                  <li key={caller.id} className="flex items-center py-2">
                    <span className="font-semibold mr-2">#{idx + 1}</span>
                    <span className="truncate max-w-xs">{caller.id}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {caller.count} calls
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
