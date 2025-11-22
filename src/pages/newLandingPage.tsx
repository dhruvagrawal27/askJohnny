import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Navbar from './LandingPage2/Navbar';
import Hero from './LandingPage2/Hero';
import Industries from './LandingPage2/Industries';
import Testimonials from './LandingPage2/Testimonials';
import DemoSection from './LandingPage2/DemoSection';
import Benefits from './LandingPage2/Benefits';
import Comparison from './LandingPage2/Comparison';
import HowItWorks from './LandingPage2/HowItWorks';
import Pricing from './LandingPage2/Pricing';
import FAQ from './LandingPage2/FAQ';
import SupportCTA from './LandingPage2/SupportCTA';
import Footer from './LandingPage2/Footer';

function NewLandingPage() {
  const [businessName, setBusinessName] = useState('');
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useUser();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/dashboard');
    }
  }, [isLoaded, isSignedIn, navigate]);

  useEffect(() => {
    // Only clear onboarding-related keys instead of wiping all localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('onboarding_business');
        window.localStorage.removeItem('selectedPlan');
        window.localStorage.removeItem('businessFAQ');
      } catch (e) {
        // If localStorage is unavailable or throws (e.g., in private mode), fail silently
        // This keeps the landing page resilient.
        console.warn('Could not clear onboarding keys from localStorage', e);
      }
    }
  }, []);

  // Show loading while checking authentication
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

  const handleInputChange = useCallback((value: string) => {
    setBusinessName(value);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      console.log('📝 Form submitted with business name:', businessName);
      if (businessName.trim()) {
        console.log('🚀 Navigating to onboarding with business name:', businessName.trim());
        console.log('🔄 Current URL:', window.location.href);
        navigate('/new-onboarding', {
          state: { businessName: businessName.trim() },
        });
        console.log('✅ Navigation called');
      } else {
        console.log('❌ Business name is empty, not navigating');
      }
    },
    [businessName, navigate]
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-brand-200">
      <div className="max-w-[1600px] mx-auto">
        <Navbar />
        <main>
          <Hero
            businessName={businessName}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
          <Industries />
          <Benefits />
          <Comparison />
          <HowItWorks />
          <DemoSection />
          <Pricing />
          <FAQ />
          <SupportCTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default NewLandingPage;