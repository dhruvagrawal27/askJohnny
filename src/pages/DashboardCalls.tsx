import React, { useState, useEffect, useMemo } from "react";
import { CallDetailsModal } from "@/components/CallDetailsModal";
import { useUser } from "@clerk/clerk-react";
import { fetchUserByClerkId, getCampaignsByClerkId } from "../lib/dataService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  Search,
  Play,
  Clock,
  Users,
  PhoneCall,
  RefreshCw,
  X,
  User,
  Hash,
  MessageSquare,
} from "lucide-react";
// import { VapiClient, Vapi, VapiError } from "@vapi-ai/server-sdk";
import {
  format,
  isToday,
  isThisWeek,
  isThisMonth,
  differenceInSeconds,
} from "date-fns";

// Type for new backend call object
type Call = {
  id: string;
  orgId?: string;
  createdAt?: string;
  updatedAt?: string;
  type?: string;
  status?: string;
  startedAt?: string;
  endedAt?: string;
  cost?: number;
  costs?: Array<{
    type: string;
    provider: string;
    minutes: number;
    cost: number;
  }>;
  analysis?: {
    summary?: string;
    structuredData?: Record<string, any>;
    structuredDataMulti?: Array<Record<string, any>>;
    successEvaluation?: string;
  };
  artifact?: {
    transcript?: string;
    recordingUrl?: string;
    stereoRecordingUrl?: string;
    videoRecordingUrl?: string;
  };
  destination?: {
    number?: string;
    callerId?: string;
    description?: string;
  };
  phoneNumber?: {
    number?: string;
    name?: string;
    email?: string;
  };
  customer?: {
    name?: string;
    number?: string;
    email?: string;
  };
  [key: string]: any;
};

