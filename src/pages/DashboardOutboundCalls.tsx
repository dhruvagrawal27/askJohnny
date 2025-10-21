// DashboardOutbound.tsx
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PhoneOutgoing,
  BarChart3,
  List,
  Plus,
  UploadCloud,
  Calendar,
  Clock,
  Users,
  Target,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@clerk/clerk-react";

// ✅ Environment-aware backend base URL
import { fetchUserByClerkId } from "../lib/dataService";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const DashboardOutbound: React.FC = () => {
  const [activeTab, setActiveTab] = useState("analytics");
  const [campaignName, setCampaignName] = useState("");
  const [campaignType, setCampaignType] = useState("");
  const [csvPreview, setCsvPreview] = useState<
    Array<{ number: string; name: string }>
  >([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [campaignDetails, setCampaignDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const [showRequestBody, setShowRequestBody] = useState<boolean>(true);
  const [lastRequestBody, setLastRequestBody] = useState<any>(null);

  useEffect(() => {
    console.log("lastreqbody: ", lastRequestBody);
  }, [lastRequestBody]);

  const { user, isSignedIn, isLoaded } = useUser();
  const [userData, setUserData] = useState<any | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Campaigns fetched from backend
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!isLoaded || !isSignedIn || !user) return;
      setIsLoadingCampaigns(true);
      setCampaignsError(null);
      try {
        const res = await fetch(
          `${API_BASE}/api/users/campaigns/call/clerk/${user.id}`
        );
        if (!res.ok) throw new Error("Failed to fetch campaigns");
        const data = await res.json();
        // Defensive: ensure array
        setCampaigns(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setCampaignsError(e?.message || String(e));
      } finally {
        setIsLoadingCampaigns(false);
      }
    };
    fetchCampaigns();
  }, [isLoaded, isSignedIn, user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Scheduled":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "In Progress":
        return <Play className="h-4 w-4 text-green-500" />;
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "Paused":
        return <Pause className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoaded || !isSignedIn || !user) return;
      try {
        setIsLoadingUser(true);
        setUserError(null);
        const data = await fetchUserByClerkId(user.id);
        setUserData(data);
      } catch (e: any) {
        setUserError(e?.message || String(e));
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, [isLoaded, isSignedIn, user]);

  const validateCsvText = (text: string) => {
    const firstLine = text.split(/\r?\n/)[0] || "";
    const header = firstLine
      .replace(/\uFEFF/, "")
      .trim()
      .toLowerCase();
    const cols = header.split(",").map((c) => c.trim());
    if (cols.length !== 2)
      return "CSV must contain exactly two columns: number and name";
    const hasNumber =
      cols.includes("number") ||
      cols.includes("phone") ||
      cols.includes("phone_number") ||
      cols.includes("phone number");
    const hasName = cols.includes("name");
    if (!hasNumber || !hasName)
      return "CSV header must include number (or phone) and name columns";
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setCsvFile(null);
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setFileError("Please upload a .csv file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || "");
      const err = validateCsvText(text);
      if (err) {
        setFileError(err);
        setCsvFile(null);
        setCsvPreview([]);
      } else {
        setCsvFile(f);
        const lines = text.split(/\r?\n/).slice(1).filter(Boolean);
        const preview = lines.slice(0, 5).map((line) => {
          const parts = line.split(/,(.+)/);
          const number = (parts[0] || "").trim();
          const name = (parts[1] || "").trim();
          return { number, name };
        });
        setCsvPreview(preview);
      }
    };
    reader.onerror = () => setFileError("Failed to read the CSV file");
    reader.readAsText(f);
  };

  // ✅ Updated to call backend proxy instead of n8n directly
  const handleCreateCampaign = async () => {
    setResponseData(null);
    setIsSubmitting(true);
    setFileError(null);
    try {
      if (!csvFile) {
        setFileError("Please upload a CSV file");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", csvFile, csvFile.name);
      formData.append("campaignName", campaignName);
      formData.append("campaignType", campaignType);
      formData.append("campaignDetails", campaignDetails);
      formData.append("source", "asktanitwo_ui");

      if (userData && userData.businessDetails) {
        formData.append(
          "businessDetails",
          JSON.stringify(userData.businessDetails)
        );
      }

      if (user) formData.append("clerkUserId", user.id);

      const serialized: any = {};
      for (const [key, value] of Array.from(formData.entries())) {
        if (value instanceof File) {
          serialized[key] = {
            fileName: value.name,
            size: value.size,
            type: value.type,
          };
        } else {
          serialized[key] = value;
        }
      }
      setLastRequestBody(serialized);

      // 👇 Point to backend proxy
      const res = await fetch(
        `https://dhruvthc.app.n8n.cloud/webhook/outbound`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Webhook error: ${res.status} ${text}`);
      }

      const data = await res.json().catch(() => ({}));

      console.log("campaingid: ", data);
      setResponseData(data);

      // If campaignid is present in response, call backend to store it
      try {
        const campaignIdObj =
          Array.isArray(data) && data.length > 0 ? data[0] : null;
        const campaignid = campaignIdObj?.campaignid;
        if (campaignid && user?.id) {
          await fetch(`${API_BASE}/api/users/campaignid/clerk/${user.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ campaignid }),
          });
        }
      } catch (err) {
        console.error("Failed to store campaignid in backend", err);
      }

      setActiveTab("list");
    } catch (e: any) {
      setFileError(e?.message || String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      Scheduled: "bg-blue-50 text-blue-600 border-blue-200",
      "In Progress": "bg-green-50 text-green-600 border-green-200",
      Completed: "bg-green-50 text-green-600 border-green-200",
      Failed: "bg-red-50 text-red-600 border-red-200",
      Paused: "bg-orange-50 text-orange-600 border-orange-200",
    };
    return (
      statusStyles[status as keyof typeof statusStyles] ||
      "bg-gray-50 text-gray-600 border-gray-200"
    );
  };

  // Calculate analytics from campaigns data
  let analytics = null;
  if (campaigns.length > 0) {
    let totalCampaigns = campaigns.length;
    let activeCampaigns = campaigns.filter(
      (c) => c.data?.status === "in-progress" || c.data?.status === "scheduled"
    ).length;
    let totalRecipients = campaigns.reduce(
      (acc, c) =>
        acc + (Array.isArray(c.data?.customers) ? c.data.customers.length : 0),
      0
    );
    let totalCalls = campaigns.reduce(
      (acc, c) => acc + (c.data?.calls ? Object.keys(c.data.calls).length : 0),
      0
    );
    let totalEnded = campaigns.reduce(
      (acc, c) => acc + (c.data?.callsCounterEnded || 0),
      0
    );
    let totalSuccess = 0;
    let totalDuration = 0;
    let durationCount = 0;
    campaigns.forEach((c) => {
      if (c.data?.calls) {
        Object.values(c.data.calls).forEach((callStr) => {
          try {
            const call =
              typeof callStr === "string" ? JSON.parse(callStr) : callStr;
            if (call.analysis?.successEvaluation === "true") totalSuccess++;
            if (call.startedAt && call.endedAt) {
              const start = new Date(call.startedAt).getTime();
              const end = new Date(call.endedAt).getTime();
              if (!isNaN(start) && !isNaN(end) && end > start) {
                totalDuration += end - start;
                durationCount++;
              }
            }
          } catch {}
        });
      }
    });
    let avgDuration =
      durationCount > 0 ? Math.round(totalDuration / durationCount / 1000) : 0;
    let successRate =
      totalCalls > 0 ? ((totalSuccess / totalCalls) * 100).toFixed(1) : "0.0";
    let completionRate =
      totalCalls > 0 ? ((totalEnded / totalCalls) * 100).toFixed(1) : "0.0";
    analytics = {
      totalCampaigns,
      activeCampaigns,
      totalRecipients,
      totalCalls,
      avgDuration,
      successRate,
      completionRate,
    };
  }

  // If analytics is null, remove analytics tab
  const showAnalytics = !!analytics;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <PhoneOutgoing className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-red-700">
                Outbound Calls
              </h1>
              <Badge className="bg-red-100 text-red-600 text-xs px-2 py-1">
                ALPHA
              </Badge>
            </div>
            <p className="text-muted-foreground">
              AI-powered batch calling campaigns
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList
            className={`grid ${
              showAnalytics ? "grid-cols-3" : "grid-cols-2"
            } w-auto`}
          >
            {showAnalytics && (
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            )}
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create
            </TabsTrigger>
          </TabsList>

          {activeTab === "list" && (
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          )}
        </div>

        {/* Analytics Tab - show only if analytics data exists */}
        {showAnalytics && (
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Campaigns
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold">
                          {analytics.totalCampaigns}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          All campaigns
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                      <BarChart3 className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Active Campaigns
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold">
                          {analytics.activeCampaigns}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Currently running
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                      <Play className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Recipients
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold">
                          {analytics.totalRecipients}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Across all campaigns
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-full">
                      <Users className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Success Rate
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold">
                          {analytics.successRate}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Average across
                        </p>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-red-500">
                          {analytics.successRate < 50
                            ? "Needs improvement"
                            : "Good"}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                      <Target className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <Clock className="h-5 w-5" />
                    Campaign Status Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Scheduled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">
                        {campaigns.reduce(
                          (acc, c) =>
                            acc + (c.data?.callsCounterScheduled || 0),
                          0
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Play className="h-4 w-4 text-green-500" />
                      <span className="font-medium">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">
                        {campaigns.reduce(
                          (acc, c) =>
                            acc + (c.data?.callsCounterInProgress || 0),
                          0
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Ended</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">
                        {campaigns.reduce(
                          (acc, c) => acc + (c.data?.callsCounterEnded || 0),
                          0
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Queued</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">
                        {campaigns.reduce(
                          (acc, c) => acc + (c.data?.callsCounterQueued || 0),
                          0
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <BarChart3 className="h-5 w-5" />
                    Call Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Overall Completion Rate
                      </span>
                      <span className="text-sm font-medium">
                        {analytics.completionRate}%
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold">
                        {analytics.completionRate}%
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-3xl font-bold">
                        {analytics.successRate}%
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Success Rate
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">
                        {analytics.totalCalls}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Total Calls
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {analytics.avgDuration} s
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Avg. Duration
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {analytics.totalRecipients}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Total Recipients
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* List Tab - Campaign History from Backend */}
        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCampaigns ? (
                <div className="py-8 text-center text-muted-foreground">
                  Loading campaigns...
                </div>
              ) : campaignsError ? (
                <div className="py-8 text-center text-red-600">
                  {campaignsError}
                </div>
              ) : campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 bg-muted rounded-full mb-4">
                    <PhoneOutgoing className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No campaigns found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first outbound calling campaign to get started.
                  </p>
                  <Button
                    onClick={() => setActiveTab("create")}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Campaign
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Ended</TableHead>
                        <TableHead>Scheduled</TableHead>
                        <TableHead>Queued</TableHead>
                        <TableHead>In Progress</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((c) => {
                        const d = c.data || {};
                        const totalRecipients = Array.isArray(d.customers)
                          ? d.customers.length
                          : 0;
                        const ended = d.callsCounterEnded || 0;
                        const scheduled = d.callsCounterScheduled || 0;
                        const queued = d.callsCounterQueued || 0;
                        const inProgress = d.callsCounterInProgress || 0;
                        const created = d.createdAt
                          ? new Date(d.createdAt).toLocaleString()
                          : "—";
                        const updated = d.updatedAt
                          ? new Date(d.updatedAt).toLocaleString()
                          : "—";
                        return (
                          <TableRow key={d.id || c.id}>
                            <TableCell className="font-medium">
                              {d.name || "—"}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(d.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(d.status)}
                                  {d.status}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>{totalRecipients}</TableCell>
                            <TableCell>{ended}</TableCell>
                            <TableCell>{scheduled}</TableCell>
                            <TableCell>{queued}</TableCell>
                            <TableCell>{inProgress}</TableCell>
                            <TableCell>{created}</TableCell>
                            <TableCell>{updated}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
              <p className="text-sm text-muted-foreground">
                Set up a new outbound calling campaign for your business.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Campaign Name *</Label>
                  <Input
                    id="campaign-name"
                    placeholder="Enter campaign name"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-type">Campaign Type *</Label>
                  <Select value={campaignType} onValueChange={setCampaignType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Outreach</SelectItem>
                      <SelectItem value="followup">Follow-up Calls</SelectItem>
                      <SelectItem value="survey">Customer Survey</SelectItem>
                      <SelectItem value="appointment">
                        Appointment Reminders
                      </SelectItem>
                      <SelectItem value="promotion">
                        Promotional Campaign
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-description">
                  Campaign Description
                </Label>
                <Textarea
                  id="campaign-description"
                  placeholder="Describe the purpose of this campaign..."
                  className="min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="csv-upload">Upload CSV (number,name)</Label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className="h-4 w-4" />
                    {csvFile ? "Replace CSV" : "Upload CSV"}
                  </Button>
                  {csvFile && (
                    <div className="text-sm">
                      <div>
                        File: <strong>{csvFile.name}</strong>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(csvFile.size / 1024)} KB
                      </div>
                    </div>
                  )}
                </div>
                {fileError && (
                  <p className="text-sm text-red-600 mt-1">{fileError}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Example CSV:
                </p>
                <pre className="text-xs bg-slate-50 p-2 rounded mt-1">
                  number,name 15162175131,Dhruv 16133129191,Himanshu
                  15162175131,Bob Johnson
                </pre>

                {/* CSV preview - first five rows */}
                <div className="mt-3">
                  <h4 className="text-sm font-medium">
                    CSV Preview (first 5 rows)
                  </h4>
                  {csvPreview.length === 0 ? (
                    <p className="text-xs text-muted-foreground mt-1">
                      No preview available. Upload a valid CSV to see preview.
                    </p>
                  ) : (
                    <div className="overflow-x-auto mt-2">
                      <table className="text-sm w-full">
                        <thead>
                          <tr>
                            <th className="text-left pr-4">Number</th>
                            <th className="text-left">Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvPreview.map((r, idx) => (
                            <tr key={idx} className="odd:bg-slate-50">
                              <td className="py-1 pr-4">{r.number}</td>
                              <td className="py-1">{r.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-details">Campaign Details</Label>
                <Textarea
                  id="campaign-details"
                  placeholder="All details required to run this campaign (instructions, targeting, notes)..."
                  className="min-h-32"
                  value={campaignDetails}
                  onChange={(e) => setCampaignDetails(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="call-script">Call Script</Label>
                <Textarea
                  id="call-script"
                  placeholder="Enter the script your AI agent will use for this campaign..."
                  className="min-h-32"
                />
              </div>

              {/* Business details fetched from backend */}
              <div className="p-4 rounded border">
                <h3 className="font-medium">Business Details</h3>
                {isLoadingUser ? (
                  <p className="text-sm text-muted-foreground">
                    Loading business details...
                  </p>
                ) : userError ? (
                  <p className="text-sm text-red-600">{userError}</p>
                ) : userData?.businessDetails ? (
                  <div className="text-sm mt-2">
                    <p>
                      <strong>Name:</strong>{" "}
                      {userData.businessDetails.businessName}
                    </p>
                    <p>
                      <strong>Phone:</strong>{" "}
                      {userData.businessDetails.businessPhone}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {userData.businessDetails.bussinessEmail || "—"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No business details found for your account.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="schedule-date">Schedule Date</Label>
                  <Input id="schedule-date" type="datetime-local" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-attempts">
                    Max Attempts per Recipient
                  </Label>
                  <Select defaultValue="3">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 attempt</SelectItem>
                      <SelectItem value="2">2 attempts</SelectItem>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* submission area */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t">
                <Button
                  className="gap-2"
                  onClick={handleCreateCampaign}
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4" />
                  {isSubmitting ? "Creating..." : "Create Campaign"}
                </Button>
                <Button variant="outline">Save as Draft</Button>
                <Button variant="ghost">Cancel</Button>
              </div>

              {/* response / debug */}
              {lastRequestBody && (
                <div className="mt-4 p-3 rounded bg-slate-50 border">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      Request body (what will be sent)
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRequestBody((s) => !s)}
                        className="text-xs px-2 py-1 rounded bg-white border"
                      >
                        {showRequestBody ? "Collapse" : "Expand"}
                      </button>
                    </div>
                  </div>

                  <div
                    className={`${showRequestBody ? "block" : "hidden"} mt-2`}
                  >
                    <pre className="text-xs mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono p-2 bg-white rounded border">
                      {JSON.stringify(lastRequestBody, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {responseData && (
                <div className="mt-4 p-3 rounded bg-green-50 border">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Webhook response</h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          // toggle request body if response shown alone
                          setShowRequestBody(true);
                        }}
                        className="text-xs px-2 py-1 rounded bg-white border"
                      >
                        Show Request
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <pre className="text-xs max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono p-2 bg-white rounded border">
                      {JSON.stringify(responseData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
