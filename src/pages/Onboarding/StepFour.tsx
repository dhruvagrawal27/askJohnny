import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Star, Clock, Mail, Lock, CheckCircle } from 'lucide-react';
import { StepProps } from './types';
import { StepHeader, ContentContainer } from './SharedComponents';

const StepFour: React.FC<StepProps> = ({ state, setState, handleBack }) => {
  const navigate = useNavigate();

  const handleSubmit = () => {
    console.log('🚀 CRITICAL - handleSubmit called!');
    console.log('📊 CRITICAL - Current onboarding state:', state);
    
    if (!state.businessDetails) {
      console.error('❌ CRITICAL - Missing business data!');
      alert('Missing business information. Please go back and complete step 1.');
      return;
    }
    
    if (!state.plan) {
      console.error('❌ CRITICAL - Missing plan selection!');
      alert('Missing plan selection. Please go back and complete step 3.');
      return;
    }
    
    if (!state.category) {
      console.error('❌ CRITICAL - Missing category!');
      alert('Missing category selection. Please go back and complete step 4.');
      return;
    }
    
    console.log('✅ All required data present, formatting for storage...');
    console.log('📝 DETAILED onboarding data check:');
    console.log('  - Business:', state.businessDetails);
    console.log('  - Plan:', state.plan);  
    console.log('  - Category:', state.category);
    console.log('  - Answers:', state.answers);
    console.log('  - Email:', state.email);
    
    const formattedData = {
      step1: {
        businessName: state.businessDetails?.name || state.businessName,
        businessDetails: state.businessDetails
      },
      step2: {
        voicemail: state.callHandling?.includes('voicemail') || false,
        scheduling: state.callHandling?.includes('scheduling') || false,
        faq: state.callHandling?.includes('faq') || false
      },
      step3: {
        scheduleType: state.callSchedule || 'business_hours',
        customSchedule: state.customSchedule || null
      },
      step3b: {
        categoryId: state.category,
        categoryLabel: state.category,
        answers: state.answers || {}
      },
      step4: {
        email: state.email,
        phone: state.businessDetails?.phone || ''
      },
      step5: {
        selectedPlan: state.plan
      }
    };
    
    console.log('💾 Formatted data for SetupLoading:', formattedData);
    
    try {
      localStorage.setItem('onboarding_data', JSON.stringify(formattedData));
      console.log('✅ Saved onboarding_data to localStorage');
      
      if (state.businessDetails) {
        localStorage.setItem('selectedBusiness', JSON.stringify(state.businessDetails));
        localStorage.setItem('onboarding_business', JSON.stringify(state.businessDetails));
        console.log('✅ Saved business data to localStorage');
      }
      
      if (state.plan) {
        localStorage.setItem('selectedPlan', JSON.stringify(state.plan));
        console.log('✅ Saved plan to localStorage');
      }
      
      if (state.category && state.answers) {
        localStorage.setItem('businessFAQ', JSON.stringify({
          category: state.category,
          answers: state.answers
        }));
        console.log('✅ Saved FAQ data to localStorage');
      }
      
      localStorage.setItem('new_onboarding_data', JSON.stringify(state));
      console.log('✅ Saved complete onboarding state to localStorage');
      
      console.log('🎯 All data saved successfully, navigating to signup...');
      navigate('/signup');
      
    } catch (error) {
      console.error('❌ Error saving data to localStorage:', error);
      alert('Failed to save onboarding data. Please try again.');
    }
  };

  return (
    <ContentContainer>
      <StepHeader 
        step="05" 
        title="Create Account" 
        subtitle="Secure your dashboard and start automating your calls today."
        onBack={handleBack}
        showBack={true}
      />
      
      <div className="flex-1 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 min-h-0 overflow-y-auto pb-4 justify-center">
        {/* Left: Benefits */}
        <div className="flex-1 hidden lg:block max-w-sm">
          <div className="relative p-5 bg-brand-900 rounded-3xl overflow-hidden text-white shadow-xl">
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
        <div className="flex-1 w-full max-w-sm mx-auto lg:mx-0">
          <div className="bg-white p-6 rounded-[2rem] shadow-2xl shadow-brand-900/10 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Account Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1.5 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={16} />
                  <input 
                    type="email" 
                    placeholder="you@business.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400"
                    value={state.email}
                    onChange={e => setState({...state, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1.5 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={16} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400"
                    value={state.password}
                    onChange={e => setState({...state, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleSubmit}
                  disabled={!state.email || !state.password}
                  className="w-full btn-primary-custom py-3.5 font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete Setup <CheckCircle size={16} />
                </button>
              </div>
              
              <p className="text-[9px] text-center text-gray-400 mt-3 leading-relaxed">
                By clicking above, you agree to our <br/><span className="underline cursor-pointer hover:text-brand-600">Terms of Service</span> and <span className="underline cursor-pointer hover:text-brand-600">Privacy Policy</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ContentContainer>
  );
};

export default StepFour;
