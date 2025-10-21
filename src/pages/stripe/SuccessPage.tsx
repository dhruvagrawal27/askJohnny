import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const SuccessPage = () => {
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<
    "loading" | "active" | "pending" | "error" | "no-session"
  >("loading");
  const [details, setDetails] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("no-session");
      setDetails("No session ID found in the URL.");
      return;
    }

    const fetchSession = async () => {
      try {
        const res = await fetch(
          `${VITE_BACKEND_BASE_URL}/api/stripe/checkout-session/${sessionId}`
        );
        const data = await res.json();
        console.log(data);
        if (data.subscriptionStatus === "active") {
          setStatus("active");
          setDetails("Your subscription is active. Thank you for subscribing!");
        } else {
          setStatus("pending");
          setDetails(
            "Payment received, but subscription is not yet active. Please wait a few moments."
          );
        }
      } catch (err) {
        console.error("Error fetching session:", err);
        setStatus("error");
        setDetails(
          "There was an error verifying your subscription. Please contact support."
        );
      }
    };

    fetchSession();
  }, [searchParams]);

  const renderIcon = () => {
    if (status === "loading")
      return (
        <svg
          className="h-12 w-12 text-violet-600 animate-spin"
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
      );

    if (status === "active")
      return (
        <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
          <svg
            className="h-6 w-6 text-green-600"
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
      );

    if (status === "pending")
      return (
        <div className="h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center">
          <svg
            className="h-6 w-6 text-yellow-600"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M12 8v4l2 2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );

    return (
      <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
        <svg
          className="h-6 w-6 text-red-600"
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
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-lg w-full">
        <div className="flex items-start gap-4">
          {renderIcon()}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-slate-900">
              Payment Result
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {status === "loading"
                ? "Verifying payment and subscription status..."
                : "Summary"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          {status === "active" && (
            <div className="w-full bg-green-50 border border-green-100 text-green-700 rounded-lg px-4 py-3">
              <div className="font-semibold">Payment successful</div>
              <div className="mt-1 text-slate-700">{details}</div>
            </div>
          )}

          {status === "pending" && (
            <div className="w-full bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-lg px-4 py-3">
              <div className="font-semibold">Payment received</div>
              <div className="mt-1 text-slate-700">{details}</div>
            </div>
          )}

          {status === "error" && (
            <div className="w-full bg-red-50 border border-red-100 text-red-700 rounded-lg px-4 py-3">
              <div className="font-semibold">Error verifying payment</div>
              <div className="mt-1 text-slate-700">{details}</div>
            </div>
          )}

          {status === "no-session" && (
            <div className="w-full bg-red-50 border border-red-100 text-red-700 rounded-lg px-4 py-3">
              <div className="font-semibold">No session found</div>
              <div className="mt-1 text-slate-700">{details}</div>
            </div>
          )}

          {status === "loading" && (
            <div className="mt-4 text-sm text-slate-600">
              Please wait while we confirm your subscription.
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3 justify-center">
          <a
            href="/dashboard"
            className="px-4 py-2 rounded-md bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition"
          >
            Go to dashboard
          </a>
          <a
            href="/"
            className="px-4 py-2 rounded-md border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition"
          >
            Home
          </a>
        </div>

        <div className="sr-only mt-4" aria-live="polite">
          {status === "loading"
            ? "Verifying subscription"
            : status === "active"
            ? "Payment successful. Subscription active."
            : status === "pending"
            ? "Payment received. Subscription pending."
            : status === "no-session"
            ? "No session found in URL."
            : `Error: ${details}`}
        </div>
      </div>
    </div>
  );
};
