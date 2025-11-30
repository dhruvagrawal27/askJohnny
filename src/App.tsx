import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { OnboardingProvider } from "./context/OnboardingContext";
import NewLandingPage from "./pages/newLandingPage";
import Onboarding from "./pages/Onboarding";
import NewOnboarding from "./pages/newOnboarding";
import Dashboard from "./pages/DashboardNew";
import SetupLoading from "./pages/SetupLoading";
import ErrorBoundary from "./components/ErrorBoundary";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";

// payment related pages
import { SuccessPage } from "./pages/stripe/SuccessPage";
import { CancelPage } from "./pages/stripe/CancelPage";

// ⬇️ Dashboard pages
import { Layout } from "./pages/Layout";
import { DashboardCalls } from "./pages/DashboardCalls";
import { DashboardOutbound } from "./pages/DashboardOutboundCalls";
import { DashboardMessages } from "./pages/DashboardMessage";
import { DashboardCallPlanning } from "./pages/DashboardCallPlanning";
import DashboardAnalytics from "./pages/DashboardAnalytics";
import { DashboardKnowledgeBase } from "./pages/DashboardKnowledgeBase";
import { DashboardVoices } from "./pages/DashboardVoice";
import { DashboardIntegrations } from "./pages/DashboardIntegrations";
import { DashboardAgent } from "./pages/DashboardAgent";
import SetupProfile from "./pages/steps/SetupProfile";
import DatabaseTest from "./pages/DatabaseTest";
import CustomSignup from "./pages/CustomSignup";

// ---------- Guards ----------
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded, user } = useUser();

  console.log('ProtectedRoute - Auth state:', { isLoaded, isSignedIn, userId: user?.id });

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-purple-700">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    console.log('ProtectedRoute - User not signed in, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute - User authenticated, rendering protected content');
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded, user } = useUser();

  console.log('PublicRoute - Auth state:', { isLoaded, isSignedIn, userId: user?.id });

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-purple-700">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow signed-in users to view public routes (like landing page)
  // Only redirect to dashboard if they try to access signup
  return <>{children}</>;
};

// ---------- SSO Callback ----------
const SSOCallbackHandler = () => {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.href = "/dashboard";
    } else if (isLoaded && !isSignedIn) {
      window.location.href = "/";
    }
  }, [isLoaded, isSignedIn]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
        <p className="text-purple-700">Completing sign up...</p>
      </div>
    </div>
  );
};

// ---------- Lightweight content fallback (keeps sidebar visible) ----------
const ContentFallback = ({
  title = "Something went wrong",
}: {
  title?: string;
}) => (
  <div className="p-6">
    <div className="max-w-md">
      <div className="mb-4">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-600 text-xl">💥</span>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-4">
        An unexpected error occurred while loading this page.
      </p>
      <div className="space-y-3">
        <button
          onClick={() => window.location.reload()}
          className="btn-primary w-full"
        >
          Reload Page
        </button>
      </div>
    </div>
  </div>
);

// ---------- Small placeholder so sidebar links work even if page not built yet ----------
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-purple-900 mb-2">{title}</h1>
    <p className="text-purple-700">Coming soon…</p>
  </div>
);

function App() {
  return (
    <Router>
      <OnboardingProvider>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <NewLandingPage />
                </PublicRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/new-onboarding"
              element={
                <PublicRoute>
                  <NewOnboarding onClose={() => window.location.href = '/'} />
                </PublicRoute>
              }
            />

            {/* Protected non-dashboard route */}
            <Route
              path="/profile-setup"
              element={
                <ProtectedRoute>
                  <SetupProfile />
                </ProtectedRoute>
              }
            />
            {/* Protected non-dashboard route */}
            <Route
              path="/setup-loading"
              element={
                <ProtectedRoute>
                  <SetupLoading />
                </ProtectedRoute>
              }
            />

            <Route path="/success" element={<SuccessPage />} />
            <Route path="/cancel" element={<CancelPage />} />
            
            {/* Database Test Route (for debugging) */}
            <Route path="/db-test" element={<DatabaseTest />} />
            
            {/* Custom Signup Route */}
            <Route
              path="/signup"
              element={<CustomSignup />}
            />

            {/* Dashboard + all sections (ALL wrapped in Layout + ErrorBoundary) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ErrorBoundary
                      fallback={<ContentFallback title="Dashboard error" />}
                    >
                      <Dashboard />
                    </ErrorBoundary>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/agent"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ErrorBoundary
                      fallback={<ContentFallback title="Agent error" />}
                    >
                      <DashboardAgent />
                    </ErrorBoundary>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/calls"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ErrorBoundary
                      fallback={<ContentFallback title="Calls error" />}
                    >
                      <DashboardCalls />
                    </ErrorBoundary>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/outbound"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ErrorBoundary
                      fallback={
                        <ContentFallback title="Outbound Calls error" />
                      }
                    >
                      <DashboardOutbound />
                    </ErrorBoundary>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/messages"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ErrorBoundary
                      fallback={<ContentFallback title="Messages error" />}
                    >
                      <DashboardMessages />
                    </ErrorBoundary>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/planning"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ErrorBoundary
                      fallback={<ContentFallback title="Call Planning error" />}
                    >
                      <DashboardCallPlanning />
                    </ErrorBoundary>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ErrorBoundary
                      fallback={<ContentFallback title="Analytics error" />}
                    >
                      <DashboardAnalytics />
                    </ErrorBoundary>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/knowledge"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ErrorBoundary
                      fallback={
                        <ContentFallback title="Knowledge Base error" />
                      }
                    >
                      <DashboardKnowledgeBase />
                    </ErrorBoundary>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/voices"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ErrorBoundary
                      fallback={<ContentFallback title="Voices error" />}
                    >
                      <DashboardVoices />
                    </ErrorBoundary>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/integrations"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ErrorBoundary
                      fallback={<ContentFallback title="Integrations error" />}
                    >
                      <DashboardIntegrations />
                    </ErrorBoundary>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* OAuth Callback Route */}
            <Route
              path="/dashboard/integrations/google/callback"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ErrorBoundary
                      fallback={<ContentFallback title="OAuth Callback error" />}
                    >
                      <DashboardIntegrations />
                    </ErrorBoundary>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Placeholders for remaining sidebar items */}
            <Route
              path="/dashboard/website"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ErrorBoundary
                      fallback={<ContentFallback title="Website Agent error" />}
                    >
                      <Placeholder title="Website Agent" />
                    </ErrorBoundary>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ErrorBoundary
                      fallback={<ContentFallback title="Settings error" />}
                    >
                      <Placeholder title="Settings" />
                    </ErrorBoundary>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* SSO callback (clean path) */}
            <Route path="/sso-callback" element={<SSOCallbackHandler />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </OnboardingProvider>
    </Router>
  );
}

export default App;
