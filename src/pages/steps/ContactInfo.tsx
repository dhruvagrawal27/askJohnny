// components/onboarding/steps/ContactInfo.tsx
import React, { useState } from "react";

interface ContactInfoProps {
  onDone: (contactData: any) => void;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ onDone }) => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      alert("Phone number is required for agent training.");
      return;
    }

    const contactData = {
      phone: phone.trim(),
      email: email.trim() || undefined
    };

    console.log('📞 Contact info collected:', contactData);
    setIsSubmitting(true);

    // Small delay for user feedback
    setTimeout(() => {
      onDone(contactData);
    }, 600);
  };

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
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Business Contact Information
        </h2>
        <p className="text-lg text-slate-600 max-w-md mx-auto">
          We need your business phone number to set up your AI agent for call handling.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                Business Phone Number *
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D1B69] focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder:text-slate-400"
                placeholder="+1 (555) 123-4567"
                required
              />
              <p className="mt-2 text-sm text-slate-500">
                This number will be used for your AI agent training and call routing.
              </p>
            </div>

            {/* Email (Optional) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Business Email (Optional)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D1B69] focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder:text-slate-400"
                placeholder="business@example.com"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !phone.trim()}
                className="w-full bg-gradient-to-r from-[#2D1B69] to-[#695FDA] text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#2D1B69]/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-200 text-base"
              >
                {isSubmitting ? "Saving..." : "Continue to Signup"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Info Section */}
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-slate-700 leading-relaxed">
                <span className="font-medium">Why do we need this?</span> Your business phone number is essential for setting up call forwarding and training your AI agent to handle calls professionally for your specific business.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
