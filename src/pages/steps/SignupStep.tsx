// components/onboarding/steps/SignupStep.tsx
import React, { useEffect } from "react";
import { SignUp } from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

interface SignupStepProps {
  onDone: () => void;
}

const SignupStep: React.FC<SignupStepProps> = ({ onDone }) => {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();
  
  // Handle successful authentication
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log('✅ SignupStep - User authenticated, calling onDone and redirecting...');
      
      // Call onDone to save any remaining onboarding data
      onDone(); 
      
      // Add a small delay to ensure data is saved before navigation
      setTimeout(() => {
        console.log('🔄 SignupStep - Navigating to setup-loading...');
        navigate('/setup-loading');
      }, 1000); // Increased delay to ensure data is saved
    }
  }, [isLoaded, isSignedIn, onDone, navigate]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2D1B69] to-[#695FDA] mb-6">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Create Your Account
        </h2>
        <p className="text-lg text-slate-600 max-w-md mx-auto">
          You're almost there! Create your account to activate your AI agent and
          start transforming your customer calls.
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 overflow-hidden">
        {/* Background Pattern */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B69]/5 to-[#695FDA]/5" />
          <div className="relative z-10 p-8">
            <SignUp
              appearance={{
                elements: {
                  // Main container
                  card: "bg-transparent border-0 shadow-none p-0",
                  // Header styling
                  headerTitle: "hidden", // We're using our own header
                  headerSubtitle: "hidden",
                  // Hide Clerk branding
                  footerPoweredBy: "hidden",
                  footerPoweredByLink: "hidden",
                  // Form styling
                  formButtonPrimary: `
                    w-full bg-gradient-to-r from-[#2D1B69] to-[#695FDA] text-white py-4 px-6 rounded-xl font-semibold 
                    hover:shadow-lg hover:shadow-[#2D1B69]/25 hover:-translate-y-0.5 
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                    transition-all duration-200 text-base
                  `,
                  // Input fields
                  formFieldLabel:
                    "block text-sm font-medium text-slate-700 mb-2",
                  formFieldInput: `
                    w-full px-4 py-3 border border-slate-300 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-[#2D1B69] focus:border-transparent
                    bg-white/80 backdrop-blur-sm transition-all duration-200
                    placeholder:text-slate-400
                  `,
                  // Social buttons
                  socialButtonsBlockButton: `
                    w-full bg-white border border-slate-300 text-slate-700 py-3 px-4 rounded-xl font-medium 
                    hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 mb-3
                    shadow-sm hover:shadow-md
                  `,
                  // Password visibility
                  formFieldInputShowPasswordButton:
                    "absolute inset-y-0 right-0 pr-3 flex items-center",
                  formFieldInputShowPasswordIcon:
                    "h-5 w-5 text-slate-400 hover:text-slate-600",
                  formFieldInputHidePasswordIcon:
                    "h-5 w-5 text-slate-400 hover:text-slate-600",
                  // Error handling
                  formFieldErrorText: `
                    bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm mt-2
                    shadow-sm
                  `,
                  // Footer
                  footerAction: `
                    mt-6 text-center text-sm text-slate-600
                  `,
                  footerActionLink: `
                    text-[#2D1B69] hover:text-[#695FDA] font-medium transition-colors duration-200
                  `,
                  // Form field wrapper
                  formFieldRow: "mb-4",
                  // Divider
                  dividerLine: "bg-slate-200",
                  dividerText: "text-slate-500 text-sm font-medium",
                },
                layout: {
                  socialButtonsVariant: "blockButton",
                  showOptionalFields: true,
                },
              }}
              forceRedirectUrl="/setup-loading"
              fallbackRedirectUrl="/setup-loading"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Terms Notice */}
      <div className="mt-8">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/60 p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.5 2.5a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-slate-700 leading-relaxed">
                <span className="font-medium">Secure & Protected:</span> Your
                data is encrypted and secure. By creating an account, you agree
                to our{" "}
                <a
                  href="/terms"
                  className="text-[#2D1B69] hover:text-[#695FDA] font-medium transition-colors duration-200 underline decoration-transparent hover:decoration-current"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-[#2D1B69] hover:text-[#695FDA] font-medium transition-colors duration-200 underline decoration-transparent hover:decoration-current"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 flex justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#2D1B69]" />
          <div className="w-2 h-2 rounded-full bg-[#2D1B69]" />
          <div className="w-2 h-2 rounded-full bg-[#2D1B69]" />
          <div className="w-8 h-2 rounded-full bg-gradient-to-r from-[#2D1B69] to-[#695FDA]" />
          <span className="text-sm font-medium text-slate-600 ml-3">
            Final Step
          </span>
        </div>
      </div>

      {/* What's Next Preview */}
      <div className="mt-10 p-6 bg-gradient-to-br from-[#2D1B69]/5 to-[#695FDA]/5 rounded-xl border border-[#2D1B69]/10">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
          <svg
            className="w-5 h-5 text-[#2D1B69] mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          What happens next?
        </h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2D1B69] mr-3 flex-shrink-0" />
            Your AI agent will be configured with your business information
          </li>
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2D1B69] mr-3 flex-shrink-0" />
            You'll receive your dedicated phone number within minutes
          </li>
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2D1B69] mr-3 flex-shrink-0" />
            Start your 7-day free trial immediately
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SignupStep;