export const DashboardCalls: React.FC = () => {
  // Clerk user
  const { user, isSignedIn, isLoaded } = useUser();

  // User data state
  const [userData, setUserData] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [allAgentIds, setAllAgentIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTime, setFilterTime] = useState("all-time");
  const [filterNotes, setFilterNotes] = useState("all-notes");
  const [filterPriority, setFilterPriority] = useState("all-priority");
  const [smartSearchActive, setSmartSearchActive] = useState(true);
  const [showPerPage, setShowPerPage] = useState("10");
  const [calls, setCalls] = useState<Call[]>([]);
  const [callsLoading, setCallsLoading] = useState(false);
  const [callsError, setCallsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  // Modal state for call details
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ================== Bootstrap & Refresh ==================
  const fetchUserData = async () => {
    if (!isLoaded || !isSignedIn || !user) return;
    try {
      const userEmail = user.emailAddresses[0]?.emailAddress || user.id + '@clerk.temp';
      const data = await fetchUserByClerkId(user.id, userEmail, false);
      setUserData(data);
      console.log("Fetched user data:", data);
    } catch (e: any) {
      console.error("Error fetching user data:", e);
      // Optionally handle error here if you want to show a userData error
    }
  };

  // Fetch campaigns to get all agent IDs
  const fetchCampaigns = async () => {
    if (!isLoaded || !isSignedIn || !user) return;
    try {
      console.log('Fetching campaigns to get agent IDs...');
      const campaignsData = await getCampaignsByClerkId(user.id);
      setCampaigns(campaignsData || []);
      console.log('Campaigns loaded:', campaignsData);
    } catch (e: any) {
      console.error('Error fetching campaigns:', e);
      setCampaigns([]);
    }
  };

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
    
    console.log('Combined agent IDs:', agentIds);
    setAllAgentIds(agentIds);
  }, [userData, campaigns]);

  useEffect(() => {
    fetchUserData();
    fetchCampaigns(); // Add campaign fetching
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user]);

  // Fetch call history from Vapi API directly when agent IDs are available
  useEffect(() => {
    const fetchCalls = async () => {
      if (!allAgentIds || allAgentIds.length === 0) {
        console.log('No agent IDs available for fetching calls');
        setCalls([]);
        return;
      }
      
      setCallsLoading(true);
      setCallsError(null);
      
      try {
        console.log('Fetching calls for all agent IDs:', allAgentIds);
        
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
        console.log('All calls from VAPI:', allCalls);

        // Filter calls for all agent IDs
        const userCalls = Array.isArray(allCalls) 
          ? allCalls.filter(call => {
              const callAgentId = call.assistant?.id || call.assistantId;
              return allAgentIds.includes(callAgentId);
            })
          : [];
          
        console.log(`Filtered ${userCalls.length} calls for ${allAgentIds.length} agents`);
        setCalls(userCalls);
      } catch (e: any) {
        console.error('Error fetching calls from VAPI:', e);
        setCallsError(e?.message || "Failed to fetch call history");
        setCalls([]);
      } finally {
        setCallsLoading(false);
      }
    };
    fetchCalls();
  }, [allAgentIds]); // Changed dependency from userData?.agent_id to allAgentIds

  // Filtering and searching logic
  const filteredCalls = useMemo(() => {
    let filtered = [...calls];
    // Filter by time
    if (filterTime !== "all-time") {
      filtered = filtered.filter((call) => {
        const startedAt = call.startedAt ? new Date(call.startedAt) : null;
        if (!startedAt) return false;
        if (filterTime === "today") return isToday(startedAt);
        if (filterTime === "week")
          return isThisWeek(startedAt, { weekStartsOn: 1 });
        if (filterTime === "month") return isThisMonth(startedAt);
        return true;
      });
    }
    // Filter by notes (from analysis.summary or artifact.transcript)
    if (filterNotes !== "all-notes") {
      filtered = filtered.filter((call) => {
        const hasNotes = !!(
          call.analysis?.summary || call.artifact?.transcript
        );
        if (filterNotes === "with-notes") return hasNotes;
        if (filterNotes === "without-notes") return !hasNotes;
        return true;
      });
    }
    // Filter by priority (mock: high if summary contains 'urgent', low if 'low', else normal)
    if (filterPriority !== "all-priority") {
      filtered = filtered.filter((call) => {
        const summary = call.analysis?.summary?.toLowerCase() || "";
        if (filterPriority === "high") return summary.includes("urgent");
        if (filterPriority === "low") return summary.includes("low");
        if (filterPriority === "normal")
          return !summary.includes("urgent") && !summary.includes("low");
        return true;
      });
    }
    // Search term
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((call) => {
        const name =
          call.analysis?.structuredData?.name?.toLowerCase() ||
          call.customer?.name?.toLowerCase() ||
          "";
        const phone =
          call.analysis?.structuredData?.phone_number?.toLowerCase() ||
          call.customer?.number?.toLowerCase() ||
          call.destination?.number?.toLowerCase() ||
          "";
        const transcript = call.artifact?.transcript?.toLowerCase() || "";
        return (
          name.includes(term) ||
          phone.includes(term) ||
          transcript.includes(term)
        );
      });
    }
    return filtered;
  }, [calls, filterTime, filterNotes, filterPriority, searchTerm]);

  // Pagination
  const perPage = parseInt(showPerPage, 10) || 10;
  const totalPages = Math.ceil(filteredCalls.length / perPage);
  // Sort filteredCalls by startedAt (date/time) descending before paginating
  const paginatedCalls = useMemo(() => {
    const sorted = [...filteredCalls].sort((a, b) => {
      const aDate = a.startedAt ? new Date(a.startedAt).getTime() : 0;
      const bDate = b.startedAt ? new Date(b.startedAt).getTime() : 0;
      return bDate - aDate;
    });
    const start = (currentPage - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [filteredCalls, currentPage, perPage]);

  // Stats
  const totalCalls = calls.length;
  const avgDuration = useMemo(() => {
    if (!calls.length) return "0m 0s";
    let totalSec = 0;
    let count = 0;
    for (const call of calls) {
      if (call.startedAt && call.endedAt) {
        const start = new Date(call.startedAt);
        const end = new Date(call.endedAt);
        const sec = Math.max(0, differenceInSeconds(end, start));
        totalSec += sec;
        count++;
      }
    }
    if (!count) return "0m 0s";
    const avg = Math.round(totalSec / count);
    const m = Math.floor(avg / 60);
    const s = avg % 60;
    return `${m}m ${s}s`;
  }, [calls]);
  const uniqueCallers = useMemo(() => {
    const set = new Set();
    for (const call of calls) {
      const phone =
        call.analysis?.structuredData?.phone_number ||
        call.customer?.number ||
        call.destination?.number;
      if (phone) set.add(phone);
    }
    return set.size;
  }, [calls]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Call History</h1>
          <p className="text-muted-foreground">
            View and manage your recent calls
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {/* Hide: Mark all 0 calls as unread, Mark All Read, Mark All Unread */}
          {/* <span>Mark all 0 calls as unread</span> */}
          <div className="flex items-center gap-2 ml-4">
            {/* <Button variant="ghost" size="sm" className="gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Mark All Read
            </Button>
            <Button variant="ghost" size="sm" className="gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Mark All Unread
            </Button> */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => {
                if (!allAgentIds || allAgentIds.length === 0) return;
                setCallsLoading(true);
                setCallsError(null);
                // re-fetch calls using multi-agent approach
                (async () => {
                  try {
                    console.log('Refreshing calls for all agent IDs:', allAgentIds);
                    
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
                    console.log('Refreshed all calls from VAPI:', allCalls);

                    // Filter calls for all agent IDs
                    const userCalls = Array.isArray(allCalls) 
                      ? allCalls.filter(call => {
                          const callAgentId = call.assistant?.id || call.assistantId;
                          return allAgentIds.includes(callAgentId);
                        })
                      : [];
                      
                    console.log(`Refreshed: ${userCalls.length} calls for ${allAgentIds.length} agents`);
                    setCalls(userCalls);
                  } catch (e: any) {
                    console.error('Error refreshing calls from VAPI:', e);
                    setCallsError(e?.message || "Failed to refresh call history");
                    setCalls([]);
                  } finally {
                    setCallsLoading(false);
                  }
                })();
              }}
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>

          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Calls
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">{totalCalls}</p>
                  <p className="text-sm text-muted-foreground">
                    in your organization
                  </p>
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <PhoneCall className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Avg. Duration
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">{avgDuration}</p>
                  <p className="text-sm text-muted-foreground">
                    average call time
                  </p>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Unique Callers
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">{uniqueCallers}</p>
                  <p className="text-sm text-muted-foreground">
                    unique phone numbers
                  </p>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Button variant="default" className="rounded-full">
          All Calls
        </Button>
        {/* Hide Incoming/Outgoing tabs until implemented */}
        {/*
        <Button variant="outline" className="rounded-full">
          Incoming
        </Button>
        <Button variant="outline" className="rounded-full">
          Outgoing
        </Button>
        */}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search names, numbers, or call conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-8"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filters:</span>

          <Select value={filterTime} onValueChange={setFilterTime}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterNotes} onValueChange={setFilterNotes}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Notes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-notes">All Notes</SelectItem>
              <SelectItem value="with-notes">With Notes</SelectItem>
              <SelectItem value="without-notes">Without Notes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-priority">All Priority</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Smart Search */}
      {smartSearchActive && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Search className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">
                    Smart Search Active - Enhanced
                  </p>
                  <div className="flex items-center gap-6 mt-2">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700">
                        Caller names
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700">
                        Phone numbers
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700">
                        Call transcripts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSmartSearchActive(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calls Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-muted">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Date & Time / Ended Reason
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-muted">
                {callsLoading ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 bg-muted rounded-full mb-4">
                          <Phone className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          Loading call logs...
                        </h3>
                      </div>
                    </td>
                  </tr>
                ) : callsError ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 bg-muted rounded-full mb-4">
                          <Phone className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold text-red-600 mb-2">
                          Error loading calls
                        </h3>
                        <p className="text-muted-foreground">{callsError}</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedCalls.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 bg-muted rounded-full mb-4">
                          <Phone className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          No call logs found
                        </h3>
                        <p className="text-muted-foreground">
                          No calls have been made or received yet.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCalls.map((call) => {
                    const name =
                      call.customer?.name ||
                      call.analysis?.structuredData?.name ||
                      call.phoneNumber?.name ||
                      "";
                    const phone =
                      call.customer?.number ||
                      call.analysis?.structuredData?.phone_number ||
                      call.destination?.number ||
                      call.phoneNumber?.number ||
                      "WebCall";
                    const startedAt = call.startedAt
                      ? new Date(call.startedAt)
                      : null;
                    const endedAt = call.endedAt
                      ? new Date(call.endedAt)
                      : null;
                    let duration = "-";
                    if (startedAt && endedAt) {
                      const sec = Math.max(
                        0,
                        differenceInSeconds(endedAt, startedAt)
                      );
                      const m = Math.floor(sec / 60);
                      const s = sec % 60;
                      duration = `${m}m ${s}s`;
                    }
                    const dateStr = startedAt
                      ? format(startedAt, "MM/dd/yyyy, hh:mm a")
                      : "-";
                    const endedReason = call.endedReason || "-";
                    const recordingUrl =
                      call.artifact?.recordingUrl ||
                      call.artifact?.stereoRecordingUrl;
                    const transcript = call.artifact?.transcript;
                    return (
                      <tr
                        key={call.id}
                        className="cursor-pointer hover:bg-neutral-200"
                        onClick={() => {
                          setSelectedCall(call);
                          setModalOpen(true);
                        }}
                      >
                        <td className="px-4 py-3 align-top whitespace-nowrap">
                          <div className="font-medium">{phone}</div>
                          {name && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {name}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap">
                          <div>{dateStr}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {endedReason}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap">
                          {duration}
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap">
                          {recordingUrl && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCall(call);
                                setModalOpen(true);
                              }}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {transcript && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCall(call);
                                setModalOpen(true);
                              }}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
                {/* Call Details Modal */}
                <tr className="hidden">
                  <td colSpan={4}>
                    <CallDetailsModal
                      open={modalOpen}
                      onClose={() => setModalOpen(false)}
                      call={selectedCall}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Show</span>
          <Select value={showPerPage} onValueChange={setShowPerPage}>
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span>calls per page</span>
        </div>
        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <span>
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
