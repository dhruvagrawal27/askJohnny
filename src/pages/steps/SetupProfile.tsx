import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import CheckoutButton from "../../components/CheckoutButton";
import { saveOnboardingStepData, completeOnboarding } from "../../lib/dataService";

type BusinessType = {
  name?: string;
  address?: string;
  rating?: number;
  phone?: string;
  website?: string;
  [key: string]: any;
};

type FaqType = {
  category: string;
  answers: string[];
};

type ServicePrefType = string;

const faqCategories = [
  {
    id: "restaurants",
    label: "Restaurants & Food Service",
    questions: [
      "Is your restaurant vegetarian, non-vegetarian, or both? What cuisines do you specialize in?",
      "Do you offer specials like discounts, live music, big screen, outdoor seating, or happy hours?",
      "What type of establishment are you (cafe, casual, fine dining, bar)? Do you serve alcohol?",
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare & Medical",
    questions: [
      "What type of practice (general, dental, specialty, urgent care) and primary services?",
      "Do you accept insurance, offer payment plans, and what are after-hours procedures?",
      "Do you need confirmations, prescription refills, or telehealth support?",
    ],
  },
  {
    id: "legal",
    label: "Legal & Law Firms",
    questions: [
      "What areas of law (injury, family, criminal, corporate)? Any emergency cases?",
      "Do you offer free consults, payment plans, or contingency fees?",
      "What is your intake process? Need document collection or case management support?",
    ],
  },
  {
    id: "real_estate",
    label: "Real Estate",
    questions: [
      "Residential, commercial, or rentals? What areas do you serve?",
      "Services: buying, selling, property management, investments?",
      "Need lead qualification, showings, or follow-ups?",
    ],
  },
  {
    id: "automotive",
    label: "Automotive Services",
    questions: [
      "What services (repairs, maintenance, inspections, sales)? Specialize in types/brands?",
      "Do you offer emergency services, towing, rentals, or warranty work?",
      "Typical appointment duration? Provide estimates or parts ordering?",
    ],
  },
  {
    id: "fitness",
    label: "Fitness & Wellness",
    questions: [
      "What type (gym, yoga, PT, dance) and what classes/services?",
      "Membership packages, PT, groups, or programs (seniors/beginners)?",
      "Peak hours, cancellation policies, equipment rentals or nutrition counseling?",
    ],
  },
  {
    id: "others",
    label: "Other Business",
    questions: [
      "What type of business and primary products/services customers ask about?",
      "Most popular products/services and pricing ranges? Any packages or promotions?",
      "What info do callers usually want (availability, delivery, rates, service areas, fees, booking)?",
    ],
  },
];

export default function SetupProfile() {
  const { user } = useUser();

  const [business, setBusiness] = useState<BusinessType | null>(null);
  const [faq, setFaq] = useState<FaqType | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<ServicePrefType | null>(
    null
  );
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const priceId = "price_12345";

  useEffect(() => {
    const businessData =
      localStorage.getItem("selectedBusiness") ||
      localStorage.getItem("onboarding_business");
    const faqData = localStorage.getItem("businessFAQ");
    const selectedPlanData =
      localStorage.getItem("selectedPlan") ||
      localStorage.getItem("servicePreference");

    try {
      setBusiness(businessData ? JSON.parse(businessData) : null);
    } catch {
      setBusiness(null);
    }
    try {
      setFaq(faqData ? JSON.parse(faqData) : null);
    } catch {
      setFaq(null);
    }
    try {
      setSelectedPlan(selectedPlanData ? JSON.parse(selectedPlanData) : null);
    } catch {
      setSelectedPlan(null);
    }
  }, []);

  useEffect(() => {
    if (!business || !faq || !selectedPlan || !user || sent) return;

    const cat = faqCategories.find((c) => c.id === faq.category);
    const faqQuestions = cat
      ? cat.questions.map((q, i) => ({ question: q, answer: faq.answers[i] }))
      : [];

    const payload = {
      clerk_id: user.id,
      business,
      selectedPlan,
      faq: {
        category: faq.category,
        categoryLabel: cat ? cat.label : faq.category,
        questions: faqQuestions,
      },
    };

    // mark start time to enforce a minimum visible progress duration
    setStartedAt(Date.now());

    // Save onboarding data to Supabase
    Promise.all([
      // Save business info as step 1
      saveOnboardingStepData(user.id, 1, {
        businessName: business.name,
        businessDetails: business
      }),
      // Save FAQ info as step 3b (use special handling for 3b)
      saveOnboardingStepData(user.id, 3, {
        categoryId: faq.category,
        categoryLabel: cat ? cat.label : faq.category,
        answers: faqQuestions.reduce((acc, item, i) => {
          const question = typeof item === 'string' ? item : item.question;
          const answer = typeof item === 'string' ? `Answer ${i + 1}` : item.answer;
          acc[question] = answer;
          return acc;
        }, {} as Record<string, string>)
      }),
      // Save plan selection as step 5
      saveOnboardingStepData(user.id, 5, {
        selectedPlan: selectedPlan
      }),
      // Complete onboarding
      completeOnboarding(user.id)
    ])
      .then(() => {
        // ensure at least 5s of progress UI
        const elapsed = startedAt ? Date.now() - startedAt : 0;
        const remaining = Math.max(0, 5000 - elapsed);
        if (remaining > 0) {
          setTimeout(() => {
            setSent(true);
            setStartedAt(null);
          }, remaining);
        } else {
          setSent(true);
          setStartedAt(null);
        }
      })
      .catch((err) => {
        console.error('Error saving onboarding data:', err);
        const elapsed = startedAt ? Date.now() - startedAt : 0;
        const remaining = Math.max(0, 5000 - elapsed);
        if (remaining > 0) {
          setTimeout(() => {
            setError(err.message || "Failed to update profile");
            setStartedAt(null);
          }, remaining);
        } else {
          setError(err.message || "Failed to update profile");
          setStartedAt(null);
        }
      });
  }, [business, faq, selectedPlan, user, sent]);

  function LoadingHeader({
    status,
    onToggleDetails,
    showDetails,
  }: {
    status: "in-progress" | "success" | "failed";
    onToggleDetails: () => void;
    showDetails: boolean;
  }) {
    const subtitles = [
      "Configuring your workspace",
      "Applying business preferences",
      "Preparing secure connection",
      "Finalizing your profile",
      "Almost there...",
    ];

    const [idx, setIdx] = useState(0);
    const [percent, setPercent] = useState(8);

    useEffect(() => {
      if (status !== "in-progress") return;
      const sub = setInterval(
        () => setIdx((i) => (i + 1) % subtitles.length),
        3000
      );
      const prog = setInterval(
        () => setPercent((p) => Math.min(96, p + Math.random() * 6)),
        800
      );
      return () => {
        clearInterval(sub);
        clearInterval(prog);
      };
    }, [status]);

    useEffect(() => {
      if (status === "success") setPercent(100);
      if (status === "failed") setPercent((p) => Math.max(p, 12));
    }, [status]);

    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">
                {status === "in-progress"
                  ? "Setting up your profile"
                  : status === "success"
                  ? "Profile ready"
                  : "Setup failed"}
              </h3>
              <span
                className={`text-sm px-2 py-1 rounded-full font-medium ${
                  status === "in-progress"
                    ? "bg-purple-100 text-purple-700"
                    : status === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {status === "in-progress"
                  ? "In progress"
                  : status === "success"
                  ? "Success"
                  : "Failed"}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {status === "in-progress"
                ? subtitles[idx]
                : status === "success"
                ? "Your profile is ready."
                : "There was an error setting up your profile."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {status === "in-progress" ? (
              <svg
                className="h-8 w-8 text-violet-600 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  d="M22 12a10 10 0 00-10-10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-75"
                />
              </svg>
            ) : status === "success" ? (
              <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-green-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-red-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-600 transition-all duration-700 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <div>
              {status === "in-progress"
                ? "Working on it"
                : status === "success"
                ? "Complete"
                : "Failed"}
            </div>
            <div>{Math.round(percent)}%</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={onToggleDetails}
            className="text-sm text-slate-700 hover:text-slate-900 transition-colors"
            aria-expanded={showDetails}
          >
            {showDetails ? "Hide details" : "Show details"}
          </button>

          <div className="text-sm text-slate-500">Estimated time: ~10-30s</div>
        </div>
      </div>
    );
  }

  const status: "in-progress" | "success" | "failed" = error
    ? "failed"
    : sent
    ? "success"
    : "in-progress";

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <div className="flex flex-col items-center flex-grow justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl w-full">
          <h2 className="text-2xl font-semibold mb-4 text-center text-slate-800">
            Profile Setup
          </h2>
          <p className="mb-4 text-center text-slate-600">
            Review your onboarding details before we set up your profile.
          </p>

          <div className="flex flex-col items-center justify-center py-4">
            <LoadingHeader
              status={status}
              onToggleDetails={() => setShowDetails((s) => !s)}
              showDetails={showDetails}
            />

            {showDetails && (
              <div className="mt-4 w-full bg-slate-50 border border-slate-100 rounded-md p-4">
                <h4 className="text-sm font-semibold text-slate-800 mb-2">
                  Submitted details
                </h4>
                <div className="text-sm text-slate-700 space-y-1">
                  {business?.name && (
                    <div>
                      <span className="font-medium">Business:</span>{" "}
                      {business.name}
                    </div>
                  )}
                  {business?.address && (
                    <div>
                      <span className="font-medium">Address:</span>{" "}
                      {business.address}
                    </div>
                  )}
                  {selectedPlan && (
                    <div>
                      <span className="font-medium">Selected plan:</span>{" "}
                      {String(selectedPlan).replace(/_/g, " ")}
                    </div>
                  )}
                  {faq && (
                    <div>
                      <div className="font-medium">FAQ Category:</div>
                      <div className="text-sm text-slate-600">
                        {faq.category}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 w-full flex flex-col items-center">
              {error ? (
                <div
                  role="alert"
                  className="w-full max-w-md bg-red-50 border border-red-100 text-red-700 rounded-lg px-4 py-3 flex items-start gap-3"
                >
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-red-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9V6a1 1 0 112 0v3a1 1 0 01-2 0zm0 4a1 1 0 112 0 1 1 0 01-2 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm">
                    <div className="font-semibold">
                      Unable to complete setup
                    </div>
                    <div className="mt-1 text-slate-600">{error}</div>
                  </div>
                </div>
              ) : sent ? (
                <div
                  role="status"
                  className="w-full max-w-md bg-green-50 border border-green-100 text-green-700 rounded-lg px-4 py-3 flex items-center gap-3"
                >
                  <svg
                    className="h-5 w-5 text-green-600 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="text-sm">
                    <div className="font-semibold">Profile setup complete</div>
                    <div className="text-slate-600">
                      Your settings were saved successfully.
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  role="status"
                  className="flex items-center gap-3 text-sm text-slate-700"
                >
                  <svg
                    className="h-4 w-4 text-violet-600 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      d="M22 12a10 10 0 00-10-10"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-75"
                    />
                  </svg>
                  <span>Sending your data to backend...</span>
                </div>
              )}
            </div>

            {/* Checkout button placed near main content for better UX */}
            <div className="mt-6 flex justify-center">
              <CheckoutButton priceId={priceId} disabled={!sent} />
            </div>
          </div>
        </div>
      </div>

      <div className="sr-only" aria-live="polite">
        {!sent && !error
          ? "Setting up your profile. This may take a few moments."
          : sent
          ? "Profile setup complete."
          : `Error: ${error}`}
      </div>
    </div>
  );
}
