"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { VStack, HStack, StackItem } from "@astryxdesign/core/Layout";
import { Text, Heading } from "@astryxdesign/core/Text";
import { Section } from "@astryxdesign/core/Section";
import { Markdown } from "@astryxdesign/core/Markdown";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { Toolbar } from "@astryxdesign/core/Toolbar";
import { ToggleButton, ToggleButtonGroup } from "@astryxdesign/core/ToggleButton";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import {
  ClipboardDocumentIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  ClockIcon,
  FolderIcon,
  PrinterIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { ClinicalDraft, OcrResultData } from "@/types/app";

const artifactScroll: CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "var(--spacing-6)",
};

const articleBody: CSSProperties = {
  maxWidth: 720,
  marginInline: "auto",
  width: "100%",
};

const conflictBox: CSSProperties = {
  padding: "var(--spacing-3)",
  borderRadius: 8,
  backgroundColor: "rgba(245, 158, 11, 0.08)",
  border: "1px solid rgba(245, 158, 11, 0.25)",
};

interface ArtifactDocument {
  id: string;
  name: string;
  page_count?: number;
  status?: string;
  created_at?: string;
  raw_text?: string;
}

interface ArtifactDraftSummary {
  id: string;
  session_id: string;
  created_at: string;
  content: string | ClinicalDraft;
}

interface ArtifactPanelAstryxProps {
  sessionId?: string;
  draft?: ClinicalDraft | null;
  ocrResult?: OcrResultData | null;
  onClose?: () => void;
  onSelectDraft?: (draft: ClinicalDraft) => void;
}

