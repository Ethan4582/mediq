"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OcrKeyForm from "./OcrKeyForm";
import LlmKeyForm from "./LlmKeyForm";
import { KeyType } from "@/types/app";

interface AddKeyDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultKeyType?: KeyType;
  onSaved?: () => void;
}

export default function AddKeyDialog({
  open,
  onOpenChange,
  defaultKeyType = "ocr",
  onSaved,
}: AddKeyDialogProps) {
  const [activeTab, setActiveTab] = useState<KeyType>(defaultKeyType);

  useEffect(() => {
    if (open) {
      setActiveTab(defaultKeyType);
    }
  }, [open, defaultKeyType]);

  const handleSuccess = () => {
    onSaved?.();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Configure Provider API Key
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as KeyType)}
          className="w-full mt-1"
        >
          <TabsList className="grid grid-cols-2 w-full h-10 p-1 bg-muted/60 rounded-xl">
            <TabsTrigger
              value="ocr"
              className="text-xs font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground shadow-xs"
            >
              Layer 1: Mistral OCR
            </TabsTrigger>
            <TabsTrigger
              value="llm"
              className="text-xs font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground shadow-xs"
            >
              Layer 2: Reasoning LLM
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ocr" className="focus-visible:outline-none">
            <OcrKeyForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </TabsContent>

          <TabsContent value="llm" className="focus-visible:outline-none">
            <LlmKeyForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
