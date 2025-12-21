import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Sparkles, ArrowLeft } from 'lucide-react';
import { StepProps } from './types';
import { StepHeader, ContentContainer } from './SharedComponents';

const StepOneB: React.FC<StepProps> = ({ state, setState, handleNext, handleBack }) => {
  const [playingDemo, setPlayingDemo] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ [key: string]: number }>({
    welcome: 0,
    business: 0
  });
  const [isSupported, setIsSupported] = useState(true);
  
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const businessName = state.businessDetails?.name || state.businessName || 'your business';

  // Demo configurations
  const demos = [
    {
      id: 'welcome',
      title: 'Welcome Message',
      description: 'How Johnny will greet your customers',
      duration: '00:10',
      text: `Hello! Thank you for calling ${businessName}. My name is Johnny, and I'm here to assist you today. How may I help you?`,
      color: 'from-blue-500 to-blue-600',
      rate: 0.9,
      pitch: 1.0
    },
    {
      id: 'business',
      title: 'Business Information',
      description: 'How Johnny will interact with your customers',
      duration: '00:15',
      text: `Welcome to ${businessName}. We're currently available to help you with your questions. Whether you need information about our services, want to schedule an appointment, or have any other inquiry, I'm here to assist you.`,
      color: 'from-purple-500 to-purple-600',
      rate: 0.9,
      pitch: 1.0
    }
  ];

  // Check if speech synthesis is supported and preload voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      console.warn('Speech Synthesis not supported in this browser');
    } else {
      // Preload voices - some browsers need this
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);
      };
      
      // Load voices immediately if available
      loadVoices();
      
      // Also listen for voiceschanged event (needed for some browsers)
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const togglePlay = (demoId: string) => {
    if (!isSupported) {
      alert('Speech synthesis is not supported in your browser. Please try Chrome, Safari, or Edge.');
      return;
    }

    const demo = demos.find(d => d.id === demoId);
    if (!demo) return;

    // If already playing this demo, stop it
    if (playingDemo === demoId) {
      window.speechSynthesis.cancel();
      setPlayingDemo(null);
      setProgress(prev => ({ ...prev, [demoId]: 0 }));
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      return;
    }

    // Stop any currently playing demo
    if (playingDemo) {
      window.speechSynthesis.cancel();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    // Create new speech utterance
    const utterance = new SpeechSynthesisUtterance(demo.text);
    
    // Select the best quality natural MALE voice available
    const voices = window.speechSynthesis.getVoices();
    
    // Priority order for natural-sounding male voices:
    // 1. Google male voices (highest quality)
    // 2. Microsoft male voices (good quality)
    // 3. Apple male voices (good quality on Safari)
    // 4. Any local English male voice
    const preferredVoice = 
      // Try Google UK English Male (best quality male voice)
      voices.find(voice => 
        voice.lang.startsWith('en') && 
        voice.name.includes('Google UK English Male')
      ) ||
      // Try other Google male voices
      voices.find(voice => 
        voice.lang.startsWith('en') && 
        voice.name.includes('Male') &&
        voice.name.includes('Google')
      ) ||
      // Try Microsoft male voices (David, Mark)
      voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('David') || voice.name.includes('Mark'))
      ) ||
      // Try Microsoft Natural male
      voices.find(voice => 
        voice.lang.startsWith('en') && 
        voice.name.includes('Natural') &&
        voice.name.toLowerCase().includes('male')
      ) ||
      // Try Apple male voices (Alex is male on Safari)
      voices.find(voice => 
        voice.lang.startsWith('en') && 
        voice.name.includes('Alex')
      ) ||
      // Fallback to any voice with "Male" in name
      voices.find(voice => 
        voice.lang.startsWith('en') && 
        voice.name.toLowerCase().includes('male')
      ) ||
      // Last resort: any English voice
      voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log('Using voice:', preferredVoice.name);
    }
    
    // Optimized speech parameters for natural sound
    utterance.rate = 0.95; // Slightly slower than normal for clarity
    utterance.pitch = 1.0; // Natural pitch
    utterance.volume = 1;

    // Event handlers
    utterance.onstart = () => {
      setPlayingDemo(demoId);
      setProgress(prev => ({ ...prev, [demoId]: 0 }));
      
      // Estimate duration based on text length and rate
      const estimatedDuration = (demo.text.length / 15) * 1000 / demo.rate; // rough estimate
      const updateInterval = estimatedDuration / 100;
      
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev[demoId] + 1, 99);
          return { ...prev, [demoId]: newProgress };
        });
      }, updateInterval);
    };

    utterance.onend = () => {
      setPlayingDemo(null);
      setProgress(prev => ({ ...prev, [demoId]: 100 }));
      setTimeout(() => {
        setProgress(prev => ({ ...prev, [demoId]: 0 }));
      }, 500);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setPlayingDemo(null);
      setProgress(prev => ({ ...prev, [demoId]: 0 }));
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };

    speechRef.current = utterance;
    
    // Small delay to ensure voices are loaded
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  return (
    <div className="w-full h-full flex flex-col px-4 lg:px-6 py-3 overflow-hidden">
      <StepHeader 
        step="01B" 
        title="Preview Johnny's Voice"
        subtitle="Listen to how Johnny will sound when interacting with your customers."
        onBack={handleBack}
        showBack={true}
      />

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Voice Options */}
        <div className="flex-1 flex flex-col min-h-0 lg:w-[45%]">
          <div className="h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-br from-brand-50 to-purple-50 p-4 border-b border-brand-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                  <Volume2 size={20} className="text-brand-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Voice Previews</h3>
                  <p className="text-xs text-gray-600">Select a sample to hear Johnny</p>
                </div>
              </div>
            </div>

            {/* Voice Demo List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {demos.map((demo, index) => (
                <div 
                  key={demo.id}
                  className={`group relative rounded-xl p-5 border transition-all cursor-pointer overflow-hidden ${
                    playingDemo === demo.id 
                      ? 'border-brand-400 bg-gradient-to-br from-brand-50 via-purple-50 to-brand-50 ring-2 ring-brand-200 shadow-lg shadow-brand-100' 
                      : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-md hover:bg-gradient-to-br hover:from-gray-50 hover:to-brand-50/30'
                  }`}
                  onClick={() => togglePlay(demo.id)}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-400 to-purple-400 rounded-full blur-3xl transform translate-x-16 -translate-y-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-brand-300 to-purple-300 rounded-full blur-2xl transform -translate-x-12 translate-y-12"></div>
                  </div>

                  <div className="relative flex items-center gap-4">
                    {/* Play Button with Glow */}
                    <div className="relative">
                      {playingDemo === demo.id && (
                        <div className="absolute inset-0 rounded-full bg-brand-400 opacity-30 animate-ping"></div>
                      )}
                      <button
                        disabled={!isSupported}
                        className={`relative w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-lg ${
                          playingDemo === demo.id 
                            ? 'bg-gradient-to-br from-brand-500 to-brand-600 shadow-brand-300 scale-110' 
                            : 'bg-gradient-to-br from-brand-500 to-brand-600 shadow-brand-200 group-hover:scale-105'
                        } ${!isSupported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}`}
                      >
                        {playingDemo === demo.id ? (
                          <Pause size={18} className="text-white drop-shadow" />
                        ) : (
                          <Play size={18} className="text-white ml-0.5 drop-shadow" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="text-base font-bold text-gray-900">{demo.title}</h4>
                        <span className="text-xs font-semibold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full flex-shrink-0">
                          {demo.duration}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{demo.description}</p>
                    </div>

                    {/* Status Indicator */}
                    {playingDemo === demo.id && (
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1 bg-brand-600 text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-lg">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                          Playing
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div className="mt-4 relative">
                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full transition-all duration-100 rounded-full ${
                          playingDemo === demo.id 
                            ? 'bg-gradient-to-r from-brand-500 via-brand-600 to-purple-600' 
                            : 'bg-gray-300'
                        }`}
                        style={{ width: `${progress[demo.id] || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Hover Accent Line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 ${
                    playingDemo === demo.id 
                      ? 'bg-gradient-to-r from-brand-500 via-purple-500 to-brand-500' 
                      : 'bg-transparent group-hover:bg-gradient-to-r group-hover:from-brand-300 group-hover:to-purple-300'
                  }`}></div>
                </div>
              ))}

              {/* Personalized Voice Info Card */}
              <div className="bg-gradient-to-br from-brand-50 via-purple-50 to-brand-50 rounded-xl p-5 border border-brand-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-300/50">
                    <Volume2 size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 mb-2">Personalized Voice</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Johnny's voice has been trained with your business information to sound natural and professional.
                    </p>
                  </div>
                </div>
              </div>

              {!isSupported && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-700 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Voice preview requires Chrome, Safari, or Edge browser
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Animated Orb */}
        <div className="flex-1 flex flex-col min-h-0 lg:w-[55%]">
          <div className="h-full bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Orb Container */}
            <div className="flex-1 flex items-center justify-center p-8 relative">
              
              {/* Animated Orb */}
              <div className="relative">
                {/* Outer glow rings */}
                {playingDemo && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-brand-400 opacity-20 animate-ping" style={{ animationDuration: '2s' }}></div>
                    <div className="absolute inset-0 rounded-full bg-purple-400 opacity-20 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }}></div>
                  </>
                )}
                
                {/* Main Orb */}
                <div className={`relative w-48 h-48 rounded-full transition-all duration-500 ${
                  playingDemo 
                    ? 'bg-gradient-to-br from-brand-400 via-brand-500 to-purple-600 shadow-2xl shadow-brand-500/50 scale-110' 
                    : 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 shadow-lg'
                }`}>
                  
                  {/* Inner glow effect */}
                  <div className={`absolute inset-4 rounded-full transition-all duration-500 ${
                    playingDemo 
                      ? 'bg-gradient-to-br from-white/30 to-transparent animate-pulse' 
                      : 'bg-gradient-to-br from-white/20 to-transparent'
                  }`}></div>
                  
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {playingDemo ? (
                      <div className="relative">
                        <Volume2 size={64} className="text-white drop-shadow-lg animate-pulse" />
                        {/* Sound waves */}
                        <div className="absolute -left-20 top-1/2 -translate-y-1/2">
                          <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className="w-1 bg-white rounded-full animate-soundWave"
                                style={{
                                  height: '32px',
                                  animationDelay: `${i * 0.15}s`,
                                  animationDuration: '0.8s'
                                }}
                              ></div>
                            ))}
                          </div>
                        </div>
                        <div className="absolute -right-20 top-1/2 -translate-y-1/2">
                          <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className="w-1 bg-white rounded-full animate-soundWave"
                                style={{
                                  height: '32px',
                                  animationDelay: `${i * 0.15}s`,
                                  animationDuration: '0.8s'
                                }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Volume2 size={64} className="text-gray-400" />
                    )}
                  </div>
                  
                  {/* Rotating gradient overlay */}
                  {playingDemo && (
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Text */}
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <p className={`text-sm font-bold transition-all duration-300 ${
                  playingDemo ? 'text-brand-600 animate-pulse' : 'text-gray-400'
                }`}>
                  {playingDemo ? ' Johnny is Speaking...' : 'Select a voice preview'}
                </p>
                {playingDemo && (
                  <p className="text-xs text-gray-500 mt-1">Personalized for {businessName}</p>
                )}
              </div>
            </div>

            {/* Continue Button - Fixed at bottom */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <button 
                onClick={handleNext}
                className="w-full btn-primary-custom py-3 font-bold text-sm rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg"
              >
                Continue <ArrowLeft size={16} className="rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepOneB;
