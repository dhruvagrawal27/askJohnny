// src/pages/DashboardNew.tsx
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  Smartphone,
  Building2,
  Info,
  User2,
  Phone,
  Clock,
  ListChecks,
  PhoneCall,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Activity,
  MessageSquare,
  Calendar,
  Star,
  Zap,
  Settings,
  LogOut,
  BarChart3,
  Globe,
  MapPin,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getErrorMessage } from "../utils/dbHealthCheck";
import { fetchUserByClerkId, processAgentWebhookResponse } from "../lib/dataService";
import { Input } from "../components/ui/input";

// Types
type TrainState = "idle" | "training" | "completed" | "error";

type UserData = {
  _id: string;
  name: string;
  email: string;
  agent_id?: string | null;
  agent_name?: string | null;
  agent_status?: string | null;
  phone_id?: string | null;
  assigned_phone_number?: string | null;
  clerk_id: string;
  businessDetails?: any;
  activePlan?: any;
  preferences?: any;
  calendar_tokens?: {
    access_token?: string | null;
    refresh_token?: string | null;
  };
};

// Helper functions
const pretty = (v: any, fallback = "Not set") =>
  v === null || v === undefined || v === "" ? fallback : String(v);

const deriveBusinessName = (ud: UserData) =>
  ud.businessDetails?.businessName ||
  ud.businessDetails?.data?.name ||
  ud.name ||
  "Not set";

