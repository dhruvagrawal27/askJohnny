import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// ...existing code...
import { Mic, Volume2, User, Heart, Sparkles } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { fetchUserByClerkId, setDefaultVoice } from "../lib/dataService";
import type { UserData } from "@/types";

export const DashboardVoices: React.FC = () => {
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [agentId, setAgentId] = useState<string | number | null>(null);
  const { isLoaded, isSignedIn, user } = useUser();
  const [isSetting, setIsSetting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // fetch agent id from backend using Clerk user id
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoaded || !isSignedIn || !user) return;
      try {
        const data = await fetchUserByClerkId(user.id);
        setAgentId((data as any)?.agent_id ?? null);
      } catch (e) {
        console.error("Error fetching user data:", e);
        // ignore - agentId stays null
        console.error("fetchUserData error", e);
      }
    };
    fetchUserData();
  }, [isLoaded, isSignedIn, user]);

  // replace with the provided flat list of voices
  const voiceData = [
    {
      data: [
        {
          id: "03909666-5ae1-473d-a27b-0229e40b1603",
          provider: "inworld",
          name: "Olivia",
          model: "inworld-tts-1",
          voice_id: "Olivia",
          accent: "",
        },
        {
          id: "072b4d87-7c97-42bb-a3a8-53654eba1df7",
          provider: "sarvam",
          name: "Manisha",
          model: "bulbul:v2",
          voice_id: "manisha",
          accent: "Indian Female Kannada",
        },
        {
          id: "0fc22fc1-6546-4d11-9957-6dbb5f8e7caf",
          provider: "sarvam",
          name: "Arya",
          model: "bulbul:v2",
          voice_id: "arya",
          accent: "Indian female bengali",
        },
        {
          id: "109ba4c4-0219-4b57-8569-bc0d90fa74ee",
          provider: "sarvam",
          name: "Abhilash",
          model: "bulbul:v2",
          voice_id: "abhilash",
          accent: "Indian Male Malayalam",
        },
        {
          id: "10c82ccc-505b-428b-8acf-1438cd0adeda",
          provider: "inworld",
          name: "Xinyi",
          model: "inworld-tts-1",
          voice_id: "Xinyi",
          accent: "",
        },
        {
          id: "151a2557-5ac2-4cd0-8c49-0475f1251b49",
          provider: "inworld",
          name: "Ronald",
          model: "inworld-tts-1",
          voice_id: "Ronald",
          accent: "",
        },
        {
          id: "15700f67-85b6-4d6f-b3d5-35912a895f5e",
          provider: "inworld",
          name: "Yoona",
          model: "inworld-tts-1",
          voice_id: "Yoona",
          accent: "",
        },
        {
          id: "171954d9-859b-4bd7-ab55-28f4e0caef4f",
          provider: "rime",
          name: "Tauro",
          model: "arcana",
          voice_id: "tauro",
          accent: "Middle Male US",
        },
        {
          id: "17657b1d-7a8b-4a2b-800b-23cd4122e787",
          provider: "sarvam",
          name: "Karun",
          model: "bulbul:v2",
          voice_id: "karun",
          accent: "Indian Male Tamil",
        },
        {
          id: "198c76e5-9862-4d4c-823b-0a034249b69d",
          provider: "sarvam",
          name: "Arya",
          model: "bulbul:v2",
          voice_id: "arya",
          accent: "Indian female telugu",
        },
        {
          id: "19be85eb-dd53-4798-a8c3-1f1a360542f4",
          provider: "sarvam",
          name: "Manisha",
          model: "bulbul:v2",
          voice_id: "manisha",
          accent: "Indian female punjabi",
        },
        {
          id: "1aa04e4c-e9c9-44ea-8aee-7c61495071f4",
          provider: "inworld",
          name: "Lennart",
          model: "inworld-tts-1",
          voice_id: "Lennart",
          accent: "",
        },
        {
          id: "1be42dcd-d5a8-4204-9c24-9ea46ea87006",
          provider: "sarvam",
          name: "Vidya",
          model: "bulbul:v2",
          voice_id: "vidya",
          accent: "Indian female bengali",
        },
        {
          id: "1d86a5dc-c372-45c1-a9d6-04dbc50a2f46",
          provider: "inworld",
          name: "Szymon",
          model: "inworld-tts-1",
          voice_id: "Szymon",
          accent: "",
        },
        {
          id: "1de60824-b8e2-4782-b11d-371be27966c3",
          provider: "inworld",
          name: "Ashley",
          model: "inworld-tts-1",
          voice_id: "Ashley",
          accent: "",
        },
        // ... (truncated for brevity) - keep only a representative subset in the UI for now
      ],
      state: "success",
    },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Voice Selection</h1>
        <p className="text-muted-foreground mt-1">
          Experiment with different voices for your AI assistant. Generate audio
          previews and set your preferred default voice.
        </p>
      </div>

      {/* Top controls: search + provider filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold">Choose a voice</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select the voice that best represents your agent's personality.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              aria-label="Search voices"
              placeholder="Search by name, accent or provider"
              className="input px-3 py-2 border rounded w-72"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute left-2 top-2 text-gray-400">🔎</span>
          </div>

          <div className="flex gap-2">
            <button className="btn-sm px-3 py-1 rounded bg-gray-100 text-sm">
              All
            </button>
            <button className="btn-sm px-3 py-1 rounded bg-white text-sm border">
              inworld
            </button>
            <button className="btn-sm px-3 py-1 rounded bg-white text-sm border">
              sarvam
            </button>
            <button className="btn-sm px-3 py-1 rounded bg-white text-sm border">
              elevenlabs
            </button>
          </div>
        </div>
      </div>

      {/* Voice Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Available Voices
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Browse and pick a voice for your agent.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* improved card UI */}
            {(() => {
              const q = searchQuery.trim().toLowerCase();
              const filtered = voiceData[0].data.filter((v) => {
                if (!q) return true;
                const hay =
                  `${v.name} ${v.provider} ${v.model} ${v.accent}`.toLowerCase();
                return hay.includes(q);
              });
              return filtered.slice(0, 30).map((v) => {
                const isSelected = selectedVoice === (v.voice_id || v.name);
                return (
                  <div
                    key={v.id}
                    className={`p-4 rounded-lg border transition-shadow hover:shadow-lg ${
                      isSelected
                        ? "ring-2 ring-indigo-300 bg-indigo-50"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                        {v.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{v.name}</div>
                            {v.accent && (
                              <div className="text-xs text-muted-foreground">
                                {v.accent}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">
                              {v.provider}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {v.model}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              className={`px-3 py-1 rounded text-sm ${
                                isSelected
                                  ? "bg-indigo-600 text-white"
                                  : "bg-gray-100"
                              }`}
                              onClick={() =>
                                setSelectedVoice(v.voice_id || v.name)
                              }
                            >
                              {isSelected ? "Selected" : "Select"}
                            </button>
                            <span className="text-xs text-muted-foreground">
                              {v.provider}
                            </span>
                          </div>

                          <Button
                            size="sm"
                            disabled={isSetting}
                            onClick={async () => {
                              setSelectedVoice(v.voice_id || v.name);
                              if (!agentId) {
                                alert(
                                  "Unable to find agent id. Please make sure you are signed in."
                                );
                                return;
                              }
                              setIsSetting(true);
                              try {
                                const result = await setDefaultVoice(agentId, {
                                  provider: v.provider,
                                  voice_id: v.voice_id || v.name,
                                  agent_id: agentId,
                                });
                                
                                if (result.success) {
                                  setSuccessMessage(
                                    `Default voice set to ${v.name}`
                                  );
                                  window.setTimeout(
                                    () => setSuccessMessage(null),
                                    3000
                                  );
                                }
                              } catch (e) {
                                console.error("set default voice error", e);
                              } finally {
                                setIsSetting(false);
                              }
                            }}
                          >
                            {isSetting ? "Setting..." : "Set as Default"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </CardContent>
      </Card>

      {successMessage && (
        <div className="fixed right-6 bottom-6 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded shadow">
          {successMessage}
        </div>
      )}

      {/* About Voice Technology */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Volume2 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                About Our Voice Technology
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Leveraging state-of-the-art AI for natural speech synthesis.
              </p>

              <p className="text-sm mb-4">
                Our premium voice technology utilizes advanced neural networks
                to generate exceptionally natural-sounding speech. It captures
                emotional nuances, appropriate emphasis, and adapts
                intelligently to various contexts, providing a seamless and
                engaging auditory experience across multiple languages.
              </p>

              <div>
                <h4 className="font-semibold mb-2">Key Capabilities:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Create engaging audio content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-blue-500" />
                    <span>Personalize your brand's voice</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-green-500" />
                    <span>Build accessible voice interfaces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 text-purple-500">🌐</span>
                    <span>Support 30+ languages fluently</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-orange-500" />
                    <span>Reach global audiences</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-pink-500" />
                    <span>Natural emotional expression</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
