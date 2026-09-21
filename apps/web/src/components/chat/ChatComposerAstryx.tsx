"use client";

import { useRef, useState, type CSSProperties } from "react";
import {
  ChatComposer,
  ChatComposerDrawer,
  ChatComposerInput,
  ChatDictationButton,
  useChatDictation,
  type ChatComposerInputHandle,
  type ChatComposerTrigger,
} from "@astryxdesign/core/Chat";
import {
  createStaticSource,
  TypeaheadItem,
  type SearchableItem,
} from "@astryxdesign/core/Typeahead";
import { Token } from "@astryxdesign/core/Token";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";
import {
  AtSymbolIcon,
  PaperClipIcon,
  SparklesIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { PROVIDERS } from "@/lib/constants";
import type { LLMProvider } from "@/types/app";

const composerInputStyle: CSSProperties = {
  minHeight: 56,
};

const CLINICAL_MENTIONS: SearchableItem<{ role: string }>[] = [
  { id: "agent", label: "MediQ AI", auxiliaryData: { role: "Clinical Agent" } },
  { id: "radiology", label: "Radiology Report", auxiliaryData: { role: "Imaging Context" } },
  { id: "lab", label: "Lab Results", auxiliaryData: { role: "Pathology Context" } },
  { id: "pharmacy", label: "Medication History", auxiliaryData: { role: "Rx Context" } },
];

const CLINICAL_COMMANDS: SearchableItem<{ description: string }>[] = [
  { id: "summarize", label: "summarize", auxiliaryData: { description: "Generate discharge summary" } },
  { id: "vitals", label: "vitals", auxiliaryData: { description: "Extract vital signs progression" } },
  { id: "meds", label: "meds", auxiliaryData: { description: "Reconcile admission vs discharge drugs" } },
  { id: "conflicts", label: "conflicts", auxiliaryData: { description: "Scan for clinical contradictions" } },
];

const mentionTrigger: ChatComposerTrigger = {
  character: "@",
  searchSource: createStaticSource(CLINICAL_MENTIONS),
  renderItem: (item) => (
    <TypeaheadItem
      item={item}
      description={(item.auxiliaryData as { role: string })?.role}
    />
  ),
  onSelect: (item) => ({
    value: `@${item.id}`,
    label: item.label,
    variant: "blue",
  }),
};

const commandTrigger: ChatComposerTrigger = {
  character: "/",
  searchSource: createStaticSource(CLINICAL_COMMANDS),
  renderItem: (item) => (
    <TypeaheadItem
      item={item}
      description={(item.auxiliaryData as { description: string })?.description}
    />
  ),
  onSelect: (item) => ({
    value: `/${item.label}`,
    label: `/${item.label}`,
    variant: "yellow",
  }),
};

const triggers = [mentionTrigger, commandTrigger];

interface ChatComposerAstryxProps {
  onSend: (text: string) => void;
  onUpload?: (file: File) => void;
  disabled?: boolean;
  isSending?: boolean;
  selectedProvider?: string | null;
  onProviderChange?: (provider: string) => void;
  attachedFiles?: string[];
  onRemoveAttachment?: (filename: string) => void;
}

export default function ChatComposerAstryx({
  onSend,
  onUpload,
  disabled,
  isSending,
  selectedProvider,
  onProviderChange,
  attachedFiles = [],
  onRemoveAttachment,
}: ChatComposerAstryxProps) {
  const [inputText, setInputText] = useState("");
  const composerInputRef = useRef<ChatComposerInputHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dictation = useChatDictation({ inputRef: composerInputRef });

  const activeProviderKey = (selectedProvider || "openai") as LLMProvider;
  const activeProviderName = PROVIDERS[activeProviderKey]?.name || "OpenAI";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFormSubmit = () => {
    if (disabled || isSending) return;
    const text = inputText.trim();
    if (text) {
      onSend(text);
      setInputText("");
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.txt"
        onChange={handleFileChange}
        className="hidden"
      />
      <ChatComposer
        onSubmit={handleFormSubmit}
        placeholder={disabled ? "Processing document..." : "Ask questions about this patient's medical records or type / for clinical tools..."}
        input={
          <ChatComposerInput
            handleRef={composerInputRef}
            triggers={triggers}
            value={inputText}
            onChange={setInputText}
            style={composerInputStyle}
            onFiles={(files) => {
              if (files[0] && onUpload) {
                onUpload(files[0]);
              }
            }}
          />
        }
        drawer={
          attachedFiles.length > 0 ? (
            <ChatComposerDrawer count={attachedFiles.length}>
              {attachedFiles.map((name) => (
                <Token
                  key={name}
                  label={name}
                  icon={<Icon icon={DocumentTextIcon} size="sm" />}
                  onRemove={onRemoveAttachment ? () => onRemoveAttachment(name) : undefined}
                />
              ))}
            </ChatComposerDrawer>
          ) : undefined
        }
        headerActions={
          <>
            <Button
              label="Attach document"
              variant="ghost"
              size="sm"
              icon={<Icon icon={PaperClipIcon} size="sm" />}
              isIconOnly
              onClick={() => fileInputRef.current?.click()}
            />
            <Button
              label="Mention"
              variant="ghost"
              size="sm"
              icon={<Icon icon={AtSymbolIcon} size="sm" />}
              isIconOnly
            />
          </>
        }
        footerActions={
          <DropdownMenu
            button={{
              label: activeProviderName,
              variant: "ghost",
              size: "sm",
              icon: <Icon icon={SparklesIcon} size="sm" />,
            }}
            items={Object.entries(PROVIDERS).map(([key, info]) => ({
              label: info.name,
              onClick: () => onProviderChange?.(key),
            }))}
          />
        }
        sendActions={<ChatDictationButton dictation={dictation} />}
      />
    </>
  );
}