const DashboardNew = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trainingStatus, setTrainingStatus] = useState<TrainState>("idle");
  const [isTraining, setIsTraining] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [additionalDetails, setAdditionalDetails] = useState("");

  // Quick Call state
  const [showQuickCall, setShowQuickCall] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isValidNumber, setIsValidNumber] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [callResult, setCallResult] = useState<any>(null);
  const [callError, setCallError] = useState<string | null>(null);

  // Phone validation
  const validatePhoneNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    const isValid = cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'));
    setIsValidNumber(isValid);
    return isValid;
  };

  const formatPhoneNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length >= 6) {
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    return number;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.replace(/\D/g, '').length <= 10) {
      setPhoneNumber(formatPhoneNumber(value));
      validatePhoneNumber(value);
      setCallError(null);
    }
  };

  const initiateQuickCall = async () => {
    if (!user || !isValidNumber) return;
    setIsCalling(true);
    setCallError(null);
    setCallResult(null);

    try {
      const latestUserData = userData || await fetchUserByClerkId(user.id);
      if (!latestUserData || !latestUserData.agent_id || !latestUserData.phone_id) {
        throw new Error("User configuration incomplete. Please complete your setup first.");
      }

      const cleanedNumber = phoneNumber.replace(/\D/g, '');
      const formattedNumber = cleanedNumber.length === 10 ? `+1${cleanedNumber}` : `+${cleanedNumber}`;

      const response = await fetch('https://api.vapi.ai/call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_VAPI_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId: latestUserData.agent_id,
          phoneNumberId: latestUserData.phone_id,
          customer: {
            number: formattedNumber,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to initiate call: ${response.status}`);
      }

      const result = await response.json();
      setCallResult(result);
      setPhoneNumber("");
      setIsValidNumber(false);
      setShowQuickCall(false);
    } catch (error) {
      console.error('Error initiating call:', error);
      setCallError(error instanceof Error ? error.message : 'Failed to initiate call');
    } finally {
      setIsCalling(false);
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    if (!isLoaded || !isSignedIn || !user) return;
    try {
      setIsLoading(true);
      setError(null);
      
      const userEmail = user.emailAddresses[0]?.emailAddress || user.id + '@clerk.temp'
      let userData = await fetchUserByClerkId(user.id, userEmail, false);
      
      if (!userData) {
        userData = await fetchUserByClerkId(user.id, userEmail, true);
      }
      
      if (userData && (!userData.businessDetails || !userData.activePlan)) {
        setTimeout(() => {
          navigate('/new-onboarding');
        }, 1000);
        return;
      }
      
      setUserData(userData);
      
      // Set training status based on agent_id
      if (userData?.agent_id) {
        setTrainingStatus("completed");
      }
    } catch (e: any) {
      console.error('Error in fetchUserData:', e);
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [isLoaded, isSignedIn, user, navigate]);

  const businessName = userData ? deriveBusinessName(userData) : "Not set";
  const inSetupProcess = !userData?.assigned_phone_number || !userData?.agent_id;

  // Loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'radial-gradient(125% 125% at 50% 10%, #FFFFFF 35%, #E9D5FF 75%, #C4B5FD 100%)'
      }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-[#0C0F1A] font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{
        background: 'radial-gradient(125% 125% at 50% 10%, #FFFFFF 35%, #E9D5FF 75%, #C4B5FD 100%)'
      }}>
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-[#0C0F1A] mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary-custom px-6 py-3"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      background: 'radial-gradient(125% 125% at 50% 10%, #FFFFFF 35%, #E9D5FF 75%, #C4B5FD 100%)'
    }}>
      {/* Main Content */}
      <div className="pt-8 px-4 lg:px-8 pb-8 max-w-6xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1 leading-tight">
                Welcome back, <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{user?.firstName || 'there'}</span>
              </h1>
              <p className="text-gray-600 text-sm">
                {businessName !== "Not set" ? businessName : "Your AI voice assistant dashboard"}
              </p>
            </div>
            {trainingStatus === "completed" && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200/60 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-bold text-xs">Agent Active</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Status Cards - Frosted Glass Style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {/* Business Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl opacity-60 blur-md"></div>
            <div className="relative bg-white/90 backdrop-blur-sm border border-[#ECE8FF]/40 rounded-2xl p-4 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A26BFF] to-[#7A57FF] flex items-center justify-center shadow-lg">
                  <Building2 className="text-white" size={16} />
                </div>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-gray-500 text-xs font-semibold mb-1">Business Name</h3>
              <p className="text-gray-900 text-sm font-bold truncate" title={businessName}>
                {pretty(businessName, "—")}
              </p>
            </div>
          </div>

          {/* Status Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl opacity-60 blur-md"></div>
            <div className="relative bg-white/90 backdrop-blur-sm border border-[#ECE8FF]/40 rounded-2xl p-4 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${
                  trainingStatus === "completed" 
                    ? "bg-gradient-to-br from-green-400 to-green-600" 
                    : trainingStatus === "training"
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                    : "bg-gradient-to-br from-gray-300 to-gray-500"
                }`}>
                  {trainingStatus === "completed" ? (
                    <CheckCircle2 className="text-white" size={16} />
                  ) : trainingStatus === "training" ? (
                    <Loader2 className="text-white animate-spin" size={16} />
                  ) : (
                    <Clock className="text-white" size={16} />
                  )}
                </div>
                <Activity className="w-4 h-4 text-green-400" />
              </div>
              <h3 className="text-gray-500 text-xs font-semibold mb-1">Agent Status</h3>
              <p className="text-gray-900 text-sm font-bold">
                {trainingStatus === "completed"
                  ? "Active"
                  : trainingStatus === "training"
                  ? "Training..."
                  : trainingStatus === "error"
                  ? "Error"
                  : "Pending"}
              </p>
            </div>
          </div>

          {/* Agent ID Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl opacity-60 blur-md"></div>
            <div className="relative bg-white/90 backdrop-blur-sm border border-[#ECE8FF]/40 rounded-2xl p-4 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg">
                  <BadgeCheck className="text-white" size={16} />
                </div>
                <Zap className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-gray-500 text-xs font-semibold mb-1">AI Agent</h3>
              <p className="text-gray-900 text-sm font-bold truncate">
                {userData?.agent_id ? "Connected" : "Not Set"}
              </p>
            </div>
          </div>

          {/* Phone Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl opacity-60 blur-md"></div>
            <div className="relative bg-white/90 backdrop-blur-sm border border-[#ECE8FF]/40 rounded-2xl p-4 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg">
                  <Phone className="text-white" size={16} />
                </div>
                <PhoneCall className="w-4 h-4 text-pink-400" />
              </div>
              <h3 className="text-gray-500 text-xs font-semibold mb-1">Phone Number</h3>
              <p className="text-gray-900 text-sm font-bold truncate">
                {userData?.assigned_phone_number || "Pending"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Call Section - Landing Page Input Style */}
        {!inSetupProcess && userData?.agent_id && userData?.phone_id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl opacity-60 blur-md"></div>
              <div className="relative bg-white/90 backdrop-blur-sm border border-[#ECE8FF]/40 rounded-2xl p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                        <PhoneCall className="text-white" size={16} />
                      </div>
                      Quick Call
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Make an instant outbound call using your AI agent
                    </p>
                  </div>
                  <button
                    onClick={() => setShowQuickCall(!showQuickCall)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all text-xs whitespace-nowrap ${
                      showQuickCall 
                        ? 'btn-secondary-custom' 
                        : 'btn-primary-custom shadow-lg'
                    }`}
                  >
                    {showQuickCall ? "Cancel" : "Start Call"}
                  </button>
                </div>
                
                {showQuickCall && (
                  <div className="space-y-3 animate-fade-in-up">
                    <div>
                      <label htmlFor="phoneNumber" className="block text-gray-900 text-xs font-bold mb-1.5">
                        Phone Number (US/Canada only)
                      </label>
                      {/* Landing Page Style Input */}
                      <div className="bg-white p-1.5 rounded-xl shadow-md shadow-brand-100/50 flex items-center border border-gray-100">
                        <div className="flex-1 relative">
                          <Input
                            id="phoneNumber"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            className={`border-0 px-3 py-2 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 ${
                              phoneNumber && !isValidNumber 
                                ? 'bg-red-50' 
                                : phoneNumber && isValidNumber 
                                ? 'bg-green-50' 
                                : ''
                            }`}
                          />
                          {phoneNumber && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              {isValidNumber ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={initiateQuickCall}
                          disabled={!isValidNumber || isCalling}
                          className="btn-primary-custom px-4 py-2 font-medium transition-opacity hover:opacity-90 text-xs whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          {isCalling ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Calling...
                            </>
                          ) : (
                            <>
                              <PhoneCall className="h-3.5 w-3.5" />
                              Call
                            </>
                          )}
                        </button>
                      </div>
                      {phoneNumber && !isValidNumber && (
                        <p className="text-[10px] text-red-600 mt-1.5 flex items-center gap-1">
                          <AlertCircle size={10} />
                          Please enter a valid US or Canadian phone number
                        </p>
                      )}
                    </div>

                    {callError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200/60 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                        <p className="text-xs text-red-700 font-medium">{callError}</p>
                      </div>
                    )}

                    {callResult && (
                      <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200/60 rounded-lg">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-green-700 mb-0.5">Call initiated successfully!</p>
                          <p className="text-[10px] text-green-600 font-mono">Call ID: {callResult.id}</p>
                          <p className="text-[10px] text-green-600 mt-0.5">Status: <span className="font-bold">{callResult.status}</span></p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}  

        {/* Business Details - Two Column Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6"
        >
          {/* Business Information Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl opacity-60 blur-md"></div>
            <div className="relative bg-white/90 backdrop-blur-sm border border-[#ECE8FF]/40 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <Building2 className="text-white" size={16} />
                </div>
                Business Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-gray-50/50 rounded-lg border border-gray-100/50">
                  <Info className="text-purple-400 mt-0.5" size={14} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 mb-0.5 font-semibold">Business Name</p>
                    <p className="text-gray-900 text-sm font-bold truncate">{businessName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-gray-50/50 rounded-lg border border-gray-100/50">
                  <MapPin className="text-purple-400 mt-0.5" size={14} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 mb-0.5 font-semibold">Address</p>
                    <p className="text-gray-900 text-sm font-medium">{pretty(userData?.businessDetails?.data?.address)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-gray-50/50 rounded-lg border border-gray-100/50">
                  <Phone className="text-purple-400 mt-0.5" size={14} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 mb-0.5 font-semibold">Phone</p>
                    <p className="text-gray-900 text-sm font-bold">{pretty(userData?.businessDetails?.data?.phone)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-gray-50/50 rounded-lg border border-gray-100/50">
                  <Globe className="text-purple-400 mt-0.5" size={14} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 mb-0.5 font-semibold">Website</p>
                    <p className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent text-sm font-bold hover:underline cursor-pointer truncate">{pretty(userData?.businessDetails?.data?.website)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-pink-100 rounded-2xl opacity-60 blur-md"></div>
            <div className="relative bg-white/90 backdrop-blur-sm border border-[#ECE8FF]/40 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <Settings className="text-white" size={16} />
                </div>
                Technical Configuration
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-gray-50/50 rounded-lg border border-gray-100/50">
                  <BadgeCheck className="text-purple-400 mt-0.5" size={14} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 mb-0.5 font-semibold">Agent ID</p>
                    <p className="text-gray-900 font-mono text-xs truncate">{pretty(userData?.agent_id)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-gray-50/50 rounded-lg border border-gray-100/50">
                  <Sparkles className="text-purple-400 mt-0.5" size={14} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 mb-0.5 font-semibold">Agent Name</p>
                    <p className="text-gray-900 text-sm font-bold">{pretty(userData?.agent_name)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-gray-50/50 rounded-lg border border-gray-100/50">
                  <Activity className="text-purple-400 mt-0.5" size={14} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 mb-0.5 font-semibold">Agent Status</p>
                    <p className="text-green-600 text-sm font-bold">{pretty(userData?.agent_status)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-gray-50/50 rounded-lg border border-gray-100/50">
                  <Phone className="text-purple-400 mt-0.5" size={14} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 mb-0.5 font-semibold">Phone Number ID</p>
                    <p className="text-gray-900 font-mono text-xs truncate">{pretty(userData?.phone_id)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardNew;
