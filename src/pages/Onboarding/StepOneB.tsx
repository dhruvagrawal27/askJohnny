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
    
    // Try to find a good voice (prefer English, female/male natural voices)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.includes('en') && (voice.name.includes('Samantha') || voice.name.includes('Google US English'))
    ) || voices.find(voice => voice.lang.includes('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = demo.rate;
    utterance.pitch = demo.pitch;
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
    <ContentContainer>
      <StepHeader 
        step="01B" 
        title={`Preview Johnny for ${businessName}`}
        subtitle="Listen to how Johnny will sound when interacting with your customers. These demos are personalized with your business name."
        onBack={handleBack}
        showBack={true}
      />

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6 pb-6">
          
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-brand-50 to-purple-50 rounded-2xl p-4 border border-brand-100 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} className="text-brand-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Personalized AI Voice</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                These voice samples are customized with "<strong>{businessName}</strong>" to show you exactly how Johnny will sound to your customers. Click play to listen!
              </p>
              {!isSupported && (
                <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block">
                  ⚠️ Voice preview requires Chrome, Safari, or Edge browser
                </div>
              )}
            </div>
          </div>

          {/* Voice Demo Cards */}
          {demos.map((demo, index) => (
            <div 
              key={demo.id}
              className="relative group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Background Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 rounded-3xl blur transition duration-300"
                   style={{ background: `linear-gradient(135deg, ${demo.color.split(' ')[0].replace('from-', '')}, ${demo.color.split(' ')[1].replace('to-', '')})` }}
              ></div>
              
              <div className="relative bg-white rounded-3xl border-2 border-gray-100 p-6 transition-all duration-300 group-hover:border-brand-200 group-hover:shadow-xl">
                
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{demo.title}</h3>
                      <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                        {demo.duration}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{demo.description}</p>
                  </div>
                </div>

                {/* Waveform Visualization / Progress Bar */}
                <div className="relative h-20 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl mb-4 overflow-hidden">
                  {/* Progress Fill */}
                  <div 
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${demo.color} opacity-20 transition-all duration-100`}
                    style={{ width: `${progress[demo.id] || 0}%` }}
                  ></div>
                  
                  {/* Simulated Waveform */}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 px-4">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div 
                        key={i}
                        className={`w-1 rounded-full transition-all duration-200 ${
                          playingDemo === demo.id 
                            ? 'bg-gradient-to-t ' + demo.color 
                            : 'bg-gray-300'
                        }`}
                        style={{ 
                          height: `${Math.random() * 60 + 20}%`,
                          opacity: playingDemo === demo.id ? 0.8 : 0.4,
                          animationDelay: `${i * 50}ms`
                        }}
                      ></div>
                    ))}
                  </div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => togglePlay(demo.id)}
                      disabled={!isSupported}
                      className={`w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl ${
                        playingDemo === demo.id ? 'ring-4 ring-brand-400 ring-opacity-50' : ''
                      } ${!isSupported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      title={!isSupported ? 'Audio not supported in this browser' : playingDemo === demo.id ? 'Stop' : 'Play'}
                    >
                      {playingDemo === demo.id ? (
                        <Pause size={24} className="text-gray-900" />
                      ) : (
                        <Play size={24} className="text-gray-900 ml-1" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Sample Text */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 size={14} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sample Script</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed italic">
                    "{demo.text}"
                  </p>
                </div>

              </div>
            </div>
          ))}

          {/* Continue Button */}
          <div className="flex justify-end pt-4">
            <button 
              onClick={handleNext}
              className="btn-primary-custom px-8 py-3.5 font-bold text-sm shadow-lg shadow-brand-500/30 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 rounded-xl"
            >
              Sounds Great! Continue <ArrowLeft size={16} className="rotate-180" />
            </button>
          </div>

        </div>
      </div>
    </ContentContainer>
  );
};

export default StepOneB;
