// CancelPage.jsx
import React from "react";

export const CancelPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-lg w-full">
        <div className="flex items-start gap-4">
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

          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-slate-900">
              Payment Cancelled
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              You didn't complete the payment. No charges were made.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="w-full bg-red-50 border border-red-100 text-red-700 rounded-lg px-4 py-3">
            <div className="font-semibold">Payment not completed</div>
            <div className="mt-1 text-slate-700">
              If this was a mistake, you can try again or choose another plan.
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-center">
          <a
            href="/"
            className="px-4 py-2 rounded-md bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition"
          >
            Try payment again
          </a>
          <a
            href="/"
            className="px-4 py-2 rounded-md border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition"
          >
            Return home
          </a>
        </div>

        <div className="sr-only mt-4" aria-live="polite">
          Payment flow cancelled by user.
        </div>
      </div>
    </div>
  );
};
