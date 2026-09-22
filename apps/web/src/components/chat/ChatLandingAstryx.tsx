"use client";

import { useRef, useState, type CSSProperties } from "react";
import { Layout, LayoutContent, VStack, HStack } from "@astryxdesign/core/Layout";
import { Text, Heading } from "@astryxdesign/core/Text";
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
import { ToggleButton, ToggleButtonGroup } from "@astryxdesign/core/ToggleButton";
import { Token } from "@astryxdesign/core/Token";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { Grid } from "@astryxdesign/core/Grid";
import { Icon } from "@astryxdesign/core/Icon";
import { DropdownMenu, DropdownMenuItem } from "@astryxdesign/core/DropdownMenu";
import {
  AtSymbolIcon,
  SparklesIcon,
  BeakerIcon,
  HeartIcon,
  DocumentMagnifyingGlassIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";

const pageStyle: CSSProperties = { minHeight: "100%", width: "100%" };
const composerInput: CSSProperties = { minHeight: 84 };
const categoriesStyle: CSSProperties = { paddingInline: "var(--spacing-3)", width: "100%" };

const CLINICAL_SUGGESTIONS: Record<
  string,
  Array<{ heading: string; body: string; prompt: string }>
> = {
  clinical: [
    {
      heading: "Summarize Discharge Record",
      body: "Extract admission reasons, clinical course, and principal diagnoses",
      prompt: "Generate a clinical discharge summary including principal diagnosis and hospital course.",
    },
    {
      heading: "Analyze Clinical Conflicts",
      body: "Detect contradictions across multidisciplinary notes and lab findings",
      prompt: "Scan patient records for contradictory diagnostic entries or conflicting lab values.",
    },
  ],
  medications: [
    {
      heading: "Reconcile Medications",
      body: "Compare home meds vs discharge prescriptions for discrepancies",
      prompt: "Reconcile admission vs discharge medications and flag duplicate therapies or dosage changes.",
    },
    {
      heading: "Check Drug Interactions",
      body: "Screen for adverse interactions, dosages, and contraindications",
      prompt: "Review patient medications for drug-drug interactions and organ clearance warnings.",
    },
  ],
  labs: [
    {
      heading: "Interpret Abnormal Labs",
      body: "Review CBC, BMP, and cardiac panels with trend analysis",
      prompt: "Analyze abnormal laboratory values and correlate with patient presentation.",
    },
    {
      heading: "Vital Signs Progression",
      body: "Chart blood pressure, pulse, SpO2, and temperature shifts",
      prompt: "Extract vital signs progression during the inpatient stay.",
    },
  ],
};

const CATEGORIES = [
  { key: "clinical", label: "Clinical & Summary", icon: DocumentMagnifyingGlassIcon },
  { key: "medications", label: "Medications & Rx", icon: HeartIcon },
  { key: "labs", label: "Labs & Vitals", icon: BeakerIcon },
] as const;

const MENTION_ITEMS: SearchableItem<{ role: string }>[] = [
  { id: "mediq", label: "MediQ AI", auxiliaryData: { role: "Clinical Intelligence" } },
  { id: "cardio", label: "Cardiology", auxiliaryData: { role: "Specialty" } },
  { id: "pharm", label: "Pharmacist", auxiliaryData: { role: "Rx Review" } },
];

const COMMAND_ITEMS: SearchableItem<{ desc: string }>[] = [
  { id: "summarize", label: "/summarize", auxiliaryData: { desc: "Generate discharge summary" } },
  { id: "meds", label: "/meds", auxiliaryData: { desc: "Reconcile inpatient medications" } },
  { id: "vitals", label: "/vitals", auxiliaryData: { desc: "Extract vital signs & labs" } },
  { id: "conflicts", label: "/conflicts", auxiliaryData: { desc: "Detect clinical discrepancies" } },
];

const mentionTrigger: ChatComposerTrigger = {
  character: "@",
  searchSource: createStaticSource(MENTION_ITEMS),
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
  searchSource: createStaticSource(COMMAND_ITEMS),
  renderItem: (item) => (
    <TypeaheadItem
      item={item}
      description={(item.auxiliaryData as { desc: string })?.desc}
    />
  ),
  onSelect: (item) => ({
    value: `/${item.id} `,
    label: item.label,
    variant: "neutral",
  }),
};

interface ChatLandingAstryxProps {
  onSend: (text: string) => void;
  onUpload: (file: File) => void;
  disabled?: boolean;
  selectedProvider?: string | null;
  onProviderChange?: (provider: string) => void;
}

export default function ChatLandingAstryx({
  onSend,
  onUpload,
  disabled,
  selectedProvider = "openai",
  onProviderChange,
}: ChatLandingAstryxProps) {
  const [category, setCategory] = useState<string | null>("clinical");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [inputValue, setInputValue] = useState("");
  const composerInputRef = useRef<ChatComposerInputHandle>(null);
  const dictation = useChatDictation({ inputRef: composerInputRef });

  const suggestions = category ? CLINICAL_SUGGESTIONS[category] : null;

  const syncComposerValue = () => {
    document.activeElement?.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const applySuggestion = (prompt: string) => {
    setInputValue(prompt);
    const input = composerInputRef.current;
    if (!input) return;
    input.focus();
  };

  const handleSubmit = () => {
    if (disabled) return;
    if (attachments.length > 0) {
      attachments.forEach((file) => onUpload(file));
      setAttachments([]);
    }
    const text = (inputValue || composerInputRef.current?.getValue() || "").trim();
    if (text) {
      onSend(text);
      setInputValue("");
    }
  };

  const handleFiles = (files: File[]) => {
    if (files.length > 0) {
      const firstFile = files[0];
      if (firstFile) {
        onUpload(firstFile);
      }
    }
  };

  return (
    <Layout
      height="auto"
      contentWidth={760}
      padding={6}
      content={
        <LayoutContent>
          <VStack gap={6} vAlign="center" style={pageStyle}>
            <VStack gap={2} hAlign="center">
              <HStack gap={2} vAlign="center">
                <Icon icon={SparklesIcon} size="md" color="accent" />
                <Text type="large" as="h2" color="secondary">
                  AI-Powered Healthcare Intelligence
                </Text>
              </HStack>
              <Text type="display-2" as="h1">
                Smarter Insights. Better Decisions.
              </Text>
            </VStack>

            <ChatComposer
              onSubmit={handleSubmit}
              placeholder="Ask anything about patient records, diagnoses, or drop medical files..."
              input={
                <ChatComposerInput
                  handleRef={composerInputRef}
                  triggers={[mentionTrigger, commandTrigger]}
                  style={composerInput}
                  onFiles={handleFiles}
                  value={inputValue}
                  onChange={setInputValue}
                />
              }
              drawer={
                attachments.length > 0 ? (
                  <ChatComposerDrawer count={attachments.length}>
                    {attachments.map((file) => (
                      <Token
                        key={file.name}
                        label={file.name}
                        onRemove={() =>
                          setAttachments((prev) => prev.filter((f) => f.name !== file.name))
                        }
                      />
                    ))}
                  </ChatComposerDrawer>
                ) : undefined
              }
              headerActions={
                <HStack gap={1} vAlign="center">
                  <DropdownMenu
                    button={{
                      label: "Specialist",
                      variant: "ghost",
                      size: "sm",
                      icon: <Icon icon={AtSymbolIcon} size="sm" />,
                      isIconOnly: true,
                    }}
                    hasChevron={false}
                    menuWidth={240}
                  >
                    {MENTION_ITEMS.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        label={item.label}
                        description={item.auxiliaryData?.role}
                        onClick={() => {
                          composerInputRef.current?.insertToken({
                            value: `@${item.id}`,
                            label: item.label,
                            variant: "blue",
                          });
                          syncComposerValue();
                        }}
                      />
                    ))}
                  </DropdownMenu>

                  <DropdownMenu
                    button={{
                      label: "Command",
                      variant: "ghost",
                      size: "sm",
                      icon: <Icon icon={CommandLineIcon} size="sm" />,
                      isIconOnly: true,
                    }}
                    hasChevron={false}
                    menuWidth={240}
                  >
                    {COMMAND_ITEMS.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        label={item.label}
                        description={item.auxiliaryData?.desc}
                        onClick={() => {
                          composerInputRef.current?.insertText(`${item.label} `);
                          syncComposerValue();
                        }}
                      />
                    ))}
                  </DropdownMenu>
                </HStack>
              }
              footerActions={
                <DropdownMenu
                  button={{
                    label: selectedProvider ? selectedProvider.toUpperCase() : "AI Provider",
                    variant: "ghost",
                    size: "md",
                    icon: <Icon icon={SparklesIcon} size="sm" />,
                  }}
                  items={[
                    { label: "OpenAI (GPT-4o)", onClick: () => onProviderChange?.("openai") },
                    { label: "Anthropic (Claude 3.5)", onClick: () => onProviderChange?.("anthropic") },
                    { label: "Google (Gemini Pro)", onClick: () => onProviderChange?.("gemini") },
                    { label: "Mistral (Large)", onClick: () => onProviderChange?.("mistral") },
                  ]}
                />
              }
              sendActions={<ChatDictationButton dictation={dictation} />}
            />

            <VStack gap={4} style={categoriesStyle}>
              <ToggleButtonGroup
                label="Clinical Workflows"
                value={category}
                onChange={setCategory}
                size="lg"
              >
                {CATEGORIES.map((cat) => (
                  <ToggleButton
                    key={cat.key}
                    value={cat.key}
                    label={cat.label}
                    icon={<Icon icon={cat.icon} size="sm" />}
                  />
                ))}
              </ToggleButtonGroup>

              {suggestions && (
                <Grid columns={{ minWidth: 320 }} gap={3}>
                  {suggestions.map((suggestion) => (
                    <ClickableCard
                      key={suggestion.heading}
                      label={suggestion.heading}
                      variant="muted"
                      padding={3}
                      onClick={() => applySuggestion(suggestion.prompt)}
                    >
                      <VStack gap={0.5}>
                        <Heading level={4}>{suggestion.heading}</Heading>
                        <Text type="body" color="secondary" size="xsm">
                          {suggestion.body}
                        </Text>
                      </VStack>
                    </ClickableCard>
                  ))}
                </Grid>
              )}
            </VStack>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
