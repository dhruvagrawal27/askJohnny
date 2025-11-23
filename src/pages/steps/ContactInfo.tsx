// components/onboarding/steps/ContactInfo.tsx
import React, { useState } from "react";
import { Phone, Mail, ArrowLeft } from 'lucide-react';

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
    <div className="w-full h-full flex flex-col px-6 md:px-8 lg:px-10 py-4">
      {/* Step Header */}
      <div className="mb-3 w-full flex justify-between items-start gap-4 shrink-0">
        <div className="text-left flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-[9px] font-bold uppercase tracking-wide mb-2">
            Step 04
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1.5">Contact Information</h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">Provide your business contact details for agent setup.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 justify-center">
        <div className="max-w-md mx-auto w-full">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Number */}
            <div>
              <label className="block text-[10px] font-bold text-gray-700 mb-1.5 ml-1">Business Phone Number *</label>
              <div className="relative group">
                <Phone className="absolute left-3 top-3 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={16} />
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1.5 ml-1">Used for AI agent training and call routing</p>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-[10px] font-bold text-gray-700 mb-1.5 ml-1">Business Email (Optional)</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={16} />
                <input
                  type="email"
                  placeholder="business@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full btn-primary-custom py-3.5 font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 rounded-xl"
                disabled={isSubmitting || !phone.trim()}
              >
                {isSubmitting ? "Saving..." : "Continue to Signup"} <ArrowLeft size={14} className="rotate-180" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
