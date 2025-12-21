import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Phone,
  Clock,
  Globe,
  FileText,
  Settings,
  Mic,
  Brain,
  Shield,
  Zap,
  Users,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  Volume2,
  MessageSquare,
  Database,
  Activity,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/clerk-react";

interface VAPIAgent {
  id: string;
  orgId: string;
  name: string;
  systemPrompt?: string;
  voice: {
    speed: number;
    voiceId: string;
    provider: string;
    cachingEnabled?: boolean;
    fallbackPlan?: {
      voices: Array<{
        voiceId: string;
        provider: string;
      }>;
    };
  };
  createdAt: string;
  updatedAt: string;
  model: {
    model: string;
    provider: string;
    maxTokens: number;
    temperature: number;
    numFastTurns?: number;
    knowledgeBase?: {
      fileIds: string[];
      provider: string;
    };
    emotionRecognitionEnabled: boolean;
    toolIds?: string[];
    messages?: any[];
  };
  forwardingPhoneNumber: string;
  firstMessage: string;
  voicemailMessage: string;
  endCallMessage: string;
  endCallFunctionEnabled: boolean;
  transcriber: {
    model: string;
    provider: string;
    language: string;
    keywords: string[];
    numerals?: boolean;
    endpointing?: number;
    confidenceThreshold?: number;
  };
  silenceTimeoutSeconds: number;
  maxDurationSeconds: number;
  backgroundSound: string;
  firstMessageMode: string;
  hipaaEnabled: boolean;
  clientMessages?: string[];
  serverMessages?: string[];
  backgroundDenoisingEnabled?: boolean;
  firstMessageInterruptionsEnabled?: boolean;
  observabilityPlan?: {
    tags: string[];
    provider: string;
  };
  analysisPlan?: {
    minMessagesThreshold: number;
    summaryPlan?: {
      messages: Array<{
        content: string;
        role: string;
      }>;
    };
    structuredDataPlan?: {
      enabled: boolean;
      messages: Array<{
        content: string;
        role: string;
      }>;
    };
    successEvaluationPlan?: {
      rubric: string;
      messages: Array<{
        content: string;
        role: string;
      }>;
    };
  };
  voicemailDetection?: {
    provider: string;
    backoffPlan?: {
      maxRetries: number;
      startAtSeconds: number;
      frequencySeconds: number;
    };
    beepMaxAwaitSeconds?: number;
  };
  artifactPlan?: {
    transcriptPlan?: {
      enabled: boolean;
      assistantName: string;
      userName: string;
    };
    recordingEnabled?: boolean;
    recordingFormat?: string;
    recordingUseCustomStorageEnabled?: boolean;
    videoRecordingEnabled?: boolean;
    loggingEnabled?: boolean;
  };
  messagePlan?: {
    idleMessages?: string[];
    idleMessageMaxSpokenCount?: number;
    idleTimeoutSeconds?: number;
  };
  transportConfigurations?: Array<{
    record: boolean;
    timeout: number;
    provider: string;
    recordingChannels: string;
  }>;
  startSpeakingPlan?: {
    waitSeconds: number;
    smartEndpointingPlan?: {
      provider: string;
    };
  };
  compliancePlan?: {
    hipaaEnabled: boolean;
    pciEnabled?: boolean;
    securityFilterPlan?: {
      enabled: boolean;
      mode: string;
      replacementText: string;
    };
  };
  keypadInputPlan?: {
    enabled: boolean;
    timeoutSeconds: number;
    delimiters: string[];
  };
  isServerUrlSecretSet?: boolean;
}

interface KnowledgeBaseFile {
  id: string;
  user_id: string;
  agent_id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  file_size_formatted: string;
  upload_date: string;
  status: string;
  error_message: string | null;
  n8n_file_id: string;
  processing_progress: number;
  created_at: string;
  updated_at: string;
  file_url: string;
}

