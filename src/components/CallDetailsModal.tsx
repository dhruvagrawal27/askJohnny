import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, MessageSquare } from "lucide-react";
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
  if (!call) return null;
  const startedAt = call.startedAt ? new Date(call.startedAt) : null;
  const endedAt = call.endedAt ? new Date(call.endedAt) : null;

  let duration = "-";
  if (startedAt && endedAt) {
    const sec = Math.max(0, (endedAt.getTime() - startedAt.getTime()) / 1000);
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    duration = `${m}m ${s}s`;
  }

  const cost =
    typeof call.cost === "number"
      ? `$${call.cost.toFixed(2)}`
      : call.costs && call.costs.length > 0
      ? `$${call.costs[0].cost.toFixed(2)}`
      : "-";

  const recordingUrl =
    call.artifact?.recordingUrl || call.artifact?.stereoRecordingUrl;
  const transcript = call.artifact?.transcript;

  // State for transcript modal
  const [transcriptionModalOpen, setTranscriptionModalOpen] =
    React.useState(false);

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
            [
              "Number",
              call.customer?.number ||
                call.analysis?.structuredData?.phone_number ||
                call.destination?.number ||
                call.phoneNumber?.number ||
                "-",
            ],
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
            ["Duration", duration],
            ["Cost", cost],
          ].map(([label, value]) => (
            <div key={label} className="space-y-1">
              <div className="font-semibold">{label}</div>
              <div className="break-words">{value}</div>
            </div>
          ))}
        </div>

        {/* Notes / Summary */}
        <div className="mt-6">
          <div className="font-semibold mb-2">Notes / Summary</div>
          <div className="bg-muted rounded-lg p-3 text-sm whitespace-pre-wrap break-words">
            {call.analysis?.summary || transcript || "No notes available."}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-2">
          {recordingUrl && (
            <Button
              variant="outline"
              onClick={() => window.open(recordingUrl, "_blank")}
              className="flex items-center"
            >
              <Play className="h-4 w-4 mr-2" /> Play Recording
            </Button>
          )}
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
            {call.costs && call.costs.length > 0 && (
              <AccordionItem value="costs">
                <AccordionTrigger>Costs Breakdown</AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Provider
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Minutes
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cost
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {call.costs.map((c, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {c.type || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {c.provider || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {c.minutes ? c.minutes.toFixed(2) : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {c.cost ? `$${c.cost.toFixed(4)}` : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            {call.analysis && (
              <AccordionItem value="analysis">
                <AccordionTrigger>Analysis Details</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <div className="font-semibold">Summary</div>
                      <div className="text-sm break-words">
                        {call.analysis.summary || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">Structured Data</div>
                      <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto max-h-64 whitespace-pre-wrap break-words">
                        {JSON.stringify(
                          call.analysis.structuredData ||
                            call.analysis.structuredDataMulti,
                          null,
                          2
                        ) || "-"}
                      </pre>
                    </div>
                    <div>
                      <div className="font-semibold">Success Evaluation</div>
                      <div className="text-sm break-words">
                        {call.analysis.successEvaluation || "-"}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            {call.messages && call.messages.length > 0 && (
              <AccordionItem value="messages">
                <AccordionTrigger>Messages Log</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {call.messages.map((m: any, i: number) => (
                      <div key={i} className="border-b pb-2 last:border-b-0">
                        <div className="font-semibold capitalize">
                          {m.role || "Unknown"}
                        </div>
                        <div className="text-sm break-words whitespace-pre-wrap">
                          {m.message || m.content || "-"}
                        </div>
                        {m.tool_calls && (
                          <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap break-words mt-2">
                            {JSON.stringify(m.tool_calls, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            {call.performanceMetrics && (
              <AccordionItem value="performance">
                <AccordionTrigger>Performance Metrics</AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto max-h-64 whitespace-pre-wrap break-words">
                    {JSON.stringify(call.performanceMetrics, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value="other">
              <AccordionTrigger>Other Details</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="font-semibold">Org ID</div>
                    <div className="break-words">{call.orgId || "-"}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold">Created At</div>
                    <div className="break-words">
                      {call.createdAt
                        ? format(
                            new Date(call.createdAt),
                            "MM/dd/yyyy, hh:mm a"
                          )
                        : "-"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold">Updated At</div>
                    <div className="break-words">
                      {call.updatedAt
                        ? format(
                            new Date(call.updatedAt),
                            "MM/dd/yyyy, hh:mm a"
                          )
                        : "-"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold">Assistant ID</div>
                    <div className="break-words">{call.assistantId || "-"}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold">Web Call URL</div>
                    <div className="break-words">{call.webCallUrl || "-"}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold">Ended Reason</div>
                    <div className="break-words">{call.endedReason || "-"}</div>
                  </div>
                </div>
                <div className="font-semibold mb-2">Additional Properties</div>
                <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto max-h-64 whitespace-pre-wrap break-words">
                  {JSON.stringify(
                    {
                      variableValues: call.variableValues,
                      variables: call.variables,
                      monitor: call.monitor,
                      transport: call.transport,
                      logUrl: call.logUrl,
                      nodes: call.nodes,
                      transfers: call.transfers,
                    },
                    null,
                    2
                  )}
                </pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Full Raw Data - Collapsible */}
        <div className="mt-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="raw-data">
              <AccordionTrigger>Full Raw Data</AccordionTrigger>
              <AccordionContent>
                <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto max-h-64 whitespace-pre-wrap break-words">
                  {JSON.stringify(call, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
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
