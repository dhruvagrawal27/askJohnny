// pages/LandingPage.tsx
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

// Import all landing page sections
import Hero from "../components/landing/Hero";
// import SocialProof from '../components/landing/SocialProof'
// import Problem from '../components/landing/Problem'
// import Solution from '../components/landing/Solution'
// import Features from '../components/landing/Features'
// import HowItWorks from '../components/landing/HowItWorks'
// import Industries from '../components/landing/Industries'
// import Testimonials from '../components/landing/Testimonials'
// import Pricing from '../components/landing/Pricing'
// import TrustSecurity from '../components/landing/TrustSecurity'
// import FAQ from '../components/landing/FAQ'
// import Coverage from '../components/landing/Coverage'
// import FinalCTA from '../components/landing/FinalCTA'
// import Footer from '../components/landing/Footer'

const LandingPage = () => {
  const [businessName, setBusinessName] = useState("");
  const navigate = useNavigate();
  const { isSignedIn, isLoaded, user } = useUser();

  // Temporarily disabled - allow both auth and unauth users to use landing page
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log('LandingPage - Authenticated user on landing page (not redirecting for now)');
      // Temporarily commented out to debug onboarding flow
      // navigate("/dashboard");
    }
  }, [isLoaded, isSignedIn, navigate]);

  useEffect(() => {
    // Only clear onboarding-related keys instead of wiping all localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.removeItem("onboarding_business");
        window.localStorage.removeItem("selectedPlan");
        window.localStorage.removeItem("businessFAQ");
      } catch (e) {
        // If localStorage is unavailable or throws (e.g., in private mode), fail silently
        // This keeps the landing page resilient.
        // eslint-disable-next-line no-console
        console.warn("Could not clear onboarding keys from localStorage", e);
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
        navigate("/new-onboarding", {
          state: { businessName: businessName.trim() },
        });
        console.log('✅ Navigation called');
      } else {
        console.log('❌ Business name is empty, not navigating');
      }
    },
    [businessName, navigate]
  );

  // Props to pass to components that need them
  const heroProps = {
    businessName,
    handleInputChange,
    handleSubmit,
  };

  const finalCTAProps = {
    businessName,
    handleInputChange,
    handleSubmit,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Hero {...heroProps} />
      {/*<SocialProof />
      <Problem />
      <Solution /> */}
      {/* <Features />
      <HowItWorks />
      <Industries />
      <Testimonials />
      <Pricing />
      <TrustSecurity />
      <FAQ />
      <Coverage />
      <FinalCTA {...finalCTAProps} />
      <Footer /> */}
    </div>
  );
};

export default LandingPage;

// // pages/LandingPage.tsx
// import { useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";

// // Import all landing page sections
// import Header from "../components/landing/Header";
// import Hero from "../components/landing/Hero";
// // import SocialProof from '../components/landing/SocialProof'
// // import Problem from '../components/landing/Problem'
// // import Solution from '../components/landing/Solution'
// // import Features from '../components/landing/Features'
// // import HowItWorks from '../components/landing/HowItWorks'
// // import Industries from '../components/landing/Industries'
// // import Testimonials from '../components/landing/Testimonials'
// // import Pricing from '../components/landing/Pricing'
// // import TrustSecurity from '../components/landing/TrustSecurity'
// // import FAQ from '../components/landing/FAQ'
// // import Coverage from '../components/landing/Coverage'
// // import FinalCTA from '../components/landing/FinalCTA'
// // import Footer from '../components/landing/Footer'

// const LandingPage = () => {
//   const [businessName, setBusinessName] = useState("");
//   const navigate = useNavigate();

//   const handleInputChange = useCallback((value: string) => {
//     setBusinessName(value);
//   }, []);

//   const handleSubmit = useCallback(
//     (e: React.FormEvent) => {
//       e.preventDefault();
//       if (businessName.trim()) {
//         navigate("/new-onboarding", {
//           state: { businessName: businessName.trim() },
//         });
//       }
//     },
//     [businessName, navigate]
//   );

