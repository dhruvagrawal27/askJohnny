// components/onboarding/steps/SignupStep.tsx
import React, { useEffect } from "react";
import { SignUp } from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Shield, Star, Clock, CheckCircle } from 'lucide-react';

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
    <div className="w-full h-full flex flex-col px-6 md:px-8 lg:px-10 py-4">
      {/* Step Header */}
      <div className="mb-3 w-full flex justify-between items-start gap-4 shrink-0">
        <div className="text-left flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-[9px] font-bold uppercase tracking-wide mb-2">
            Step 04
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1.5">Create Account</h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">Secure your dashboard and start automating your calls today.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-center gap-6 min-h-0 justify-center">
        {/* Left: Benefits */}
        <div className="flex-1 hidden lg:block max-w-sm">
          <div className="relative p-4 bg-brand-900 rounded-2xl overflow-hidden text-white shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full blur-[80px] opacity-50"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-5">Why AskJohnny?</h3>
              <div className="space-y-4">
                {[
                  { icon: Shield, title: "Enterprise Security", desc: "Bank-level encryption for all data" },
                  { icon: Star, title: "14-Day Free Trial", desc: "No charges until you're 100% satisfied" },
                  { icon: Clock, title: "24/7 Reliability", desc: "Never miss a call, day or night" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <item.icon size={14} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs mb-0.5">{item.title}</h4>
                      <p className="text-[10px] text-gray-300">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex-1 w-full max-w-sm mx-auto lg:mx-0 min-h-0">
          <div className="bg-white p-4 rounded-2xl shadow-2xl shadow-brand-900/10 border border-gray-100 flex flex-col max-h-full">
            <div className="flex-1 overflow-y-auto min-h-0">
              <SignUp
                appearance={{
                  elements: {
                    card: "bg-transparent border-0 shadow-none p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  footerPoweredBy: "hidden",
                  footerPoweredByLink: "hidden",
                  formButtonPrimary: "w-full btn-primary-custom py-3.5 font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all rounded-xl",
                  formFieldLabel: "block text-[10px] font-bold text-gray-700 mb-1.5 ml-1",
                  formFieldInput: "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400",
                  socialButtonsBlockButton: "w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all mb-2 text-sm",
                  formFieldInputShowPasswordButton: "absolute inset-y-0 right-0 pr-3 flex items-center",
                  formFieldInputShowPasswordIcon: "h-4 w-4 text-gray-400 hover:text-gray-600",
                  formFieldInputHidePasswordIcon: "h-4 w-4 text-gray-400 hover:text-gray-600",
                  formFieldErrorText: "bg-red-50 border border-red-200 rounded-lg p-2 text-red-700 text-xs mt-1.5",
                  footerAction: "mt-4 text-center text-xs text-gray-600",
                  footerActionLink: "text-brand-600 hover:text-brand-700 font-medium transition-colors",
                  formFieldRow: "mb-3",
                  dividerLine: "bg-gray-200",
                  dividerText: "text-gray-500 text-xs font-medium",
                },
                layout: {
                  socialButtonsVariant: "blockButton",
                  showOptionalFields: true,
                },
              }}
              fallbackRedirectUrl="/setup-loading"
              signInFallbackRedirectUrl="/dashboard"
              />
            </div>

            <p className="text-[9px] text-center text-gray-400 mt-2 leading-relaxed shrink-0">
              By clicking above, you agree to our <br/><span className="underline cursor-pointer hover:text-brand-600">Terms of Service</span> and <span className="underline cursor-pointer hover:text-brand-600">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupStep;