export default function ArtifactPanelAstryx({
  sessionId,
  draft,
  ocrResult,
  onClose,
  onSelectDraft,
}: ArtifactPanelAstryxProps) {
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [historyDrafts, setHistoryDrafts] = useState<ArtifactDraftSummary[]>([]);
  const [documents, setDocuments] = useState<ArtifactDocument[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedDocText, setSelectedDocText] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || sessionId === "new") return;

    let mounted = true;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const supabase = createClient();
        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();
        const token = authSession?.access_token;
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ""}/api/patient/${sessionId}/drafts`,
          { headers }
        );
        if (res.ok && mounted) {
          const data = (await res.json()) as ArtifactDraftSummary[];
          setHistoryDrafts(data);
        }

        const docRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ""}/api/patient/${sessionId}/documents`,
          { headers }
        );
        if (docRes.ok && mounted) {
          const docData = (await docRes.json()) as ArtifactDocument[];
          setDocuments(docData);
        }
      } catch (err: unknown) {
        console.error("Failed to load records history:", err);
      } finally {
        if (mounted) setLoadingHistory(false);
      }
    };

    fetchHistory();
    return () => {
      mounted = false;
    };
  }, [sessionId, draft]);

  const title =
    draft?.diagnoses?.principal_diagnosis ||
    ocrResult?.fileName ||
    "Clinical Discharge Summary";

  const rawTextContent = (() => {
    if (draft) {
      if (typeof draft === "string") return draft;
      let md = `# Discharge Summary

`;
      if (draft.patient_info) {
        md += `### Patient Information
`;
        Object.entries(draft.patient_info).forEach(([k, v]) => {
          md += `- **${k.replace(/_/g, " ")}**: ${String(v)}
`;
        });
        md += `
`;
      }
      if (draft.diagnoses) {
        md += `### Diagnoses
`;
        if (draft.diagnoses.principal_diagnosis) {
          md += `- **Principal**: ${draft.diagnoses.principal_diagnosis}
`;
        }
        if (draft.diagnoses.secondary_diagnoses?.length) {
          md += `- **Secondary**: ${draft.diagnoses.secondary_diagnoses.join(", ")}
`;
        }
        md += `
`;
      }
      if (draft.course?.summary) {
        md += `### Hospital Course
${draft.course.summary}

`;
      }
      if (draft.medications?.discharge?.length) {
        md += `### Discharge Medications
`;
        draft.medications.discharge.forEach((m) => {
          const dose = m.dosage || m.dose || "";
          md += `- **${m.name}** ${dose} ${m.route || ""} ${m.frequency || ""}
`;
        });
        md += `
`;
      }
      if (draft.follow_up?.instructions) {
        md += `### Follow-up Instructions
${draft.follow_up.instructions}

`;
      }
      return md;
    }
    return ocrResult?.rawText || "No document loaded yet.";
  })();

  const handleCopy = () => {
    navigator.clipboard.writeText(rawTextContent);
    toast.success("Copied to clipboard", {
      description: "Document contents copied.",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([rawTextContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "discharge_summary").replace(/[^a-zA-Z0-9]/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Document downloaded", {
      description: "Markdown file saved.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSelectHistoricalDraft = (item: ArtifactDraftSummary) => {
    try {
      const parsed: ClinicalDraft =
        typeof item.content === "string" ? JSON.parse(item.content) : item.content;
      onSelectDraft?.(parsed);
      setActiveTab("summary");
      toast.success("Loaded summary version", {
        description: `Loaded version from ${new Date(item.created_at).toLocaleTimeString()}`,
      });
    } catch {
      toast.error("Failed to parse summary");
    }
  };

  const conflicts = draft?.flags?.conflicting_fields || draft?.flags?.conflicts;

  return (
    <VStack height="100%" width="100%">
      <Toolbar
        label="Artifact navigation"
        dividers={["bottom"]}
        startContent={
          <HStack gap={2} vAlign="center">
            <Icon icon={DocumentTextIcon} size="sm" color="secondary" />
            <VStack gap={0}>
              <Text type="label" weight="semibold">
                {title}
              </Text>
              <Text type="supporting" color="secondary">
                {activeTab === "summary"
                  ? "Generated Summary"
                  : activeTab === "files"
                  ? "Source Documents"
                  : "Past Versions"}
              </Text>
            </VStack>
          </HStack>
        }
        endContent={
          <HStack gap={1} vAlign="center">
            <Button
              label="Copy"
              variant="ghost"
              size="sm"
              icon={<Icon icon={ClipboardDocumentIcon} size="sm" />}
              isIconOnly
              onClick={handleCopy}
            />
            <Button
              label="Download"
              variant="ghost"
              size="sm"
              icon={<Icon icon={ArrowDownTrayIcon} size="sm" />}
              isIconOnly
              onClick={handleDownload}
            />
            <Button
              label="Print"
              variant="ghost"
              size="sm"
              icon={<Icon icon={PrinterIcon} size="sm" />}
              isIconOnly
              onClick={handlePrint}
            />
            {onClose && (
              <Button
                label="Close document"
                variant="ghost"
                size="sm"
                icon={<Icon icon={XMarkIcon} size="sm" />}
                isIconOnly
                onClick={onClose}
              />
            )}
          </HStack>
        }
      />

      <HStack padding={3} vAlign="center" justify="between" style={{ borderBottom: "1px solid var(--border-subtle, rgba(0,0,0,0.08))" }}>
        <ToggleButtonGroup
          label="Artifact Views"
          value={activeTab}
          onChange={(val) => {
            if (val) setActiveTab(val);
          }}
          size="sm"
        >
          <ToggleButton
            value="summary"
            label="Summary"
            icon={<Icon icon={DocumentTextIcon} size="sm" />}
          />
          <ToggleButton
            value="files"
            label={`Files (${documents.length || (ocrResult ? 1 : 0)})`}
            icon={<Icon icon={FolderIcon} size="sm" />}
          />
          <ToggleButton
            value="history"
            label={`Past Runs (${historyDrafts.length})`}
            icon={<Icon icon={ClockIcon} size="sm" />}
          />
        </ToggleButtonGroup>
      </HStack>

      <Section variant="transparent" style={artifactScroll}>
        {activeTab === "summary" && (
          <VStack gap={4} style={articleBody}>
            <Heading level={2}>{title}</Heading>

            {draft?.flags && ((conflicts && conflicts.length > 0) || draft.flags.missing_fields?.length) ? (
              <VStack gap={2} style={conflictBox}>
                <HStack gap={2} vAlign="center">
                  <Icon icon={ExclamationTriangleIcon} size="sm" color="accent" />
                  <Text type="label" weight="semibold">
                    Clinical Reconciliation Warnings
                  </Text>
                </HStack>
                {conflicts?.map((f, i) => (
                  <Text key={i} type="supporting" color="secondary">
                    - Conflict in {f.field}: {f.description || `"${f.source_a || ""}" vs "${f.source_b || ""}"`}
                  </Text>
                ))}
                {draft.flags.missing_fields?.map((m, i) => (
                  <Text key={i} type="supporting" color="secondary">
                    - Missing field: {m}
                  </Text>
                ))}
              </VStack>
            ) : null}

            {draft?.medications?.discharge?.length ? (
              <VStack gap={2}>
                <Heading level={4}>Reconciled Medications</Heading>
                {draft.medications.discharge.map((med, idx) => (
                  <HStack key={idx} justify="between" padding={2} style={{ borderRadius: 6, backgroundColor: "rgba(0,0,0,0.03)" }}>
                    <Text type="body" weight="semibold">{med.name}</Text>
                    <Text type="supporting" color="secondary">{med.dosage || med.dose || ""} {med.route || ""} {med.frequency || ""}</Text>
                  </HStack>
                ))}
              </VStack>
            ) : null}

            <Markdown>{rawTextContent}</Markdown>
          </VStack>
        )}

        {activeTab === "files" && (
          <VStack gap={3} style={articleBody}>
            <Heading level={3}>Source Patient Documents</Heading>
            <Text type="supporting" color="secondary">
              Extracted via Mistral OCR with vector embeddings.
            </Text>

            {ocrResult && (
              <ClickableCard
                label={ocrResult.fileName}
                variant="muted"
                padding={3}
                onClick={() => setSelectedDocText(ocrResult.rawText)}
              >
                <HStack gap={3} vAlign="center">
                  <Icon icon={CheckCircleIcon} size="md" color="accent" />
                  <StackItem size="fill">
                    <VStack gap={0}>
                      <Text type="label" weight="semibold">{ocrResult.fileName}</Text>
                      <Text type="supporting" color="secondary">{ocrResult.pageCount} pages parsed</Text>
                    </VStack>
                  </StackItem>
                </HStack>
              </ClickableCard>
            )}

            {documents.map((doc) => (
              <ClickableCard
                key={doc.id}
                label={doc.name}
                variant="muted"
                padding={3}
                onClick={() => setSelectedDocText(doc.raw_text || "No text available")}
              >
                <HStack gap={3} vAlign="center">
                  <Icon icon={DocumentTextIcon} size="md" color="secondary" />
                  <StackItem size="fill">
                    <VStack gap={0}>
                      <Text type="label" weight="semibold">{doc.name}</Text>
                      <Text type="supporting" color="secondary">
                        {doc.page_count ? `${doc.page_count} pages` : "Document"} • {doc.status || "ready"}
                      </Text>
                    </VStack>
                  </StackItem>
                </HStack>
              </ClickableCard>
            ))}

            {selectedDocText && (
              <VStack gap={2} style={{ marginTop: 16 }}>
                <HStack justify="between" vAlign="center">
                  <Heading level={4}>Extracted OCR Content</Heading>
                  <Button
                    label="Close preview"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDocText(null)}
                  />
                </HStack>
                <Markdown>{selectedDocText}</Markdown>
              </VStack>
            )}
          </VStack>
        )}

        {activeTab === "history" && (
          <VStack gap={3} style={articleBody}>
            <Heading level={3}>Previously Generated Summaries</Heading>
            <Text type="supporting" color="secondary">
              Review and restore previous runs for this patient session.
            </Text>

            {loadingHistory && <Text type="body">Loading history...</Text>}

            {!loadingHistory && historyDrafts.length === 0 && (
              <Text type="body" color="secondary">
                No past summaries recorded yet for this session.
              </Text>
            )}

            {historyDrafts.map((item) => {
              const draftData =
                typeof item.content === "string" ? JSON.parse(item.content) : item.content;
              const heading =
                draftData?.diagnoses?.principal_diagnosis || "Discharge Summary Draft";
              return (
                <ClickableCard
                  key={item.id}
                  label={heading}
                  variant="muted"
                  padding={3}
                  onClick={() => handleSelectHistoricalDraft(item)}
                >
                  <HStack gap={3} vAlign="center">
                    <Icon icon={DocumentTextIcon} size="md" color="secondary" />
                    <StackItem size="fill">
                      <VStack gap={0}>
                        <Text type="label" weight="semibold">{heading}</Text>
                        <Text type="supporting" color="secondary">
                          Generated on {new Date(item.created_at).toLocaleString()}
                        </Text>
                      </VStack>
                    </StackItem>
                    <Button
                      label="View"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSelectHistoricalDraft(item)}
                    />
                  </HStack>
                </ClickableCard>
              );
            })}
          </VStack>
        )}
      </Section>
    </VStack>
  );
}
