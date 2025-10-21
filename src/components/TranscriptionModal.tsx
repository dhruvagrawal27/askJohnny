import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";

interface TranscriptionModalProps {
  open: boolean;
  onClose: () => void;
  transcript: string | null;
}

export const TranscriptionModal: React.FC<TranscriptionModalProps> = ({
  open,
  onClose,
  transcript,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full max-h-[80vh] overflow-y-auto rounded-2xl shadow-xl p-6 bg-gradient-to-br from-blue-50 to-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-blue-900">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Call Transcription
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Full transcript of the call
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 relative">
          <pre className="bg-white rounded-lg p-4 text-base text-gray-800 font-mono whitespace-pre-wrap break-words shadow-inner border border-blue-100 max-h-[60vh] overflow-y-auto">
            {transcript || "No transcript available."}
          </pre>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-blue-600" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
