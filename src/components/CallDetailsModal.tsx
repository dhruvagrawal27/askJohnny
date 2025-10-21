import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, Download, MessageSquare } from "lucide-react";
import { TranscriptionModal } from "./TranscriptionModal";
import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Call = {
  id: string;
  orgId?: string;
  createdAt?: string;
  updatedAt?: string;
  type?: string;
  status?: string;
  startedAt?: string;
  endedAt?: string;
  cost?: number;
  costs?: Array<{
    type: string;
    provider: string;
    minutes: number;
    cost: number;
  }>;
  analysis?: {
    summary?: string;
    structuredData?: Record<string, any>;
    structuredDataMulti?: Array<Record<string, any>>;
    successEvaluation?: string;
  };
  artifact?: {
    transcript?: string;
    recordingUrl?: string;
    stereoRecordingUrl?: string;
    videoRecordingUrl?: string;
  };
  destination?: {
    number?: string;
    callerId?: string;
    description?: string;
  };
  phoneNumber?: {
    number?: string;
    name?: string;
    email?: string;
  };
  customer?: {
    name?: string;
    number?: string;
    email?: string;
  };
  [key: string]: any;
};

interface CallDetailsModalProps {
  open: boolean;
  onClose: () => void;
  call: Call | null;
}

export const CallDetailsModal: React.FC<CallDetailsModalProps> = ({
  open,
  onClose,
  call,
}) => {
  const [transcriptionModalOpen, setTranscriptionModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  if (!call) return null;
  
  const startedAt = call.startedAt ? new Date(call.startedAt) : null;
  const endedAt = call.endedAt ? new Date(call.endedAt) : null;

  let callDuration = "-";
  if (startedAt && endedAt) {
    const sec = Math.max(0, (endedAt.getTime() - startedAt.getTime()) / 1000);
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    callDuration = `${m}m ${s}s`;
  }

  const recordingUrl = call.artifact?.recordingUrl || call.artifact?.stereoRecordingUrl;
  const transcript = call.artifact?.transcript;
  
  // Get caller info, display "WebCall" for unknown numbers
  const callerNumber = call.customer?.number ||
    call.analysis?.structuredData?.phone_number ||
    call.destination?.number ||
    call.phoneNumber?.number ||
    "WebCall";

  // Audio player functions
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const downloadRecording = () => {
    if (recordingUrl) {
      const link = document.createElement('a');
      link.href = recordingUrl;
      link.download = `call-recording-${call.id}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[80vh] overflow-y-auto rounded-2xl shadow-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Call Details</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground break-words">
            Full information for call ID: {call.id}
          </DialogDescription>
        </DialogHeader>

        {/* Key Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {[
            [
              "Caller",
              call.customer?.name ||
                call.analysis?.structuredData?.name ||
                call.phoneNumber?.name ||
                "Unknown",
            ],
            ["Number", callerNumber],
            ["Type", call.type || "-"],
            ["Status", call.status || "-"],
            [
              "Started At",
              startedAt ? format(startedAt, "MM/dd/yyyy, hh:mm a") : "-",
            ],
            [
              "Ended At",
              endedAt ? format(endedAt, "MM/dd/yyyy, hh:mm a") : "-",
            ],
            ["Duration", callDuration],
          ].map(([label, value]) => (
            <div key={label} className="space-y-1">
              <div className="font-semibold">{label}</div>
              <div className="break-words">{value}</div>
            </div>
          ))}
        </div>

        {/* Audio Player */}
        {recordingUrl && (
          <div className="mt-6">
            <div className="font-semibold mb-2">Call Recording</div>
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <audio
                ref={audioRef}
                src={recordingUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlayPause}
                  className="flex items-center gap-2"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadRecording}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              
              {duration > 0 && (
                <div className="w-full">
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes / Summary */}
        <div className="mt-6">
          <div className="font-semibold mb-2">Notes / Summary</div>
          <div className="bg-muted rounded-lg p-3 text-sm whitespace-pre-wrap break-words">
            {call.analysis?.summary || transcript || "No notes available."}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-2">
          {transcript && (
            <Button
              variant="outline"
              onClick={() => setTranscriptionModalOpen(true)}
              className="flex items-center"
            >
              <MessageSquare className="h-4 w-4 mr-2" /> View Transcript
            </Button>
          )}
          <TranscriptionModal
            open={transcriptionModalOpen}
            onClose={() => setTranscriptionModalOpen(false)}
            transcript={transcript ?? null}
          />
        </div>

        {/* Detailed Information Sections */}
        <div className="mt-6">
          <div className="font-semibold mb-2">Detailed Information</div>
          <Accordion type="multiple" className="w-full">
            {call.analysis && (
              <AccordionItem value="analysis">
                <AccordionTrigger>Analysis Details</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6">
                    {call.analysis.summary && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                          Call Summary
                        </div>
                        <div className="text-blue-800 text-sm leading-relaxed">
                          {call.analysis.summary}
                        </div>
                      </div>
                    )}
                    
                    {call.analysis.structuredData && (
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                          Extracted Information
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(call.analysis.structuredData).map(([key, value]) => (
                            <div key={key} className="bg-white rounded p-3 border">
                              <div className="font-medium text-green-800 text-xs uppercase tracking-wide mb-1">
                                {key.replace(/_/g, ' ')}
                              </div>
                              <div className="text-green-700 text-sm">
                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {call.analysis.successEvaluation && (
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <div className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                          Success Evaluation
                        </div>
                        <div className="text-purple-800 text-sm leading-relaxed">
                          {call.analysis.successEvaluation}
                        </div>
                      </div>
                    )}
                    
                    {call.analysis.structuredDataMulti && Array.isArray(call.analysis.structuredDataMulti) && (
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <div className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                          📈 Multi-Level Analysis
                        </div>
                        <div className="space-y-2">
                          {call.analysis.structuredDataMulti.map((item, index) => (
                            <div key={index} className="bg-white rounded p-3 border">
                              <div className="font-medium text-orange-800 text-xs mb-2">
                                Analysis Block {index + 1}
                              </div>
                              <pre className="text-orange-700 text-xs overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(item, null, 2)}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// import React from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Play, MessageSquare } from "lucide-react";
// import { format } from "date-fns";

// type Call = {
//   id: string;
//   orgId?: string;
//   createdAt?: string;
//   updatedAt?: string;
//   type?: string;
//   status?: string;
//   startedAt?: string;
//   endedAt?: string;
//   cost?: number;
//   costs?: Array<{
//     type: string;
//     provider: string;
//     minutes: number;
//     cost: number;
//   }>;
//   analysis?: {
//     summary?: string;
//     structuredData?: Record<string, any>;
//     structuredDataMulti?: Array<Record<string, any>>;
//     successEvaluation?: string;
//   };
//   artifact?: {
//     transcript?: string;
//     recordingUrl?: string;
//     stereoRecordingUrl?: string;
//     videoRecordingUrl?: string;
//   };
//   destination?: {
//     number?: string;
//     callerId?: string;
//     description?: string;
//   };
//   phoneNumber?: {
//     number?: string;
//     name?: string;
//     email?: string;
//   };
//   customer?: {
//     name?: string;
//     number?: string;
//     email?: string;
//   };
//   [key: string]: any;
// };

// interface CallDetailsModalProps {
//   open: boolean;
//   onClose: () => void;
//   call: Call | null;
// }

// export const CallDetailsModal: React.FC<CallDetailsModalProps> = ({
//   open,
//   onClose,
//   call,
// }) => {
//   if (!call) return null;
//   const startedAt = call.startedAt ? new Date(call.startedAt) : null;
//   const endedAt = call.endedAt ? new Date(call.endedAt) : null;

//   let duration = "-";
//   if (startedAt && endedAt) {
//     const sec = Math.max(0, (endedAt.getTime() - startedAt.getTime()) / 1000);
//     const m = Math.floor(sec / 60);
//     const s = Math.round(sec % 60);
//     duration = `${m}m ${s}s`;
//   }

//   const cost =
//     typeof call.cost === "number"
//       ? `$${call.cost.toFixed(2)}`
//       : call.costs && call.costs.length > 0
//       ? `$${call.costs[0].cost.toFixed(2)}`
//       : "-";

//   const recordingUrl =
//     call.artifact?.recordingUrl || call.artifact?.stereoRecordingUrl;
//   const transcript = call.artifact?.transcript;

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-3xl w-full max-h-[80vh] overflow-y-auto rounded-2xl shadow-lg p-6">
//         <DialogHeader>
//           <DialogTitle className="text-xl font-bold">Call Details</DialogTitle>
//           <DialogDescription className="text-sm text-muted-foreground break-words">
//             Full information for call ID: {call.id}
//           </DialogDescription>
//         </DialogHeader>

//         {/* Key Info */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
//           {[
//             [
//               "Caller",
//               call.customer?.name ||
//                 call.analysis?.structuredData?.name ||
//                 call.phoneNumber?.name ||
//                 "Unknown",
//             ],
//             [
//               "Number",
//               call.customer?.number ||
//                 call.analysis?.structuredData?.phone_number ||
//                 call.destination?.number ||
//                 call.phoneNumber?.number ||
//                 "-",
//             ],
//             ["Type", call.type || "-"],
//             ["Status", call.status || "-"],
//             [
//               "Started At",
//               startedAt ? format(startedAt, "MM/dd/yyyy, hh:mm a") : "-",
//             ],
//             [
//               "Ended At",
//               endedAt ? format(endedAt, "MM/dd/yyyy, hh:mm a") : "-",
//             ],
//             ["Duration", duration],
//             ["Cost", cost],
//           ].map(([label, value]) => (
//             <div key={label} className="space-y-1">
//               <div className="font-semibold">{label}</div>
//               <div className="break-words">{value}</div>
//             </div>
//           ))}
//         </div>

//         {/* Notes / Summary */}
//         <div className="mt-6">
//           <div className="font-semibold mb-2">Notes / Summary</div>
//           <div className="bg-muted rounded-lg p-3 text-sm whitespace-pre-wrap break-words">
//             {call.analysis?.summary || transcript || "No notes available."}
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="mt-6 flex flex-wrap gap-2">
//           {recordingUrl && (
//             <Button
//               variant="outline"
//               onClick={() => window.open(recordingUrl, "_blank")}
//               className="flex items-center"
//             >
//               <Play className="h-4 w-4 mr-2" /> Play Recording
//             </Button>
//           )}
//           {transcript && (
//             <Button
//               variant="outline"
//               onClick={() => alert(transcript)}
//               className="flex items-center"
//             >
//               <MessageSquare className="h-4 w-4 mr-2" /> View Transcript
//             </Button>
//           )}
//         </div>

//         {/* Full Raw Data */}
//         <div className="mt-6">
//           <div className="font-semibold mb-2">Full Raw Data</div>
//           <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto max-h-64 whitespace-pre-wrap break-words">
//             {JSON.stringify(call, null, 2)}
//           </pre>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// import React from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Play, MessageSquare } from "lucide-react";
// import { format } from "date-fns";

// // Type for call (should match DashboardCalls)
// type Call = {
//   id: string;
//   orgId?: string;
//   createdAt?: string;
//   updatedAt?: string;
//   type?: string;
//   status?: string;
//   startedAt?: string;
//   endedAt?: string;
//   cost?: number;
//   costs?: Array<{
//     type: string;
//     provider: string;
//     minutes: number;
//     cost: number;
//   }>;
//   analysis?: {
//     summary?: string;
//     structuredData?: Record<string, any>;
//     structuredDataMulti?: Array<Record<string, any>>;
//     successEvaluation?: string;
//   };
//   artifact?: {
//     transcript?: string;
//     recordingUrl?: string;
//     stereoRecordingUrl?: string;
//     videoRecordingUrl?: string;
//   };
//   destination?: {
//     number?: string;
//     callerId?: string;
//     description?: string;
//   };
//   phoneNumber?: {
//     number?: string;
//     name?: string;
//     email?: string;
//   };
//   customer?: {
//     name?: string;
//     number?: string;
//     email?: string;
//   };
//   [key: string]: any;
// };

// interface CallDetailsModalProps {
//   open: boolean;
//   onClose: () => void;
//   call: Call | null;
// }

// export const CallDetailsModal: React.FC<CallDetailsModalProps> = ({
//   open,
//   onClose,
//   call,
// }) => {
//   if (!call) return null;
//   const startedAt = call.startedAt ? new Date(call.startedAt) : null;
//   const endedAt = call.endedAt ? new Date(call.endedAt) : null;
//   let duration = "-";
//   if (startedAt && endedAt) {
//     const sec = Math.max(0, (endedAt.getTime() - startedAt.getTime()) / 1000);
//     const m = Math.floor(sec / 60);
//     const s = Math.round(sec % 60);
//     duration = `${m}m ${s}s`;
//   }
//   const cost =
//     typeof call.cost === "number"
//       ? `$${call.cost.toFixed(2)}`
//       : call.costs && call.costs.length > 0
//       ? `$${call.costs[0].cost.toFixed(2)}`
//       : "-";
//   const recordingUrl =
//     call.artifact?.recordingUrl || call.artifact?.stereoRecordingUrl;
//   const transcript = call.artifact?.transcript;
//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>Call Details</DialogTitle>
//           <DialogDescription>
//             Full information for call ID: {call.id}
//           </DialogDescription>
//         </DialogHeader>
//         <div className="grid grid-cols-2 gap-4 mt-4">
//           <div>
//             <div className="font-semibold">Caller</div>
//             <div>
//               {call.customer?.name ||
//                 call.analysis?.structuredData?.name ||
//                 call.phoneNumber?.name ||
//                 "Unknown"}
//             </div>
//           </div>
//           <div>
//             <div className="font-semibold">Number</div>
//             <div>
//               {call.customer?.number ||
//                 call.analysis?.structuredData?.phone_number ||
//                 call.destination?.number ||
//                 call.phoneNumber?.number ||
//                 "-"}
//             </div>
//           </div>
//           <div>
//             <div className="font-semibold">Type</div>
//             <div>{call.type || "-"}</div>
//           </div>
//           <div>
//             <div className="font-semibold">Status</div>
//             <div>{call.status || "-"}</div>
//           </div>
//           <div>
//             <div className="font-semibold">Started At</div>
//             <div>
//               {startedAt ? format(startedAt, "MM/dd/yyyy, hh:mm a") : "-"}
//             </div>
//           </div>
//           <div>
//             <div className="font-semibold">Ended At</div>
//             <div>{endedAt ? format(endedAt, "MM/dd/yyyy, hh:mm a") : "-"}</div>
//           </div>
//           <div>
//             <div className="font-semibold">Duration</div>
//             <div>{duration}</div>
//           </div>
//           <div>
//             <div className="font-semibold">Cost</div>
//             <div>{cost}</div>
//           </div>
//         </div>
//         <div className="mt-4">
//           <div className="font-semibold mb-1">Notes / Summary</div>
//           <div className="bg-muted rounded p-2 text-sm whitespace-pre-wrap">
//             {call.analysis?.summary || transcript || "No notes available."}
//           </div>
//         </div>
//         <div className="mt-4 flex gap-2">
//           {recordingUrl && (
//             <Button
//               variant="outline"
//               onClick={() => window.open(recordingUrl, "_blank")}
//             >
//               {" "}
//               <Play className="h-4 w-4 mr-2" /> Play Recording{" "}
//             </Button>
//           )}
//           {transcript && (
//             <Button variant="outline" onClick={() => alert(transcript)}>
//               {" "}
//               <MessageSquare className="h-4 w-4 mr-2" /> View Transcript{" "}
//             </Button>
//           )}
//         </div>
//         <div className="mt-4">
//           <div className="font-semibold mb-1">Full Raw Data</div>
//           <pre className="bg-muted rounded p-2 text-xs overflow-x-auto max-h-64">
//             {JSON.stringify(call, null, 2)}
//           </pre>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };
