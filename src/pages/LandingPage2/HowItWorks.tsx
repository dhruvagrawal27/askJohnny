import React from 'react';
import { Store, Sliders, Play, Phone } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

const HowItWorks: React.FC = () => {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <RevealOnScroll>
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-brand-600 font-bold tracking-widest uppercase text-xs mb-3">How it works</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Easy setup. <span className="text-gradient">Ready in minutes.</span>
            </h3>
            <p className="text-gray-500 max-w-2xl mx-auto text-base md:text-lg">
              Get your AI receptionist up and running in 4 simple steps. No coding required.
            </p>
          </div>
        </RevealOnScroll>

        <div className="flex flex-col gap-16 md:gap-24">
          
          {/* Step 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-20">
              {/* Visual - Left */}
              <div className="flex-1 w-full">
                <div 
                  className="rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500"
                  style={{ background: 'linear-gradient(131deg, #F3F4FF 10.99%, #BCBFFF 60.55%, #C7BDFF 105.95%)' }}
                >
                  <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 aspect-square md:aspect-[4/3] flex flex-col items-center justify-center relative shadow-sm">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 text-brand-600">
                        <Store size={28} className="md:w-8 md:h-8" />
                    </div>
                    <div className="space-y-2 w-full max-w-[160px] md:max-w-[200px]">
                        <div className="h-2 w-full bg-white/50 rounded-full"></div>
                        <div className="h-2 w-2/3 bg-white/50 rounded-full"></div>
                    </div>
                    {/* Decorative circle */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                  </div>
                </div>
              </div>
              {/* Text - Right */}
              <div className="flex-1 space-y-4 md:space-y-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-200 flex items-center justify-center text-base md:text-lg font-bold text-gray-400 mb-2">1</div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Select your <span className="text-gradient">Business</span>
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  Pick your business from Google Business, or enter a few basic details. We’ll use this to set up your AI assistant correctly.
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 md:p-6 hover:shadow-sm transition-shadow">
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Information you may provide:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {['Business hours', 'Services offered', 'Pricing', 'Common questions'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-400"></div>
                          {item}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          
          {/* Step 2 - Reversed */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-8 md:gap-12 lg:gap-20">
              {/* Visual - Right */}
              <div className="flex-1 w-full">
                <div 
                  className="rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500"
                  style={{ background: 'linear-gradient(132deg, #F4F3FE 14.34%, #D6CEFF 98.07%)' }}
                >
                  <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 aspect-square md:aspect-[4/3] flex flex-col items-center justify-center relative shadow-sm">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 text-brand-600">
                        <Sliders size={28} className="md:w-8 md:h-8" />
                    </div>
                    <div className="space-y-3 w-full max-w-[160px] md:max-w-[200px] flex flex-col items-center">
                        <div className="flex gap-2 w-full justify-center">
                          <div className="w-8 h-2 bg-white/60 rounded-full"></div>
                          <div className="w-12 h-2 bg-white/40 rounded-full"></div>
                        </div>
                        <div className="w-3/4 h-2 bg-white/30 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Text - Left */}
              <div className="flex-1 space-y-4 md:space-y-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-200 flex items-center justify-center text-base md:text-lg font-bold text-gray-400 mb-2">2</div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Add a few <span className="text-gradient">quick details</span>
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  Review everything and make simple adjustments. You can personalize how the AI greets callers and what it should know about your business.
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 md:p-6 hover:shadow-sm transition-shadow">
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">You can customize:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {['Greeting', 'Questions to ask', 'Call handling', 'Special instructions'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-400"></div>
                          {item}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>


            <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-20">
              {/* Visual - Left */}
              <div className="flex-1 w-full">
                <div 
                  className="rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500"
                  style={{ background: 'linear-gradient(128deg, #C0C2FF 11.94%, #F3F4FF 98.92%)' }}
                >
                  <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 aspect-square md:aspect-[4/3] flex flex-col items-center justify-center relative shadow-sm">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 text-brand-600">
                        <Play size={28} className="ml-1 md:w-8 md:h-8" />
                    </div>
                    <div className="w-32 h-8 bg-white/40 rounded-lg backdrop-blur-sm"></div>
                  </div>
                </div>
              </div>
              {/* Text - Right */}
              <div className="flex-1 space-y-4 md:space-y-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-200 flex items-center justify-center text-base md:text-lg font-bold text-gray-400 mb-2">3</div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Activate <span className="text-gradient">your plan</span>
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  Choose your plan, complete payment, and get instant access to your dashboard. Inside the dashboard, you’ll find everything you need.
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 md:p-6 hover:shadow-sm transition-shadow">
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Inside the dashboard:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {['Dedicated phone #', 'Call preferences', 'AI settings', 'Inbox for transcripts'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-400"></div>
                          {item}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          
          
            <div className="flex flex-col lg:flex-row-reverse items-center gap-8 md:gap-12 lg:gap-20">
              {/* Visual - Right */}
              <div className="flex-1 w-full">
                <div 
                  className="rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500"
                  style={{ background: 'linear-gradient(123deg, #FAF6FE -2.41%, #E5D0FF 74.4%)' }}
                >
                  <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 aspect-square md:aspect-[4/3] flex flex-col items-center justify-center relative shadow-sm">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 text-brand-600">
                        <Phone size={28} className="md:w-8 md:h-8" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-brand-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="mt-6 flex gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-brand-900/50">LIVE</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Text - Left */}
              <div className="flex-1 space-y-4 md:space-y-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-200 flex items-center justify-center text-base md:text-lg font-bold text-gray-400 mb-2">4</div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Set your <span className="text-gradient">number live</span>
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  Start using your new number—or forward calls from your existing line. Once live, your AI answers calls, handles inquiries, and books appointments.
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 md:p-6 hover:shadow-sm transition-shadow">
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Your AI can:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {['Answer FAQs', 'Take messages', 'Schedule bookings', 'Prioritize urgency'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-400"></div>
                          {item}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;