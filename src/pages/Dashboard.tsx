// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getErrorMessage } from "../utils/dbHealthCheck";
import { fetchUserByClerkId, processAgentWebhookResponse, createOrUpdateUser } from "../lib/dataService";

// ------------ Local types ------------
type TrainState = "idle" | "training" | "completed" | "error";

type UserData = {
  _id: string;
  name: string;
  email: string;
  agent_id?: string | null;
  agent_name?: string | null;
  agent_status?: string | null;
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

// ------------ helpers ------------
const pretty = (v: any, fallback = "Not set") =>
  v === null || v === undefined || v === "" ? fallback : String(v);

const deriveBusinessName = (ud: UserData) =>
  ud.businessDetails?.businessName ||
  ud.businessDetails?.data?.name ||
  ud.name ||
  "Not set";

const formatFAQData = (faqData: any) => {
  if (!faqData || !faqData.category || !faqData.answers) {
    return {};
  }

  // Get questions for the category
  const categoryQuestions = getCategoryQuestions(faqData.category);
  
  // Create properly formatted question-answer pairs
  const questionsAndAnswers = categoryQuestions.map((question, index) => ({
    question: question,
    answer: faqData.answers[index] || ""
  }));

  return {
    category: faqData.category,
    categoryLabel: getCategoryLabel(faqData.category),
    questionsAndAnswers: questionsAndAnswers
  };
};

const getCategoryQuestions = (categoryId: string): string[] => {
  const categoryQuestionsMap: { [key: string]: string[] } = {
    restaurants: [
      "Is your restaurant vegetarian, non-vegetarian, or both? What cuisines do you specialize in?",
      "Do you offer specials like discounts, live music, big screen, outdoor seating, or happy hours?",
      "What type of establishment are you (cafe, casual, fine dining, bar)? Do you serve alcohol?",
    ],
    healthcare: [
      "What type of practice (general, dental, specialty, urgent care) and primary services?",
      "Do you accept insurance, offer payment plans, and what are after-hours procedures?",
      "Do you need confirmations, prescription refills, or telehealth support?",
    ],
    legal: [
      "What areas of law (injury, family, criminal, corporate)? Any emergency cases?",
      "Do you offer free consults, payment plans, or contingency fees?",
      "What is your intake process? Need document collection or case management support?",
    ],
    real_estate: [
      "Residential, commercial, or rentals? What areas do you serve?",
      "Services: buying, selling, property management, investments?",
      "Need lead qualification, showings, or follow-ups?",
    ],
    automotive: [
      "What services (repairs, maintenance, inspections, sales)? Specialize in types/brands?",
      "Do you offer emergency services, towing, rentals, or warranty work?",
      "Typical appointment duration? Provide estimates or parts ordering?",
    ],
    fitness: [
      "What type (gym, yoga, PT, dance) and what classes/services?",
      "Membership packages, PT, groups, or programs (seniors/beginners)?",
      "Peak hours, cancellation policies, equipment rentals or nutrition counseling?",
    ],
    others: [
      "What type of business and primary products/services customers ask about?",
      "Most popular products/services and pricing ranges? Any packages or promotions?",
      "What info do callers usually want (availability, delivery, rates, service areas, fees, booking)?",
    ],
  };
  
  return categoryQuestionsMap[categoryId] || categoryQuestionsMap.others;
};

const getCategoryLabel = (categoryId: string): string => {
  const categoryLabels: { [key: string]: string } = {
    restaurants: "Restaurants & Food Service",
    healthcare: "Healthcare & Medical",
    legal: "Legal & Law Firms",
    real_estate: "Real Estate",
    automotive: "Automotive Services",
    fitness: "Fitness & Wellness",
    others: "Other Business"
  };
  
  return categoryLabels[categoryId] || "Other Business";
};

const CollapsibleSection = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: JSX.Element;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition"
      >
        <span className="flex items-center gap-2 text-slate-800 font-medium">
          {icon}
          {title}
        </span>
        <span className="text-slate-500 text-sm">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
};

