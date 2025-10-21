import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  PhoneCall,
  Clock,
  TrendingUp,
  Phone,
  DollarSign,
  UserCheck,
  UserX,
  PieChart,
  Users,
  AlertTriangle,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";

const DashboardAnalytics: React.FC = () => {
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  // Clerk user
  const { user, isLoaded, isSignedIn } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [calls, setCalls] = useState<any[]>([]);
  const [callsLoading, setCallsLoading] = useState(false);
  const [callsError, setCallsError] = useState<string | null>(null);

  // Fetch user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoaded || !isSignedIn || !user) return;
      try {
        const res = await fetch(
          `${VITE_BACKEND_BASE_URL}/api/users/clerk/${user.id}`
        );
        if (!res.ok) throw new Error("Failed to fetch user data from backend");
        const data = await res.json();
        setUserData(data);
        // console.log("Fetched user data:", data);
      } catch (e: any) {
        // Optionally handle error here if you want to show a userData error
      }
    };
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user]);

  // Fetch call history from Vapi API when agent_id is available
  useEffect(() => {
    const fetchCalls = async () => {
      if (!userData?.agent_id) return;
      setCallsLoading(true);
      setCallsError(null);
      try {
        const baseUrl =
          (import.meta as any).env.VITE_BACKEND_BASE_URL ||
          "http://localhost:3000";
        const url = `${baseUrl}/api/users/vapi-call?assistant_id=${encodeURIComponent(
          userData.agent_id
        )}`;
        const res = await fetch(url, { method: "GET" });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err?.error || "Failed to fetch call history");
        }
        const data = await res.json();
        setCalls(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setCallsError(e?.message || "Unknown error fetching calls");
        setCalls([]);
      } finally {
        setCallsLoading(false);
      }
    };
    fetchCalls();
  }, [userData?.agent_id]);

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
        {callsLoading && (
          <span className="text-xs text-muted-foreground animate-pulse">
            Loading data...
          </span>
        )}
        {callsError && (
          <span className="text-xs text-red-500">
            <AlertTriangle className="inline w-4 h-4 mr-1" />
            {callsError}
          </span>
        )}
      </div>

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
              <div className="p-3 bg-red-50 rounded-full">
                <PhoneCall className="h-6 w-6 text-red-500" />
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
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
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
              <div className="p-3 bg-red-50 rounded-full ml-4">
                <Clock className="h-6 w-6 text-red-500" />
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
              <div className="p-3 bg-red-50 rounded-full">
                <Clock className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate & Unique Callers */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            export default DashboardAnalytics;
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
              <div className="p-3 bg-red-50 rounded-full">
                <TrendingUp className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* More Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {/* Cost */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
                <p className="text-3xl font-bold mb-1">
                  ${analytics.costTotal}
                </p>
                <p className="text-xs text-muted-foreground">
                  Transport: $
                  {analytics.costBreakdown.transport?.toFixed(2) || 0}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
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
