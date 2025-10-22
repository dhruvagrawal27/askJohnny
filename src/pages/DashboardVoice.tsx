import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Volume2, 
  Search, 
  Check,
  User,
  Globe
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { fetchUserByClerkId } from "../lib/dataService";

export const DashboardVoices: React.FC = () => {
  const [selectedVoice, setSelectedVoice] = useState<{provider: string, voiceId: string} | null>(null);
  const [currentVoice, setCurrentVoice] = useState<{provider: string, voiceId: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProvider, setActiveProvider] = useState<string>("all");
  const [agentId, setAgentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [shuffledVoices, setShuffledVoices] = useState<any[]>([]);
  const [isLoadingCurrentVoice, setIsLoadingCurrentVoice] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { isLoaded, isSignedIn, user } = useUser();

  // Fetch agent ID and current voice from backend
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoaded || !isSignedIn || !user) return;
      try {
        const data = await fetchUserByClerkId(user.id);
        const fetchedAgentId = (data as any)?.agent_id ?? null;
        setAgentId(fetchedAgentId);
        
        // Fetch current voice from VAPI
        if (fetchedAgentId) {
          await fetchCurrentVoice(fetchedAgentId);
        }
      } catch (e) {
        console.error("Error fetching user data:", e);
        setIsLoadingCurrentVoice(false);
      }
    };
    fetchUserData();
  }, [isLoaded, isSignedIn, user]);

  // Fetch current voice from VAPI API
  const fetchCurrentVoice = async (agentId: string) => {
    try {
      const response = await fetch(`https://api.vapi.ai/assistant/${agentId}`, {
        headers: {
          'Authorization': 'Bearer 2ca41e10-bb46-49ea-9cb0-9aec5dd8c8c3'
        }
      });
      
      if (response.ok) {
        const agentData = await response.json();
        const voice = agentData.voice;
        
        if (voice) {
          // Determine provider and voice ID from VAPI response
          let provider = "vapi";
          let voiceId = voice.voiceId || voice.provider;
          
          // Check if it's 11Labs voice
          if (voice.provider === "11labs" || voice.voice?.provider === "11labs") {
            provider = "11labs";
            voiceId = voice.voice?.voiceId || voice.voiceId;
          }
          
          setCurrentVoice({ provider, voiceId });
        }
      }
    } catch (error) {
      console.error("Error fetching current voice:", error);
    } finally {
      setIsLoadingCurrentVoice(false);
    }
  };

  // Initialize shuffled voices once
  useEffect(() => {
    const allVoices = [
      ...vapiVoices.map(voice => ({ ...voice, provider: "vapi" })),
      ...elevenLabsVoices.map(voice => ({ ...voice, provider: "11labs" }))
    ];
    setShuffledVoices(shuffleArray(allVoices));
  }, []);

  // Vapi voices data
  const vapiVoices = [
    {
      id: "cole",
      name: "Cole",
      description: "22 year old white male with deeper tone, calming and professional voice",
      characteristics: ["Deeper tone", "Calming", "Professional"],
      gender: "Male",
      age: "22",
      accent: "American"
    },
    {
      id: "harry",
      name: "Harry", 
      description: "24 year old white male with professional, clear, energetic voice",
      characteristics: ["Professional", "Clear", "Energetic", "Professional"],
      gender: "Male", 
      age: "24",
      accent: "American"
    },
    {
      id: "spencer",
      name: "Spencer",
      description: "26 year old female with energetic, quippy, lighthearted personality",
      characteristics: ["Energetic", "Quippy", "Lighthearted", "Cheeky", "Amused"],
      gender: "Female",
      age: "26", 
      accent: "American"
    },
    {
      id: "neha",
      name: "Neha",
      description: "30 year old Indian female with professional and charming voice",
      characteristics: ["Professional", "Charming"],
      gender: "Female",
      age: "30",
      accent: "Indian"
    },
    {
      id: "kylie", 
      name: "Kylie",
      description: "23 year old American female voice",
      characteristics: ["Young", "American"],
      gender: "Female",
      age: "23",
      accent: "American"
    },
    {
      id: "savannah",
      name: "Savannah", 
      description: "25 year old American female with distinctive Southern accent",
      characteristics: ["Southern accent", "American"],
      gender: "Female",
      age: "25",
      accent: "American Southern"
    },
    {
      id: "paige",
      name: "Paige",
      description: "26 year old white female with deeper tone, calming and professional",
      characteristics: ["Deeper tone", "Calming", "Professional"],
      gender: "Female", 
      age: "26",
      accent: "American"
    },
    {
      id: "rohan",
      name: "Rohan",
      description: "24 year old Indian American male with bright, optimistic energy",
      characteristics: ["Bright", "Optimistic", "Cheerful", "Energetic"],
      gender: "Male",
      age: "24", 
      accent: "Indian American"
    },
    {
      id: "hana",
      name: "Hana",
      description: "22 year old Asian female with soft, soothing and gentle voice",
      characteristics: ["Soft", "Soothing", "Gentle"],
      gender: "Female",
      age: "22",
      accent: "Asian"
    },
    {
      id: "elliot",
      name: "Elliot", 
      description: "25 year old Canadian male with soothing, friendly and professional tone",
      characteristics: ["Soothing", "Friendly", "Professional"],
      gender: "Male",
      age: "25",
      accent: "Canadian"
    }
  ];

  // 11Labs voices data (deduplicated with friendly names)
  const elevenLabsVoices = [
    {
      voice_id: "9BWtsMINqrJLrRacOk9x",
      name: "Maya",
      labels: { accent: "american", descriptive: "husky", age: "middle_aged", gender: "female", language: "en", use_case: "informative_educational" },
      description: "A middle-aged female with an African-American accent. Calm with a hint of rasp.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/9BWtsMINqrJLrRacOk9x/405766b8-1f4e-4d3c-aba1-6f25333823ec.mp3"
    },
    {
      voice_id: "CwhRBWXzGAHq8TQ4Fs17",
      name: "Marcus",
      labels: { accent: "american", descriptive: "classy", age: "middle_aged", gender: "male", language: "en", use_case: "conversational" },
      description: "Easy going and perfect for casual conversations.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/CwhRBWXzGAHq8TQ4Fs17/58ee3ff5-f6f2-4628-93b8-e38eb31806b0.mp3"
    },
    {
      voice_id: "EXAVITQu4vr4xnSDxMaL",
      name: "Emma",
      labels: { accent: "american", descriptive: "professional", age: "young", gender: "female", language: "en", use_case: "entertainment_tv" },
      description: "Young adult woman with a confident and warm, mature quality and a reassuring, professional tone.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/01a3e33c-6e99-4ee7-8543-ff2216a32186.mp3"
    },
    {
      voice_id: "FGY2WhTYpPnrIDTdsKH5",
      name: "Zoe", 
      labels: { accent: "american", descriptive: "sassy", age: "young", gender: "female", language: "en", use_case: "social_media" },
      description: "This young adult female voice delivers sunny enthusiasm with a quirky attitude.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/FGY2WhTYpPnrIDTdsKH5/67341759-ad08-41a5-be6e-de12fe448618.mp3"
    },
    {
      voice_id: "IKne3meq5aSn9XLyUdCD",
      name: "Jake",
      labels: { accent: "australian", descriptive: "hyped", age: "young", gender: "male", language: "en", use_case: "conversational" },
      description: "A young Australian male with a confident and energetic voice.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/IKne3meq5aSn9XLyUdCD/102de6f2-22ed-43e0-a1f1-111fa75c5481.mp3"
    },
    {
      voice_id: "JBFqnCBsd6RMkjVDRZzb",
      name: "Oliver",
      labels: { accent: "british", descriptive: "mature", age: "middle_aged", gender: "male", language: "en", use_case: "narrative_story" },
      description: "Warm resonance that instantly captivates listeners.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/JBFqnCBsd6RMkjVDRZzb/e6206d1a-0721-4787-aafb-06a6e705cac5.mp3"
    },
    {
      voice_id: "N2lVS1w4EtoT3dr4eOWO",
      name: "Victor",
      labels: { accent: "", age: "middle_aged", language: "en", gender: "male", use_case: "characters" },
      description: "Deceptively gravelly, yet unsettling edge.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/N2lVS1w4EtoT3dr4eOWO/ac833bd8-ffda-4938-9ebc-b0f99ca25481.mp3"
    },
    {
      voice_id: "SAz9YHcvj6GT2YYXdXww",
      name: "Alex",
      labels: { accent: "american", descriptive: "calm", age: "middle_aged", gender: "neutral", language: "en", use_case: "conversational" },
      description: "A relaxed, neutral voice ready for narrations or conversational projects.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/SAz9YHcvj6GT2YYXdXww/e6c95f0b-2227-491a-b3d7-2249240decb7.mp3"
    },
    {
      voice_id: "TX3LPaxmHKxFdv7VOQHJ",
      name: "Ryan",
      labels: { accent: "american", descriptive: "confident", age: "young", gender: "male", language: "en", use_case: "social_media" },
      description: "A young adult with energy and warmth - suitable for reels and shorts.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/TX3LPaxmHKxFdv7VOQHJ/63148076-6363-42db-aea8-31424308b92c.mp3"
    },
    {
      voice_id: "XB0fDUnXU5powFXDhCwa",
      name: "Luna",
      labels: { accent: "swedish", descriptive: "relaxed", age: "young", gender: "female", language: "en", use_case: "characters_animation" },
      description: "Sensual and raspy, she's ready to voice your temptress in video games.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/XB0fDUnXU5powFXDhCwa/942356dc-f10d-4d89-bda5-4f8505ee038b.mp3"
    },
    {
      voice_id: "Xb7hH8MSUJpSbSDYk0k2",
      name: "Charlotte",
      labels: { accent: "british", descriptive: "professional", age: "middle_aged", gender: "female", language: "en", use_case: "advertisement" },
      description: "Clear and engaging, friendly woman with a British accent suitable for e-learning.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/Xb7hH8MSUJpSbSDYk0k2/d10f7534-11f6-41fe-a012-2de1e482d336.mp3"
    },
    {
      voice_id: "XrExE9yKIg1WjnnlVkGX",
      name: "Sofia",
      labels: { accent: "american", descriptive: "upbeat", age: "middle_aged", gender: "female", language: "en", use_case: "informative_educational" },
      description: "A professional woman with a pleasing alto pitch. Suitable for many use cases.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/XrExE9yKIg1WjnnlVkGX/b930e18d-6b4d-466e-bab2-0ae97c6d8535.mp3"
    },
    {
      voice_id: "bIHbv24MWmeRgasZH58o",
      name: "Ethan",
      labels: { accent: "american", descriptive: "chill", age: "young", gender: "male", language: "en", use_case: "conversational" },
      description: "Conversational and laid back.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/bIHbv24MWmeRgasZH58o/8caf8f3d-ad29-4980-af41-53f20c72d7a4.mp3"
    },
    {
      voice_id: "cgSgspJ2msm6clMCkdW9",
      name: "Chloe",
      labels: { accent: "american", descriptive: "cute", age: "young", gender: "female", language: "en", use_case: "conversational" },
      description: "Young and popular, this playful American female voice is perfect for trendy content.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/cgSgspJ2msm6clMCkdW9/56a97bf8-b69b-448f-846c-c3a11683d45a.mp3"
    },
    {
      voice_id: "cjVigY5qzO86Huf0OWal",
      name: "James",
      labels: { accent: "american", descriptive: "classy", age: "middle_aged", gender: "male", language: "en", use_case: "conversational" },
      description: "A smooth tenor pitch from a man in his 40s - perfect for agentic use cases.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/cjVigY5qzO86Huf0OWal/d098fda0-6456-4030-b3d8-63aa048c9070.mp3"
    },
    {
      voice_id: "iP95p4xoKVk53GoZ742B",
      name: "Daniel",
      labels: { accent: "american", descriptive: "casual", age: "middle_aged", gender: "male", language: "en", use_case: "conversational" },
      description: "Natural and real, this down-to-earth voice is great across many use-cases.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/iP95p4xoKVk53GoZ742B/3f4bde72-cc48-40dd-829f-57fbf906f4d7.mp3"
    },
    {
      voice_id: "nPczCjzI2devNBz1zQrb",
      name: "Michael",
      labels: { accent: "american", descriptive: "classy", age: "middle_aged", gender: "male", language: "en", use_case: "social_media" },
      description: "Middle-aged man with a resonant and comforting tone. Great for narrations and advertisements.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/nPczCjzI2devNBz1zQrb/2dd3e72c-4fd3-42f1-93ea-abc5d4e5aa1d.mp3"
    },
    {
      voice_id: "onwK4e9ZLuTAKqWW03F9",
      name: "William",
      labels: { accent: "british", descriptive: "formal", age: "middle_aged", gender: "male", language: "en", use_case: "informative_educational" },
      description: "A strong voice perfect for delivering a professional broadcast or news story.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/onwK4e9ZLuTAKqWW03F9/7eee0236-1a72-4b86-b303-5dcadc007ba9.mp3"
    },
    {
      voice_id: "pFZP5JQG7iQjIQuC4Bku",
      name: "Victoria",
      labels: { accent: "british", descriptive: "confident", gender: "female", age: "middle_aged", use_case: "narration" },
      description: "Velvety British female voice delivers news and narrations with warmth and clarity.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/pFZP5JQG7iQjIQuC4Bku/89b68b35-b3dd-4348-a84a-a3c13a3c2b30.mp3"
    },
    {
      voice_id: "pqHfZKP75CvOlQylNhV4",
      name: "George",
      labels: { accent: "american", descriptive: "crisp", age: "old", gender: "male", language: "en", use_case: "advertisement" },
      description: "Friendly and comforting voice ready to narrate your stories.",
      preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/pqHfZKP75CvOlQylNhV4/d782b3ff-84ba-4029-848c-acf01285524d.mp3"
    }
  ];

  // Audio controls
  const playAudio = (url: string, voiceId: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      return;
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingVoice(voiceId);
    
    audio.onended = () => setPlayingVoice(null);
    audio.onerror = () => setPlayingVoice(null);
    audio.play();
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingVoice(null);
    }
  };

  // Shuffle function to randomize voice order
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Filter voices based on search and provider
  const getFilteredVoices = () => {
    const query = searchQuery.toLowerCase();
    
    return shuffledVoices.filter(voice => {
      // Provider filter
      if (activeProvider !== "all" && voice.provider !== activeProvider) {
        return false;
      }
      
      // Search filter
      if (query) {
        if (voice.provider === "vapi") {
          return voice.name.toLowerCase().includes(query) ||
                 voice.description.toLowerCase().includes(query) ||
                 voice.characteristics.some((char: string) => char.toLowerCase().includes(query));
        } else {
          return voice.name.toLowerCase().includes(query) ||
                 voice.voice_id.toLowerCase().includes(query) ||
                 voice.description.toLowerCase().includes(query) ||
                 voice.labels.accent.toLowerCase().includes(query) ||
                 voice.labels.descriptive.toLowerCase().includes(query);
        }
      }
      
      return true;
    });
  };

  // Save voice selection
  const saveVoiceSelection = async () => {
    if (!selectedVoice || !agentId) {
      alert("Please select a voice and ensure you're signed in.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("https://dhruvthc.app.n8n.cloud/webhook/voice-change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: selectedVoice.provider,
          voiceId: selectedVoice.voiceId,
          agentId: agentId
        }),
      });

      if (response.ok) {
        setSuccessMessage("Voice successfully updated!");
        setCurrentVoice(selectedVoice); // Update current voice after successful save
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error("Failed to update voice");
      }
    } catch (error) {
      console.error("Error saving voice:", error);
      alert("Failed to save voice selection. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredVoices = getFilteredVoices();

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Voice Selection</h1>
        <p className="text-muted-foreground mt-1">
          Choose the perfect voice for your AI assistant from our curated collection of professional voices.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search voices by name, accent, or style..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Provider:</span>
          <div className="flex gap-2">
            <Button
              variant={activeProvider === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveProvider("all")}
            >
              All
            </Button>
            <Button
              variant={activeProvider === "vapi" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveProvider("vapi")}
            >
              Vapi
            </Button>
            <Button
              variant={activeProvider === "11labs" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveProvider("11labs")}
            >
              11Labs
            </Button>
          </div>
        </div>
      </div>

      {/* Voice Selection */}
      {selectedVoice && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    Voice Selected: {selectedVoice.provider === "vapi" 
                      ? vapiVoices.find(v => v.name === selectedVoice.voiceId)?.name
                      : elevenLabsVoices.find(v => v.voice_id === selectedVoice.voiceId)?.name
                    }
                  </p>
                  <p className="text-sm text-green-700">
                    Provider: {selectedVoice.provider === "11labs" ? "11Labs" : "Vapi"}
                  </p>
                </div>
              </div>
              <Button 
                onClick={saveVoiceSelection}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? "Saving..." : "Save Voice"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingCurrentVoice ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading voice preferences...</p>
            </div>
          </div>
        ) : (
          filteredVoices.map((voice) => {
            const isVapi = voice.provider === "vapi";
            const voiceId = isVapi ? voice.name : voice.voice_id;
            const displayName = isVapi ? voice.name : voice.name;
            const isSelected = selectedVoice?.provider === voice.provider && selectedVoice?.voiceId === voiceId;
            const isCurrent = currentVoice?.provider === voice.provider && 
                            (currentVoice?.voiceId === voiceId || 
                             currentVoice?.voiceId === voice.name || 
                             currentVoice?.voiceId === voice.id);
            const isPlaying = playingVoice === voiceId;

          return (
            <Card 
              key={`${voice.provider}-${voiceId}`}
              className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
                isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => setSelectedVoice({ provider: voice.provider, voiceId })}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {displayName}
                        {isCurrent && (
                          <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {voice.provider === "11labs" ? "11Labs" : "Vapi"}
                        </Badge>
                        {isVapi ? (
                          <Badge variant="outline" className="text-xs">
                            {voice.gender} • {voice.age}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {voice.labels.gender} • {voice.labels.age}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Play/Pause Button */}
                  <div className="flex items-center gap-2">
                    {!isVapi && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPlaying) {
                            stopAudio();
                          } else {
                            playAudio(voice.preview_url, voiceId);
                          }
                        }}
                        className="w-10 h-10 p-0"
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {isSelected && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">
                  {voice.description}
                </p>

                {/* Voice Characteristics */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Accent:</span>
                    <span>{isVapi ? voice.accent : voice.labels.accent || "Standard"}</span>
                  </div>
                  
                  {isVapi ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {voice.characteristics.map((char, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {char}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {voice.labels.descriptive}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {voice.labels.accent} accent
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {voice.labels.use_case}
                      </Badge>
                    </div>
                  )}
                </div>

                {isVapi && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800 flex items-center gap-1">
                      <Volume2 className="h-3 w-3" />
                      Preview not available for Vapi voices
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            );
          })
        )}
      </div>      {filteredVoices.length === 0 && !isLoadingCurrentVoice && (
        <Card>
          <CardContent className="p-8 text-center">
            <Volume2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No voices found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or provider filters.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            {successMessage}
          </div>
        </div>
      )}

      {/* About Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Volume2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">
                Premium Voice Technology
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                All voices support multiple languages and deliver natural, engaging conversations.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span>Multi-language support</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-500" />
                  <span>Natural conversation flow</span>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-purple-500" />
                  <span>High-quality audio</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>Real-time processing</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