const Dashboard = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isTraining, setIsTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<TrainState>("idle");

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [additionalDetails, setAdditionalDetails] = useState("");

  // ================== Training flow ==================
  const startModelTraining = () => {
    if (!userData) {
      setError("No user data found. Please complete the setup first.");
      return;
    }
    setShowReviewModal(true);
  };

  const completeSetupDirectly = async () => {
    if (!user || !userData) {
      setError("No user data found. Please complete onboarding first.");
      return;
    }
    
    setIsTraining(true);
    setTrainingStatus("training");
    setError(null);
    
    try {
      // Format FAQ data properly with questions and answers from database structure
      let formattedFAQData = {};
      
      if (userData.businessDetails?.faqData && userData.businessDetails.faqData.category) {
        // If FAQ data exists in the expected format, format it properly
        const faqData = userData.businessDetails.faqData;
        const categoryQuestions = getCategoryQuestions(faqData.category);
        
        const questionsAndAnswers = categoryQuestions.map((question, index) => ({
          question: question,
          answer: faqData.answers && faqData.answers[index] ? faqData.answers[index] : ""
        }));

        formattedFAQData = {
          category: faqData.category,
          categoryLabel: getCategoryLabel(faqData.category),
          questionsAndAnswers: questionsAndAnswers
        };
      }

      // Call the agent training webhook directly with complete data structure
      const payload = {
        user_id: user.id,
        user_email: userData.email,
        business_name: userData.businessDetails?.businessName || userData.name,
        phone_number: userData.businessDetails?.data?.phone || userData.businessDetails?.phone,
        plan_name: userData.activePlan?.stripeProductId || "",
        timestamp: new Date().toISOString(),
        businessDetails: userData.businessDetails?.data || {}, // Complete Google Maps data structure
        faqData: formattedFAQData // Properly formatted FAQ data with questions and answers
      };

      console.log('Completing setup with payload:', payload);

      const response = await fetch(
        "https://dhruvthc.app.n8n.cloud/webhook/f61980c4-6159-42a0-91ed-08b36ecc136c",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to complete setup. Please try again.");
      }

      const data = await response.json();
      console.log('Setup completion webhook response:', data);
      
      // Process webhook response and update user
      const updatedUserData = await processAgentWebhookResponse(user.id, data);
      setUserData(updatedUserData);

      setTrainingStatus("completed");
    } catch (e: any) {
      console.error('Setup completion error:', e);
      setTrainingStatus("error");
      setError(getErrorMessage(e));
    } finally {
      setIsTraining(false);
    }
  };

  const submitFinalTraining = async () => {
    if (!user || !userData) return;
    
    setIsTraining(true);
    setTrainingStatus("training");
    setError(null);
    
    try {
      // Format FAQ data properly with questions and answers from database structure
      let formattedFAQData = {};
      
      if (userData.businessDetails?.faqData && userData.businessDetails.faqData.category) {
        // If FAQ data exists in the expected format, format it properly
        const faqData = userData.businessDetails.faqData;
        const categoryQuestions = getCategoryQuestions(faqData.category);
        
        const questionsAndAnswers = categoryQuestions.map((question, index) => ({
          question: question,
          answer: faqData.answers && faqData.answers[index] ? faqData.answers[index] : ""
        }));

        formattedFAQData = {
          category: faqData.category,
          categoryLabel: getCategoryLabel(faqData.category),
          questionsAndAnswers: questionsAndAnswers
        };
      }

      // 1. Call the external webhook 
      const payload = {
        user_id: user.id,
        user_email: userData.email,
        business_name: userData.businessDetails?.businessName || userData.name,
        phone_number: userData.businessDetails?.data?.phone || userData.businessDetails?.phone,
        plan_name: userData.activePlan?.stripeProductId || "",
        timestamp: new Date().toISOString(),
        additional_details: additionalDetails || undefined,
        businessDetails: userData.businessDetails?.data || {}, // Complete Google Maps data structure
        faqData: formattedFAQData // Properly formatted FAQ data with questions and answers
      };

      const response = await fetch(
        "https://dhruvthc.app.n8n.cloud/webhook/f61980c4-6159-42a0-91ed-08b36ecc136c",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to start model training. Please try again.");
      }

      const data = await response.json();
      
      // 2. Process webhook response and update user
      const updatedUserData = await processAgentWebhookResponse(user.id, data);
      setUserData(updatedUserData);

      setTrainingStatus("completed");
      setShowReviewModal(false);
    } catch (e: any) {
      setTrainingStatus("error");
      setError(getErrorMessage(e));
    } finally {
      setIsTraining(false);
    }
  };

  // ================== Bootstrap ==================
  const fetchUserData = async () => {
    if (!isLoaded || !isSignedIn || !user) return;
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching user data for clerk ID:', user.id);
      
      // Get user email
      const userEmail = user.emailAddresses[0]?.emailAddress || user.id + '@clerk.temp'
      
      // Try to fetch existing user first
      let userData = await fetchUserByClerkId(user.id, userEmail, false);
      
      // If user doesn't exist, create them automatically for returning users
      if (!userData) {
        console.log('User not found in database. Creating user record...');
        try {
          userData = await fetchUserByClerkId(user.id, userEmail, true);
        } catch (createError) {
          console.error('Failed to create user record:', createError);
          // If creation fails, redirect to onboarding
          setTimeout(() => {
            navigate('/onboarding');
          }, 1000);
          return;
        }
      }
      
      // If user exists but has incomplete onboarding, redirect to onboarding
      if (userData && (!userData.businessDetails || !userData.activePlan)) {
        console.log('User has incomplete onboarding. Redirecting...');
        
        // Small delay to prevent flash
        setTimeout(() => {
          navigate('/onboarding');
        }, 1000);
        return;
      }
      
      console.log('User data loaded successfully:', userData);
      setUserData(userData);
    } catch (e: any) {
      console.error('Error in fetchUserData:', e);
      
      // Check if it's a database connection issue
      if (e.message?.includes('connection') || e.message?.includes('network')) {
        setError('Unable to connect to database. Please check your internet connection and try again.');
      } else {
        setError(getErrorMessage(e));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user, navigate]);

  // ================== UI ==================
  if (!isLoaded || isLoading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-3" />
        <p className="text-slate-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <div className="mx-auto w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-3">
          <AlertTriangle className="text-purple-700" size={32} />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">
          Error Loading Dashboard
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const businessName = userData ? deriveBusinessName(userData) : "Not set";
  const inSetupProcess =
    !userData?.assigned_phone_number || !userData?.agent_id;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-2xl font-semibold text-purple-900">
            Welcome to your Dashboard
          </h2>
          <p className="text-purple-600">
            Your AI agent configuration overview.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Business */}
          <div className="bg-white border rounded-lg p-5 flex items-center space-x-4 min-w-0">
            <div className="w-14 h-14 flex-shrink-0 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Building2 className="text-emerald-600" size={32} />
            </div>
            <div className="min-w-0">
              <h3 className="text-slate-900 font-medium truncate">Business</h3>
              <p className="text-sm text-slate-600 truncate">
                {pretty(businessName, "—")}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white border rounded-lg p-5 flex items-center space-x-4 min-w-0">
            <div className="w-14 h-14 flex-shrink-0 bg-yellow-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="text-yellow-600" size={32} />
            </div>
            <div className="min-w-0">
              <h3 className="text-slate-900 font-medium truncate">Status</h3>
              <p className="text-sm text-slate-600 truncate">
                {trainingStatus === "completed"
                  ? "Training Started"
                  : trainingStatus === "training"
                  ? "Training..."
                  : trainingStatus === "error"
                  ? "Error"
                  : "Ready to Train"}
              </p>
            </div>
          </div>

          {/* Agent ID */}
          <div className="bg-white border rounded-lg p-5 flex items-center space-x-4 min-w-0">
            <div className="w-14 h-14 flex-shrink-0 bg-purple-100 rounded-lg flex items-center justify-center">
              <BadgeCheck className="text-purple-600" size={32} />
            </div>
            <div className="min-w-0">
              <h3 className="text-slate-900 font-medium truncate">Agent ID</h3>
              <p className="text-sm text-slate-600 truncate">
                {pretty(userData?.agent_id, "Not set")}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="bg-white border rounded-lg p-5 flex items-center space-x-4 min-w-0">
            <div className="w-14 h-14 flex-shrink-0 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Smartphone className="text-indigo-600" size={32} />
            </div>
            <div className="min-w-0">
              <h3 className="text-slate-900 font-medium truncate">Phone</h3>
              <p className="text-sm text-slate-600 truncate">
                {pretty(userData?.assigned_phone_number, "Not set")}
              </p>
            </div>
          </div>
        </div>

        {/* Setup Process Banner - only show if not currently training */}
        {inSetupProcess && trainingStatus === "idle" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 text-center">
            <p className="text-yellow-800 font-medium mb-3">
              The account is in setup process. Complete agent training to finish setup.
            </p>
            <div className="space-x-3">
              <button
                onClick={completeSetupDirectly}
                disabled={isTraining || !userData?.businessDetails}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTraining ? "Completing Setup..." : "Complete Setup"}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Training Status Messages */}
        {trainingStatus === "training" && (
          <div className="bg-white border rounded-lg p-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Loader2 className="text-yellow-600 animate-spin" size={40} />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Training in Progress
              </h3>
              <p className="text-slate-600">
                Please wait while we start your model.
              </p>
            </div>
          </div>
        )}

        {trainingStatus === "completed" && (
          <div className="bg-white border rounded-lg p-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="text-green-600" size={40} />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Training Started Successfully!
              </h3>
              <p className="text-slate-600">
                Your AI model training has been initiated. Agent ID:{" "}
                {pretty(userData?.agent_id)}.
              </p>
            </div>
          </div>
        )}

        {trainingStatus === "error" && (
          <div className="bg-white border rounded-lg p-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="text-red-600" size={40} />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Training Failed
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={startModelTraining} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Start Training Button (show only if not in setup and no agent yet) */}
        {!inSetupProcess && !userData?.agent_id && trainingStatus === "idle" && (
          <div className="bg-white border rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Ready to Train Your AI Agent
            </h3>
            <p className="text-slate-600 mb-4">
              Your profile is complete. Start training your AI agent to handle calls for your business.
            </p>
            <button
              onClick={startModelTraining}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
            >
              Start Model Training
            </button>
          </div>
        )}

        {/* Setup Details */}
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Your Setup Details
          </h3>

          <CollapsibleSection
            title="Business Information"
            icon={<Info className="text-purple-500" size={18} />}
          >
            <div className="text-sm text-slate-600 space-y-1">
              <div>Name: {businessName}</div>
              <div>
                Address: {pretty(userData?.businessDetails?.data?.address)}
              </div>
              <div>Phone: {pretty(userData?.businessDetails?.data?.phone)}</div>
              <div>
                Website: {pretty(userData?.businessDetails?.data?.website)}
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Contact Information"
            icon={<User2 className="text-emerald-500" size={18} />}
          >
            <div className="text-sm text-slate-600 space-y-1">
              <div>Name: {user?.firstName || "Not set"}</div>
              <div>Email: {pretty(userData?.email)}</div>
              <div>Phone: {pretty(userData?.businessDetails?.data?.phone)}</div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Agent Information"
            icon={<BadgeCheck className="text-green-500" size={18} />}
          >
            <div className="text-sm text-slate-600 space-y-1">
              <div>Agent ID: {pretty(userData?.agent_id)}</div>
              <div>Agent Name: {pretty(userData?.agent_name)}</div>
              <div>Agent Status: {pretty(userData?.agent_status)}</div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Telephony"
            icon={<Phone className="text-purple-500" size={18} />}
          >
            <div className="text-sm text-slate-600">
              Phone Number: {pretty(userData?.assigned_phone_number)}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Schedule"
            icon={<Clock className="text-blue-500" size={18} />}
          >
            <div className="text-sm text-slate-600">
              Timezone: {pretty(userData?.preferences?.timezone)}
            </div>
          </CollapsibleSection>
        </div>
      </motion.div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowReviewModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Review Your Business Details
            </h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                  <Info className="text-purple-500" size={18} /> Business
                  Information
                </h4>
                <div className="space-y-1 text-sm text-slate-600">
                  <div>
                    Name:{" "}
                    {userData?.businessDetails?.businessName || userData?.name}
                  </div>
                  <div>
                    Address: {pretty(userData?.businessDetails?.data?.address)}
                  </div>
                  <div>
                    Phone: {pretty(userData?.businessDetails?.data?.phone)}
                  </div>
                  <div>
                    Hours:{" "}
                    {pretty(
                      userData?.businessDetails?.data?.openingHours?.weekday_text?.join(
                        ", "
                      )
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                  <ListChecks className="text-blue-500" size={18} /> Contact &
                  Plan
                </h4>
                <div className="space-y-1 text-sm text-slate-600">
                  <div>
                    Contact: {user?.firstName} {user?.lastName}
                  </div>
                  <div>Email: {userData?.email}</div>
                  <div>
                    Plan: {pretty(userData?.activePlan?.stripeProductId)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Additional details (optional)
              </label>
              <textarea
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows={5}
                placeholder="Add any extra instructions, FAQs, special cases, or context for training"
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={submitFinalTraining}
                disabled={isTraining}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {isTraining ? "Submitting..." : "Final Train Model"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

// // src/pages/Dashboard.tsx
// import { useEffect, useMemo, useState } from "react";
// import {
//   AlertTriangle,
//   Loader2,
//   CheckCircle2,
//   XCircle,
//   CalendarCheck2,
//   User2,
//   Phone,
//   Info,
//   Voicemail,
//   ListChecks,
//   Clock,
//   BadgeCheck,
// } from "lucide-react";
// import { useUser } from "@clerk/clerk-react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";

// import { getErrorMessage } from "../utils/dbHealthCheck";

// // ------------ Local types to match your schema ------------
// type TrainState = "idle" | "training" | "completed" | "error";

// type UserData = {
//   _id: string;
//   name: string;
//   email: string;
//   agent_id?: string | null;
//   agent_name?: string | null;
//   agent_status?: string | null;
//   assigned_phone_number?: string | null;
//   clerk_id: string;
//   businessDetails?: any;
//   activePlan?: any;
//   preferences?: any;
//   calendar_tokens?: {
//     access_token?: string | null;
//     refresh_token?: string | null;
//   };
// };

// // ------------ helpers ------------
// const pretty = (v: any, fallback = "Not set") =>
//   v === null || v === undefined || v === "" ? fallback : String(v);

// const deriveBusinessName = (ud: UserData) =>
//   ud.businessDetails?.businessName ||
//   ud.businessDetails?.data?.name ||
//   ud.name ||
//   "Not set";

// const Dashboard = () => {
//   const { user, isSignedIn, isLoaded } = useUser();
//   const navigate = useNavigate();

//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [isTraining, setIsTraining] = useState(false);
//   const [trainingStatus, setTrainingStatus] = useState<TrainState>("idle");

//   const [showReviewModal, setShowReviewModal] = useState(false);
//   const [additionalDetails, setAdditionalDetails] = useState("");

//   // ================== Bootstrap & Refresh ==================
//   const fetchUserData = async () => {
//     if (!isLoaded || !isSignedIn || !user) return;
//     try {
//       setIsLoading(true);
//       setError(null);
//       const res = await fetch(
//         `http://localhost:3000/api/users/clerk/${user.id}`
//       );
//       if (!res.ok) throw new Error("Failed to fetch user data from backend");
//       const data = await res.json();
//       setUserData(data);
//     } catch (e: any) {
//       setError(getErrorMessage(e));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUserData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isLoaded, isSignedIn, user, navigate]);

//   // ================== Training flow ==================
//   const startModelTraining = () => {
//     if (!userData) {
//       setError("No user data found. Please complete the setup first.");
//       return;
//     }
//     setShowReviewModal(true);
//   };

//   const payloadForWebhook = useMemo(() => {
//     if (!user || !userData) return null;
//     return {
//       user_id: user.id,
//       user_email: userData.email,
//       business_name: userData.businessDetails?.businessName || userData.name,
//       plan_name: userData.activePlan?.stripeProductId || "",
//       timestamp: new Date().toISOString(),
//       additional_details: additionalDetails || undefined,
//       businessDetails: userData.businessDetails,
//       preferences: userData.preferences,
//     };
//   }, [user, userData, additionalDetails]);

//   const submitFinalTraining = async () => {
//     if (!payloadForWebhook || !user || !userData) return;
//     setIsTraining(true);
//     setTrainingStatus("training");
//     setError(null);
//     try {
//       // 1. Call the external webhook (unchanged)
//       const response = await fetch(
//         "https://dhruvthc.app.n8n.cloud/webhook/askjenny",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payloadForWebhook),
//         }
//       );

//       if (!response.ok)
//         throw new Error("Failed to start model training. Please try again.");

//       const data = await response.json();
//       const agent =
//         Array.isArray(data) && data[0] && data[0].id ? data[0] : null;
//       if (!agent) throw new Error("Invalid agent response. Please try again.");

//       // 2. Update agent info in backend
//       await fetch(`http://localhost:3000/api/users/clerk/${user.id}/agent`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           agent_id: agent.id ?? null,
//           agent_name: agent.name ?? null,
//           agent_status: agent.status ?? null,
//           assigned_phone_number: agent.phone_number ?? null,
//         }),
//       });

//       setUserData((prev) =>
//         prev
//           ? {
//               ...prev,
//               agent_id: agent.id ?? null,
//               agent_name: agent.name ?? null,
//               agent_status: agent.status ?? null,
//               assigned_phone_number:
//                 agent.phone_number ?? prev.assigned_phone_number ?? null,
//             }
//           : prev
//       );

//       setTrainingStatus("completed");
//       setShowReviewModal(false);
//     } catch (e: any) {
//       setTrainingStatus("error");
//       setError(getErrorMessage(e));
//     } finally {
//       setIsTraining(false);
//     }
//   };

//   // ================== UI ==================
//   if (!isLoaded || isLoading) {
//     return (
//       <div className="p-6">
//         <div className="flex flex-col items-center justify-center py-16">
//           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-3" />
//           <p className="text-slate-600">Loading your dashboard...</p>
//           {!isLoaded && (
//             <p className="text-sm text-slate-500 mt-2">
//               Initializing authentication...
//             </p>
//           )}
//           {isLoaded && isLoading && (
//             <p className="text-sm text-slate-500 mt-2">Fetching your data...</p>
//           )}
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6">
//         <div className="max-w-md mx-auto text-center">
//           <div className="mx-auto w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-3">
//             <AlertTriangle className="text-purple-700" size={32} />
//           </div>
//           <h3 className="text-lg font-semibold text-slate-900 mb-1">
//             Error Loading Dashboard
//           </h3>
//           <p className="text-red-600 mb-4">{error}</p>
//           <div className="space-y-3">
//             <button
//               onClick={() => window.location.reload()}
//               className="btn-primary w-full"
//             >
//               Try Again
//             </button>
//             <button
//               onClick={() => navigate("/onboarding")}
//               className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
//             >
//               Go to Setup
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // If userData is missing or required fields are missing, show setup in progress
//   const needsSetup =
//     !userData || !userData.assigned_phone_number || !userData.agent_id;
//   if (needsSetup) {
//     return (
//       <div className="p-6">
//         <div className="max-w-md mx-auto text-center">
//           <div className="mx-auto w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-3">
//             <AlertTriangle className="text-purple-700" size={32} />
//           </div>
//           <h3 className="text-lg font-semibold text-purple-900 mb-2">
//             Profile Setup In Progress
//           </h3>
//           <p className="text-purple-600 mb-4">
//             We're setting up your profile. This may take a few moments. If this
//             message persists, click below to refresh.
//           </p>
//           <button
//             onClick={fetchUserData}
//             className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
//           >
//             Refresh
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const businessName = deriveBusinessName(userData);

//   return (
//     <div className="p-6">
//       <motion.div
//         initial={{ opacity: 0, y: 12 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.35 }}
//         className="space-y-8"
//       >
//         {/* Header */}
//         <div>
//           <h2 className="text-2xl font-bold text-purple-900">
//             Welcome to your Dashboard
//           </h2>
//           <p className="text-purple-600">
//             Your AI agent configuration overview.
//           </p>
//         </div>

//         {/* No training CTA. If agent_id or assigned_phone_number is missing, handled above with refresh button. */}

//         {trainingStatus === "training" && (
//           <div className="bg-white border rounded-lg p-6">
//             <div className="text-center">
//               <div className="mb-4">
//                 <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
//                   <Loader2 className="text-yellow-600 animate-spin" size={40} />
//                 </div>
//               </div>
//               <h3 className="text-xl font-semibold text-slate-900 mb-2">
//                 Training in Progress
//               </h3>
//               <p className="text-slate-600">
//                 Please wait while we start your model.
//               </p>
//             </div>
//           </div>
//         )}

//         {trainingStatus === "completed" && (
//           <div className="bg-white border rounded-lg p-6">
//             <div className="text-center">
//               <div className="mb-4">
//                 <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
//                   <CheckCircle2 className="text-green-600" size={40} />
//                 </div>
//               </div>
//               <h3 className="text-xl font-semibold text-slate-900 mb-2">
//                 Training Started Successfully!
//               </h3>
//               <p className="text-slate-600">
//                 Your AI model training has been initiated. Agent ID:{" "}
//                 {pretty(userData.agent_id)}.
//               </p>
//             </div>
//           </div>
//         )}

//         {trainingStatus === "error" && (
//           <div className="bg-white border rounded-lg p-6">
//             <div className="text-center">
//               <div className="mb-4">
//                 <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
//                   <XCircle className="text-red-600" size={40} />
//                 </div>
//               </div>
//               <h3 className="text-xl font-semibold text-slate-900 mb-2">
//                 Training Failed
//               </h3>
//               <p className="text-red-600 mb-4">{error}</p>
//               <button onClick={startModelTraining} className="btn-primary">
//                 Try Again
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Status Cards */}
//         <div className="grid md:grid-cols-5 gap-6">
//           {/* ...existing code... */}
//         </div>

//         {/* Google Calendar Connect Section */}
//         {(!userData?.calendar_tokens?.access_token ||
//           !userData?.calendar_tokens?.refresh_token) && (
//           <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-5 flex flex-col items-center justify-center mt-4">
//             <h4 className="font-medium text-blue-900 mb-2 text-lg flex items-center gap-2">
//               <span>Connect your Google Calendar</span>
//               <CalendarCheck2 className="text-blue-500" size={20} />
//             </h4>
//             <p className="text-blue-700 mb-3 text-sm text-center">
//               Connect your Google Calendar to sync your schedule and enable
//               advanced scheduling features.
//             </p>
//             <button
//               className="px-5 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
//               onClick={() =>
//                 window.open(
//                   `http://localhost:8000/google?user=${user?.id}`,
//                   "_self"
//                 )
//               }
//               type="button"
//             >
//               Connect Google Calendar
//             </button>
//           </div>
//         )}

//         {/* Setup Details */}
//         <div className="bg-white border rounded-lg p-6">
//           <h3 className="text-lg font-semibold text-slate-900 mb-4">
//             Your Setup Details
//           </h3>
//           <div className="grid md:grid-cols-2 gap-6">
//             <div>
//               <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
//                 <Info className="text-purple-500" size={18} /> Business
//                 Information
//               </h4>
//               <div className="space-y-1 text-sm text-slate-600">
//                 <div>Name: {businessName}</div>
//                 <div>
//                   Address: {pretty(userData.businessDetails?.data?.address)}
//                 </div>
//                 <div>
//                   Phone: {pretty(userData.businessDetails?.data?.phone)}
//                 </div>
//                 <div>
//                   Website: {pretty(userData.businessDetails?.data?.website)}
//                 </div>
//                 <div>
//                   Hours:{" "}
//                   {pretty(
//                     userData.businessDetails?.data?.openingHours?.weekday_text?.join(
//                       ", "
//                     )
//                   )}
//                 </div>
//                 <div>
//                   Rating: {pretty(userData.businessDetails?.data?.rating)}
//                 </div>
//                 <div>
//                   Types:{" "}
//                   {pretty(userData.businessDetails?.data?.types?.join(", "))}
//                 </div>
//               </div>
//             </div>

//             <div>
//               <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
//                 <User2 className="text-emerald-500" size={18} /> Contact
//                 Information
//               </h4>
//               <div className="space-y-1 text-sm text-slate-600">
//                 <div>Name: {user?.firstName || "Not set"}</div>
//                 <div>Email: {pretty(userData.email)}</div>
//                 <div>
//                   Phone: {pretty(userData.businessDetails?.data?.phone)}
//                 </div>
//               </div>
//             </div>

//             <div>
//               <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
//                 <Voicemail className="text-yellow-500" size={18} /> Call
//                 Handling
//               </h4>
//               <div className="space-y-1 text-sm text-slate-600">
//                 <div>
//                   Voicemail: {userData.preferences?.voicemail ? "Yes" : "No"}
//                 </div>
//                 <div>
//                   Scheduling: {userData.preferences?.scheduling ? "Yes" : "No"}
//                 </div>
//                 <div>FAQ: {userData.preferences?.faq ? "Yes" : "No"}</div>
//               </div>
//             </div>

//             <div>
//               <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
//                 <Clock className="text-blue-500" size={18} /> Schedule & Plan
//               </h4>
//               <div className="space-y-1 text-sm text-slate-600">
//                 {/* Schedule: not available in new backend sample */}
//                 <div>Plan: {pretty(userData.activePlan?.stripeProductId)}</div>
//               </div>
//             </div>

//             <div>
//               <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
//                 <BadgeCheck className="text-green-500" size={18} /> Agent
//                 Information
//               </h4>
//               <div className="space-y-1 text-sm text-slate-600">
//                 <div>Agent ID: {pretty(userData.agent_id)}</div>
//                 <div>Agent Name: {pretty(userData.agent_name)}</div>
//                 <div>Agent Status: {pretty(userData.agent_status)}</div>
//               </div>
//             </div>

//             <div>
//               <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
//                 <Phone className="text-purple-500" size={18} /> Telephony
//               </h4>
//               <div className="space-y-1 text-sm text-slate-600">
//                 {/* Phone ID: not available in new backend sample */}
//                 <div>
//                   Phone Number: {pretty(userData.assigned_phone_number)}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </motion.div>

//       {/* Review Modal */}
//       {showReviewModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           <div
//             className="absolute inset-0 bg-black/40"
//             onClick={() => setShowReviewModal(false)}
//           />
//           <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 p-6">
//             <h3 className="text-xl font-semibold text-slate-900 mb-4">
//               Review Your Business Details
//             </h3>
//             <div className="grid md:grid-cols-2 gap-6 mb-6">
//               <div>
//                 <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
//                   <Info className="text-purple-500" size={18} /> Business
//                   Information
//                 </h4>
//                 <div className="space-y-1 text-sm text-slate-600">
//                   <div>
//                     Name:{" "}
//                     {userData.businessDetails?.businessName || userData.name}
//                   </div>
//                   <div>
//                     Address: {pretty(userData.businessDetails?.data?.address)}
//                   </div>
//                   <div>
//                     Phone: {pretty(userData.businessDetails?.data?.phone)}
//                   </div>
//                   <div>
//                     Hours:{" "}
//                     {pretty(
//                       userData.businessDetails?.data?.openingHours?.weekday_text?.join(
//                         ", "
//                       )
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div>
//                 <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
//                   <ListChecks className="text-blue-500" size={18} /> Contact &
//                   Plan
//                 </h4>
//                 <div className="space-y-1 text-sm text-slate-600">
//                   <div>
//                     Contact: {user?.firstName} {user?.lastName}
//                   </div>
//                   <div>Email: {userData.email}</div>
//                   <div>
//                     Plan: {pretty(userData.activePlan?.stripeProductId)}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-slate-900 mb-2">
//                 Additional details (optional)
//               </label>
//               <textarea
//                 value={additionalDetails}
//                 onChange={(e) => setAdditionalDetails(e.target.value)}
//                 className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                 rows={5}
//                 placeholder="Add any extra instructions, FAQs, special cases, or context for training"
//               />
//             </div>

//             <div className="flex items-center justify-end space-x-3">
//               <button
//                 onClick={() => setShowReviewModal(false)}
//                 className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={submitFinalTraining}
//                 disabled={isTraining}
//                 className="btn-primary px-6 py-2"
//               >
//                 {isTraining ? "Submitting..." : "Final Train Model"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;
