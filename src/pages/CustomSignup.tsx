// src/pages/CustomSignup.tsx
import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';

const CustomSignup: React.FC = () => {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔐 CustomSignup - Auth state check:', { isLoaded, isSignedIn });
    
    if (isLoaded && isSignedIn) {
      console.log('✅ User is signed in, redirecting to setup-loading...');
      // Redirect to setup-loading after successful signup
      navigate('/setup-loading');
    } else if (isLoaded && !isSignedIn) {
      console.log('👤 User not signed in, showing signup form...');
    }
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join AskJohnny
          </h1>
          <p className="text-gray-600">
            Create your AI-powered call handling system
          </p>
        </div>

        {/* Clerk SignUp Component */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <SignUp
            appearance={{
              elements: {
                card: "bg-transparent shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-gray-50 border border-gray-200 hover:bg-gray-100",
                formButtonPrimary: "bg-purple-600 hover:bg-purple-700",
                footerActionLink: "text-purple-600 hover:text-purple-700"
              }
            }}
            redirectUrl="/setup-loading"
            afterSignUpUrl="/setup-loading"
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            By signing up, you agree to our{' '}
            <a href="#" className="text-purple-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomSignup;