export const DashboardAgent: React.FC = () => {
  const { user } = useUser();
  const [agent, setAgent] = useState<VAPIAgent | null>(null);
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeBaseFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAgentId, setUserAgentId] = useState<string | null>(null);

  const fetchAgentData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // First, fetch the user's agent ID from Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('agent_id')
        .eq('clerk_user_id', user.id)
        .single();

      if (userError) {
        throw new Error(`Failed to fetch user data: ${userError.message}`);
      }

      if (!userData?.agent_id) {
        throw new Error("No agent ID found for this user");
      }

      setUserAgentId(userData.agent_id);

      // Get VAPI API key from environment (correct key name)
      const apiKey = import.meta.env.VITE_VAPI_KEY;

      if (!apiKey) {
        throw new Error("VAPI API key not found in environment variables");
      }

      // Fetch agent data from VAPI API using the user's agent ID
      const response = await fetch(`https://api.vapi.ai/assistant/${userData.agent_id}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch agent data: ${response.statusText}`);
      }

      const agentData = await response.json();
      setAgent(agentData);

      // Fetch knowledge base files from Supabase if fileIds exist
      if (agentData.model?.knowledgeBase?.fileIds && agentData.model.knowledgeBase.fileIds.length > 0) {
        console.log('VAPI File IDs:', agentData.model.knowledgeBase.fileIds);
        
        // Try the main table first
        const { data: files, error: supabaseError } = await supabase
          .from('knowledge_base')
          .select('*')
          .in('n8n_file_id', agentData.model.knowledgeBase.fileIds)
          .eq('user_id', user.id);

        console.log('Main table query result:', { files, error: supabaseError });
        
        if (supabaseError || !files || files.length === 0) {
          // Try alternative table name and user filtering
          const { data: filesAlt, error: supabaseErrorAlt } = await supabase
            .from('knowledge_base_files')
            .select('*')
            .in('n8n_file_id', agentData.model.knowledgeBase.fileIds)
            .eq('user_id', user.id);
            
          console.log('Alternative table query result:', { filesAlt, error: supabaseErrorAlt });
          
          if (!supabaseErrorAlt && filesAlt) {
            setKnowledgeFiles(filesAlt);
          } else {
            // Try without user filtering in case the field name is different
            const { data: filesNoUser, error: errorNoUser } = await supabase
              .from('knowledge_base')
              .select('*')
              .in('n8n_file_id', agentData.model.knowledgeBase.fileIds);
              
            console.log('No user filter query result:', { filesNoUser, error: errorNoUser });
            
            if (!errorNoUser && filesNoUser) {
              setKnowledgeFiles(filesNoUser);
            } else {
              setKnowledgeFiles([]);
            }
          }
        } else {
          setKnowledgeFiles(files);
        }
      }
    } catch (error) {
      console.error('Error fetching agent data:', error);
      setError(error.message || 'Failed to fetch agent data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'radial-gradient(125% 125% at 50% 10%, #FFFFFF 35%, #E9D5FF 75%, #C4B5FD 100%)'
      }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-900 font-semibold">Loading your agent...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 space-y-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Agent</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchAgentData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="p-8 space-y-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
            <Bot className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Agent Found</h2>
          <p className="text-gray-600">Unable to load agent information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Agent</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor your AI assistant configuration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="h-3 w-3 mr-1" />
            Active
          </Badge>
          <Button onClick={fetchAgentData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2 text-purple-600" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Agent Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            Agent Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Agent Name</p>
              <p className="font-semibold">{agent.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Agent ID</p>
              <p className="font-mono text-sm">{agent.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Organization ID</p>
              <p className="font-mono text-sm">{agent.orgId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">First Message Mode</p>
              <Badge variant="outline">{agent.firstMessageMode}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm">{formatDate(agent.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-sm">{formatDate(agent.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <Mic className="h-4 w-4 text-white" />
              </div>
              Voice Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Voice ID</p>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">{agent.voice.voiceId}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Provider</p>
                <Badge variant="outline">{agent.voice.provider}</Badge>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Speed</p>
              <div className="flex items-center gap-2">
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${agent.voice.speed * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{agent.voice.speed}x</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Voice Caching</p>
              <div className="flex items-center gap-2">
                {agent.voice.cachingEnabled ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm font-medium">
                  {agent.voice.cachingEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
            {agent.voice.fallbackPlan && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Fallback Voices</p>
                <div className="flex flex-wrap gap-2">
                  {agent.voice.fallbackPlan.voices.map((voice, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {voice.voiceId} ({voice.provider})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              AI Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Model</p>
                <Badge variant="outline">{agent.model.model}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Provider</p>
                <Badge variant="outline">{agent.model.provider}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Max Tokens</p>
                <p className="font-medium">{agent.model.maxTokens.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="font-medium">{agent.model.temperature}</p>
              </div>
            </div>
            {agent.model.numFastTurns && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Fast Turns</p>
                <p className="font-medium">{agent.model.numFastTurns}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Emotion Recognition</p>
              <div className="flex items-center gap-2">
                {agent.model.emotionRecognitionEnabled ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm font-medium">
                  {agent.model.emotionRecognitionEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
            
            {agent.model.toolIds && agent.model.toolIds.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tool IDs ({agent.model.toolIds.length})</p>
                <div className="flex flex-wrap gap-1">
                  {agent.model.toolIds.map((toolId, index) => (
                    <Badge key={index} variant="secondary" className="text-xs font-mono">
                      {toolId}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {agent.model.messages && agent.model.messages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Model Messages ({agent.model.messages.length})</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {agent.model.messages.map((message, index) => (
                    <div key={index} className="p-2 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {message.role || 'system'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {typeof message === 'string' ? message : message.content || JSON.stringify(message)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Call Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Phone className="h-4 w-4 text-white" />
            </div>
            Call Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Forwarding Number</p>
              <p className="font-mono">{agent.forwardingPhoneNumber}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Max Duration</p>
              <p className="font-medium">{Math.floor(agent.maxDurationSeconds / 60)} minutes</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Silence Timeout</p>
              <p className="font-medium">{agent.silenceTimeoutSeconds} seconds</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Background Sound</p>
              <Badge variant="outline">{agent.backgroundSound}</Badge>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">First Message</p>
              <p className="text-sm bg-secondary/30 p-3 rounded-lg">{agent.firstMessage}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Voicemail Message</p>
              <p className="text-sm bg-secondary/30 p-3 rounded-lg">{agent.voicemailMessage}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">End Call Message</p>
              <p className="text-sm bg-secondary/30 p-3 rounded-lg">{agent.endCallMessage}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">End Call Function</p>
              <div className="flex items-center gap-2">
                {agent.endCallFunctionEnabled ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm font-medium">
                  {agent.endCallFunctionEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
            
{agent.hipaaEnabled && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">HIPAA Compliance</p>
                <Badge variant="secondary">Enabled</Badge>
              </div>
            )}

            {agent.backgroundDenoisingEnabled !== undefined && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Background Denoising</p>
                <div className="flex items-center gap-2">
                  {agent.backgroundDenoisingEnabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">
                    {agent.backgroundDenoisingEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            )}

            {agent.firstMessageInterruptionsEnabled !== undefined && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">First Message Interrupts</p>
                <div className="flex items-center gap-2">
                  {agent.firstMessageInterruptionsEnabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">
                    {agent.firstMessageInterruptionsEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {agent.clientMessages && agent.clientMessages.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Client Messages</p>
                <div className="flex flex-wrap gap-2">
                  {agent.clientMessages.map((message, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {message}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {agent.serverMessages && agent.serverMessages.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Server Messages</p>
              <div className="flex flex-wrap gap-2">
                {agent.serverMessages.map((message, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {message}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Knowledge Base */}
      {agent.model.knowledgeBase && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <Database className="h-4 w-4 text-white" />
              </div>
              Knowledge Base
              <Badge variant="secondary">
                {knowledgeFiles.length} files available
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-muted-foreground">Provider: {agent.model.knowledgeBase.provider}</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-muted-foreground">Files Available: {knowledgeFiles.length}</span>
              </div>
            </div>
            
            {knowledgeFiles.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Knowledge Base Files ({knowledgeFiles.length})</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {knowledgeFiles.map((file) => (
                    <div 
                      key={file.id} 
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-secondary/30 cursor-pointer transition-colors"
                      onClick={() => window.open(file.file_url, '_blank')}
                    >
                      <FileText className="h-4 w-4 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate hover:text-primary">{file.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.file_type} • {file.file_size_formatted} • {file.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No knowledge base files found.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transcriber Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              Transcriber
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Model</p>
                <Badge variant="outline">{agent.transcriber.model}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Provider</p>
                <Badge variant="outline">{agent.transcriber.provider}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Language</p>
                <Badge variant="outline">{agent.transcriber.language}</Badge>
              </div>
              {agent.transcriber.numerals !== undefined && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Numerals</p>
                  <Badge variant={agent.transcriber.numerals ? "secondary" : "outline"}>
                    {agent.transcriber.numerals ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              )}
            </div>
            {(agent.transcriber.endpointing || agent.transcriber.confidenceThreshold) && (
              <div className="grid grid-cols-2 gap-4">
                {agent.transcriber.endpointing && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Endpointing</p>
                    <p className="font-medium">{agent.transcriber.endpointing}ms</p>
                  </div>
                )}
                {agent.transcriber.confidenceThreshold && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Confidence Threshold</p>
                    <p className="font-medium">{agent.transcriber.confidenceThreshold}</p>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Keywords ({agent.transcriber.keywords.length})</p>
              <div className="flex flex-wrap gap-1">
                {agent.transcriber.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observability & Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
              Monitoring & Observability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {agent.observabilityPlan ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Provider</p>
                  <Badge variant="outline">{agent.observabilityPlan.provider}</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Tags ({agent.observabilityPlan.tags.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.observabilityPlan.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Activity className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No observability plan configured</p>
              </div>
            )}
            

          </CardContent>
        </Card>
      </div>

      {/* System Prompt Section - Extract from model.messages if available */}
      {(agent.model.messages && agent.model.messages.find(m => m.role === 'system')) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              System Prompt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-secondary/30 rounded-lg max-h-60 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">
                {agent.model.messages.find(m => m.role === 'system')?.content || 'System prompt not available'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Plan */}
      {agent.analysisPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              Analysis Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Minimum Messages Threshold</p>
              <p className="font-medium">{agent.analysisPlan.minMessagesThreshold}</p>
            </div>

            <Separator />

            {agent.analysisPlan.summaryPlan && (
              <div className="space-y-3">
                <p className="text-sm font-semibold">Summary Plan</p>
                <div className="space-y-2">
                  {agent.analysisPlan.summaryPlan.messages
                    .filter(message => message.role !== 'user')
                    .map((message, index) => (
                      <div key={index} className="p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {message.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {agent.analysisPlan.structuredDataPlan && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">Structured Data Plan</p>
                    <Badge variant={agent.analysisPlan.structuredDataPlan.enabled ? "secondary" : "outline"}>
                      {agent.analysisPlan.structuredDataPlan.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {agent.analysisPlan.structuredDataPlan.messages
                      .filter(message => message.role !== 'user')
                      .map((message, index) => (
                        <div key={index} className="p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {message.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}

            {agent.analysisPlan.successEvaluationPlan && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">Success Evaluation Plan</p>
                    <Badge variant="outline">{agent.analysisPlan.successEvaluationPlan.rubric}</Badge>
                  </div>
                  <div className="space-y-2">
                    {agent.analysisPlan.successEvaluationPlan.messages
                      .filter(message => message.role !== 'user')
                      .map((message, index) => (
                        <div key={index} className="p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {message.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Advanced Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voicemail Detection */}
        {agent.voicemailDetection && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                Voicemail Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Beep Max Await</p>
                <p className="font-medium">{agent.voicemailDetection.beepMaxAwaitSeconds} seconds</p>
              </div>

              {agent.voicemailDetection.backoffPlan && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold">Backoff Plan</p>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Max Retries</span>
                      <span className="text-sm font-medium">{agent.voicemailDetection.backoffPlan.maxRetries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Start At</span>
                      <span className="text-sm font-medium">{agent.voicemailDetection.backoffPlan.startAtSeconds}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Frequency</span>
                      <span className="text-sm font-medium">{agent.voicemailDetection.backoffPlan.frequencySeconds}s</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Artifact Plan */}
        {agent.artifactPlan && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                Artifact & Recording
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {agent.artifactPlan.transcriptPlan && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Transcript</p>
                    <Badge variant={agent.artifactPlan.transcriptPlan.enabled ? "secondary" : "outline"}>
                      {agent.artifactPlan.transcriptPlan.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  {agent.artifactPlan.transcriptPlan.enabled && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Assistant:</span>
                        <span className="ml-2 font-medium">{agent.artifactPlan.transcriptPlan.assistantName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">User:</span>
                        <span className="ml-2 font-medium">{agent.artifactPlan.transcriptPlan.userName}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Recording</p>
                  <Badge variant={agent.artifactPlan.recordingEnabled ? "secondary" : "outline"}>
                    {agent.artifactPlan.recordingEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                {agent.artifactPlan.recordingEnabled && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="ml-2 font-medium">{agent.artifactPlan.recordingFormat}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Video Recording</p>
                  <Badge variant={agent.artifactPlan.videoRecordingEnabled ? "secondary" : "outline"}>
                    {agent.artifactPlan.videoRecordingEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Logging</p>
                  <Badge variant={agent.artifactPlan.loggingEnabled ? "secondary" : "outline"}>
                    {agent.artifactPlan.loggingEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Custom Storage</p>
                  <Badge variant={agent.artifactPlan.recordingUseCustomStorageEnabled ? "secondary" : "outline"}>
                    {agent.artifactPlan.recordingUseCustomStorageEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Message Plan & Communication */}
      {agent.messagePlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              Message Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Idle Timeout</p>
                <p className="font-medium">{agent.messagePlan.idleTimeoutSeconds}s</p>
              </div>
              {agent.messagePlan.idleMessageMaxSpokenCount !== undefined && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Max Spoken Count</p>
                  <p className="font-medium">{agent.messagePlan.idleMessageMaxSpokenCount}</p>
                </div>
              )}
            </div>

            {agent.messagePlan.idleMessages && agent.messagePlan.idleMessages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Idle Messages ({agent.messagePlan.idleMessages.length})</p>
                <div className="space-y-2">
                  {agent.messagePlan.idleMessages.map((message, index) => (
                    <div key={index} className="p-2 bg-secondary/30 rounded text-sm">
                      "{message}"
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}



      {/* Configuration Grid - Compliance, Keypad Input, and Transport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Plan */}
        {((agent.compliancePlan?.hipaaEnabled ?? agent.hipaaEnabled) || agent.compliancePlan?.pciEnabled || agent.compliancePlan?.securityFilterPlan) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                Compliance & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {((agent.compliancePlan?.hipaaEnabled ?? agent.hipaaEnabled) || agent.compliancePlan?.pciEnabled) ? (
                <div className="space-y-2">
                  {(agent.compliancePlan?.hipaaEnabled ?? agent.hipaaEnabled) && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">HIPAA</p>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                  )}
                  
                  {agent.compliancePlan?.pciEnabled && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">PCI</p>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                  )}
                </div>
              ) : null}

              {agent.compliancePlan?.securityFilterPlan && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Security Filter</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Enabled</span>
                      <Badge variant={agent.compliancePlan.securityFilterPlan.enabled ? "secondary" : "outline"}>
                        {agent.compliancePlan.securityFilterPlan.enabled ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Mode</span>
                      <span className="text-sm font-medium">{agent.compliancePlan.securityFilterPlan.mode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Replacement</span>
                      <span className="text-sm font-medium">"{agent.compliancePlan.securityFilterPlan.replacementText}"</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Keypad Input Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <Phone className="h-4 w-4 text-white" />
              </div>
              Keypad Input Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {agent.keypadInputPlan ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Enabled</p>
                  <Badge variant={agent.keypadInputPlan.enabled ? "secondary" : "outline"}>
                    {agent.keypadInputPlan.enabled ? "Yes" : "No"}
                  </Badge>
                </div>
                
                {agent.keypadInputPlan.timeoutSeconds > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Timeout</p>
                    <p className="font-medium">{agent.keypadInputPlan.timeoutSeconds}s</p>
                  </div>
                )}
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Delimiters</p>
                  <div className="flex gap-1">
                    {agent.keypadInputPlan.delimiters?.length > 0 ? (
                      agent.keypadInputPlan.delimiters.map((delimiter, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          "{delimiter}"
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">None configured</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Phone className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No keypad input configuration found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transport Configuration */}
        {agent.transportConfigurations && agent.transportConfigurations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                Transport Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {agent.transportConfigurations.map((config, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{config.provider}</Badge>
                    <Badge variant={config.record ? "secondary" : "outline"}>
                      Recording: {config.record ? "On" : "Off"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timeout:</span>
                      <span className="font-medium">{config.timeout}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Channels:</span>
                      <span className="font-medium">{config.recordingChannels}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>


    </div>
  );
};