//   // Props to pass to components that need them
//   const heroProps = {
//     businessName,
//     handleInputChange,
//     handleSubmit,
//   };

//   const finalCTAProps = {
//     businessName,
//     handleInputChange,
//     handleSubmit,
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//       <Hero {...heroProps} />
//       {/*<SocialProof />
//       <Problem />
//       <Solution /> */}
//       {/* <Features />
//       <HowItWorks />
//       <Industries />
//       <Testimonials />
//       <Pricing />
//       <TrustSecurity />
//       <FAQ />
//       <Coverage />
//       <FinalCTA {...finalCTAProps} />
//       <Footer /> */}
//     </div>
//   );
// };

// export default LandingPage;

// import { useState, useCallback } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { motion } from 'framer-motion'
// import { SignInButton } from '@clerk/clerk-react'

// const LandingPage = () => {
//   const [businessName, setBusinessName] = useState('')
//   const navigate = useNavigate()

//   const handleInputChange = useCallback((value: string) => {
//     setBusinessName(value)
//   }, [])

//   const handleSubmit = useCallback((e: React.FormEvent) => {
//   e.preventDefault()
//   if (businessName.trim()) {
//     // Pass business name as state to new onboarding
//     navigate('/new-onboarding', {
//       state: { businessName: businessName.trim() }
//     })
//   }
// }, [businessName, navigate])

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//       {/* Header/Navbar */}
//       <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div className="flex items-center">
//               <h1 className="text-2xl font-bold text-slate-900">
//                 Ask<span className="text-emerald-600">Johnny</span>
//               </h1>
//             </div>
//             <div className="flex items-center space-x-4">
//               <SignInButton mode="modal">
//                 <button className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
//                   Login
//                 </button>
//               </SignInButton>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <div className="flex items-center justify-center px-4 py-12">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="max-w-4xl mx-auto text-center"
//         >
//           {/* Logo/Brand */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.2, duration: 0.5 }}
//             className="mb-8"
//           >
//             <h1 className="text-6xl font-bold text-slate-900 mb-4">
//               Ask<span className="text-emerald-600">Johnny</span>
//             </h1>
//             <p className="text-xl text-slate-600 max-w-2xl mx-auto">
//               Create your own AI-powered calling agent in minutes. Never miss a call again.
//             </p>
//           </motion.div>

//           {/* Hero Input */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4, duration: 0.6 }}
//             className="mb-12"
//           >
//             <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
//               <div className="relative">
//                 <input
//                   type="text"
//                   value={businessName}
//                   onChange={(e) => handleInputChange(e.target.value)}
//                   placeholder="Enter your business name..."
//                   className="w-full px-6 py-4 text-lg border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-white shadow-sm"
//                   autoFocus
//                 />
//                 <button
//                   type="submit"
//                   disabled={!businessName.trim()}
//                   className="absolute right-2 top-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
//                 >
//                   Get Started
//                 </button>
//               </div>
//             </form>
//           </motion.div>

//           {/* Features */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6, duration: 0.6 }}
//             className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
//           >
//             <div className="text-center">
//               <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                 </svg>
//               </div>
//               <h3 className="text-lg font-semibold text-slate-900 mb-2">24/7 Call Handling</h3>
//               <p className="text-slate-600">Your AI agent answers calls anytime, never missing important opportunities.</p>
//             </div>

//             <div className="text-center">
//               <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                 </svg>
//               </div>
//               <h3 className="text-lg font-semibold text-slate-900 mb-2">Smart Scheduling</h3>
//               <p className="text-slate-600">Automatically schedule appointments and manage your calendar seamlessly.</p>
//             </div>

//             <div className="text-center">
//               <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                 </svg>
//               </div>
//               <h3 className="text-lg font-semibold text-slate-900 mb-2">Analytics & Insights</h3>
//               <p className="text-slate-600">Track call performance and get insights to improve your business.</p>
//             </div>
//           </motion.div>
//         </motion.div>
//       </div>
//     </div>
//   )
// }

// export default LandingPage
