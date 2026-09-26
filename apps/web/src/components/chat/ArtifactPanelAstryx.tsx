"use client";

import { useState, useEffect, useRef, useMemo, type CSSProperties } from "react";
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
  PlusIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { Sparkles, FileUp, FileText, Layers, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { ClinicalDraft, OcrResultData } from "@/types/app";
import DocumentThumbnailCard from "./DocumentThumbnailCard";
import AddRawNoteDialog from "./AddRawNoteDialog";
import ShareSessionDialog from "./ShareSessionDialog";

const artifactScroll: CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "var(--spacing-4, 16px)",
};

const articleBody: CSSProperties = {
  maxWidth: 760,
  marginInline: "auto",
  width: "100%",
};

const conflictBox: CSSProperties = {
  padding: "var(--spacing-3, 12px)",
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
  onUpload?: (file: File) => void;
  isUploading?: boolean;
}

export default function ArtifactPanelAstryx({
  sessionId,
  draft,
  ocrResult,
  onClose,
  onSelectDraft,
  onUpload,
  isUploading = false,
}: ArtifactPanelAstryxProps) {
  const [activeTab, setActiveTab] = useState<string>("content");
  const [historyDrafts, setHistoryDrafts] = useState<ArtifactDraftSummary[]>([]);
  const [documents, setDocuments] = useState<ArtifactDocument[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedDocText, setSelectedDocText] = useState<string | null>(null);
  const [selectedDocName, setSelectedDocName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const allDocumentsList = useMemo(() => {
    const list: ArtifactDocument[] = [...documents];
    if (ocrResult && !list.some((d) => d.name === ocrResult.fileName)) {
      list.unshift({
        id: "current-ocr",
        name: ocrResult.fileName,
        page_count: ocrResult.pageCount,
        status: "ready",
        created_at: new Date().toISOString(),
        raw_text: ocrResult.rawText,
      });
    }
    return list;
  }, [documents, ocrResult]);

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return allDocumentsList;
    const q = searchQuery.toLowerCase();
    return allDocumentsList.filter((d) => d.name.toLowerCase().includes(q));
  }, [allDocumentsList, searchQuery]);

  const filteredDrafts = useMemo(() => {
    if (!searchQuery.trim()) return historyDrafts;
    const q = searchQuery.toLowerCase();
    return historyDrafts.filter((item) => {
      const contentStr = typeof item.content === "string" ? item.content : JSON.stringify(item.content);
      return contentStr.toLowerCase().includes(q);
    });
  }, [historyDrafts, searchQuery]);

  const title =
    draft?.diagnoses?.principal_diagnosis ||
    ocrResult?.fileName ||
    "Clinical Discharge Summary";

  const rawTextContent = (() => {
    if (draft) {
      if (typeof draft === "string") return draft;
      let md = `# Discharge Summary\n\n`;
      if (draft.patient_info) {
        md += `### Patient Information\n`;
        Object.entries(draft.patient_info).forEach(([k, v]) => {
          md += `- **${k.replace(/_/g, " ")}**: ${String(v)}\n`;
        });
        md += `\n`;
      }
      if (draft.diagnoses) {
        md += `### Diagnoses\n`;
        if (draft.diagnoses.principal_diagnosis) {
          md += `- **Principal**: ${draft.diagnoses.principal_diagnosis}\n`;
        }
        if (draft.diagnoses.secondary_diagnoses?.length) {
          md += `- **Secondary**: ${draft.diagnoses.secondary_diagnoses.join(", ")}\n`;
        }
        md += `\n`;
      }
      if (draft.course?.summary) {
        md += `### Hospital Course\n${draft.course.summary}\n\n`;
      }
      if (draft.medications?.discharge?.length) {
        md += `### Discharge Medications\n`;
        draft.medications.discharge.forEach((m) => {
          const dose = m.dosage || m.dose || "";
          md += `- **${m.name}** ${dose} ${m.route || ""} ${m.frequency || ""}\n`;
        });
        md += `\n`;
      }
      if (draft.follow_up?.instructions) {
        md += `### Follow-up Instructions\n${draft.follow_up.instructions}\n\n`;
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
      e.target.value = "";
    }
  };

  const conflicts = draft?.flags?.conflicting_fields || draft?.flags?.conflicts;

  return (
    <VStack height="100%" width="100%">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <Toolbar
        label="Artifact navigation"
        dividers={["bottom"]}
        startContent={
          <HStack gap={2} vAlign="center">
            <div className="size-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Icon icon={DocumentTextIcon} size="sm" />
            </div>
            <VStack gap={0}>
              <Text type="label" weight="semibold">
                Project content
              </Text>
              <Text type="supporting" color="secondary">
                {allDocumentsList.length} asset{allDocumentsList.length === 1 ? "" : "s"} • {historyDrafts.length} summar{historyDrafts.length === 1 ? "y" : "ies"}
              </Text>
            </VStack>
          </HStack>
        }
        endContent={
          <HStack gap={1} vAlign="center">
            <Button
              label="Share"
              variant="ghost"
              size="sm"
              icon={<Icon icon={ShareIcon} size="sm" />}
              isIconOnly
              onClick={() => setIsShareDialogOpen(true)}
            />
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

      <div className="px-3 py-2 border-b border-border/80 flex flex-col gap-2 bg-background/50">
        <HStack justify="between" vAlign="center">
          <ToggleButtonGroup
            label="Artifact Views"
            value={activeTab}
            onChange={(val) => {
              if (val) setActiveTab(val);
            }}
            size="sm"
          >
            <ToggleButton
              value="content"
              label="Content"
              icon={<Icon icon={Squares2X2Icon} size="sm" />}
            />
            <ToggleButton
              value="summary"
              label="Summary"
              icon={<Icon icon={DocumentTextIcon} size="sm" />}
            />
            <ToggleButton
              value="files"
              label={`OCR (${allDocumentsList.length})`}
              icon={<Icon icon={FolderIcon} size="sm" />}
            />
            <ToggleButton
              value="history"
              label={`Past Runs (${historyDrafts.length})`}
              icon={<Icon icon={ClockIcon} size="sm" />}
            />
          </ToggleButtonGroup>
        </HStack>

        <div className="relative w-full">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Icon icon={MagnifyingGlassIcon} size="sm" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets, documents & summaries..."
            className="w-full bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border rounded-lg pl-8 pr-3 py-1 text-xs text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </div>
      </div>

      <Section variant="transparent" style={artifactScroll}>
        {activeTab === "content" && (
          <VStack gap={5} style={articleBody}>
            <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Layers className="size-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">Clinical Session</h3>
                    <p className="text-[11px] text-muted-foreground">Created by you • Active Session</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="size-3.5" />
                  <span>HIPAA Grounded</span>
                </div>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-border/90 hover:border-primary/60 hover:bg-primary/5 rounded-xl p-6 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center"
              >
                <div className="relative mb-3 flex items-center justify-center">
                  <div className="size-10 rounded-lg bg-muted/80 border border-border flex items-center justify-center -rotate-6 shadow-xs group-hover:-rotate-12 transition-transform">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>
                  <div className="size-10 rounded-lg bg-card border border-border flex items-center justify-center z-10 shadow-xs group-hover:scale-105 transition-transform">
                    <FileUp className="size-5 text-primary" />
                  </div>
                  <div className="size-10 rounded-lg bg-muted/80 border border-border flex items-center justify-center rotate-6 shadow-xs group-hover:rotate-12 transition-transform">
                    <Sparkles className="size-5 text-amber-500" />
                  </div>
                  <div className="absolute -top-1 -right-1 size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                    <Icon icon={PlusIcon} size="sm" />
                  </div>
                </div>

                <h4 className="text-xs font-semibold text-foreground mb-1">
                  Add PDFs, documents, or other text to reference in this project.
                </h4>
                <p className="text-[11px] text-muted-foreground max-w-sm mb-3">
                  Upload patient charts, doctor handwriting, lab panels, or paste EHR text notes directly.
                </p>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-xs"
                  >
                    <FileUp className="size-3.5" />
                    <span>{isUploading ? "Uploading..." : "Upload Files"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNoteDialogOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-medium border border-border transition-colors shadow-xs"
                  >
                    <Icon icon={PlusIcon} size="sm" />
                    <span>Paste Raw Note</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Content
                  </h3>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-muted font-medium text-foreground">
                    {filteredDocuments.length}
                  </span>
                </div>
                {filteredDocuments.length > 0 && (
                  <span className="text-[11px] text-muted-foreground">Click to inspect OCR</span>
                )}
              </div>

              {filteredDocuments.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-border/80 bg-muted/20">
                  <p className="text-xs text-muted-foreground">No documents uploaded to this session yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                  {filteredDocuments.map((doc, idx) => (
                    <DocumentThumbnailCard
                      key={doc.id || idx}
                      id={doc.id}
                      name={doc.name}
                      pageCount={doc.page_count}
                      status={doc.status}
                      createdAt={doc.created_at}
                      rawText={doc.raw_text}
                      index={idx}
                      onSelect={() => {
                        setSelectedDocText(doc.raw_text || ocrResult?.rawText || "No raw text extracted");
                        setSelectedDocName(doc.name);
                        setActiveTab("files");
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Generated Summaries
                  </h3>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-muted font-medium text-foreground">
                    {filteredDrafts.length || (draft ? 1 : 0)}
                  </span>
                </div>
              </div>

              {draft && (
                <div
                  onClick={() => setActiveTab("summary")}
                  className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer space-y-2 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
                        <Sparkles className="size-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-foreground">
                          {draft.diagnoses?.principal_diagnosis || "Current Discharge Draft"}
                        </h4>
                        <p className="text-[10px] text-muted-foreground">Active Clinical Summary</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                      Latest Draft
                    </span>
                  </div>

                  {conflicts && conflicts.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md">
                      <ExclamationTriangleIcon className="size-3.5 shrink-0" />
                      <span>{conflicts.length} clinical conflict{conflicts.length > 1 ? "s" : ""} flagged</span>
                    </div>
                  )}
                </div>
              )}

              {filteredDrafts.map((item) => {
                const draftData: ClinicalDraft =
                  typeof item.content === "string" ? JSON.parse(item.content) : item.content;
                const heading =
                  draftData?.diagnoses?.principal_diagnosis || "Discharge Summary Draft";
                const isCurrent = draftData?.diagnoses?.principal_diagnosis === draft?.diagnoses?.principal_diagnosis;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectHistoricalDraft(item)}
                    className="p-3 rounded-xl border border-border/80 bg-card hover:bg-muted/40 transition-colors cursor-pointer space-y-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-foreground truncate max-w-[220px]">
                        {heading}
                      </h4>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{draftData?.medications?.discharge?.length || 0} medications reconciled</span>
                      {isCurrent ? (
                        <span className="text-emerald-500 font-medium">Selected</span>
                      ) : (
                        <span className="text-primary hover:underline">Click to load</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </VStack>
        )}

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
            <div className="flex items-center justify-between">
              <div>
                <Heading level={3}>Source Patient Documents</Heading>
                <Text type="supporting" color="secondary">
                  Extracted via Mistral OCR with vector embeddings.
                </Text>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                <PlusIcon className="size-3.5" />
                <span>Upload</span>
              </button>
            </div>

            {filteredDocuments.map((doc) => (
              <ClickableCard
                key={doc.id}
                label={doc.name}
                variant="muted"
                padding={3}
                onClick={() => {
                  setSelectedDocText(doc.raw_text || "No text available");
                  setSelectedDocName(doc.name);
                }}
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
                  <CheckCircle2 className="size-4 text-emerald-500" />
                </HStack>
              </ClickableCard>
            ))}

            {selectedDocText && (
              <VStack gap={2} style={{ marginTop: 16 }}>
                <HStack justify="between" vAlign="center">
                  <Heading level={4}>{selectedDocName ? `OCR: ${selectedDocName}` : "Extracted OCR Content"}</Heading>
                  <Button
                    label="Close preview"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDocText(null);
                      setSelectedDocName(null);
                    }}
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

            {!loadingHistory && filteredDrafts.length === 0 && (
              <Text type="body" color="secondary">
                No past summaries recorded yet for this session.
              </Text>
            )}

            {filteredDrafts.map((item) => {
              const draftData: ClinicalDraft =
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
                          Generated on {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                        </Text>
                      </VStack>
                    </StackItem>
                  </HStack>
                </ClickableCard>
              );
            })}
          </VStack>
        )}
      </Section>

      <AddRawNoteDialog
        isOpen={isNoteDialogOpen}
        onOpenChange={setIsNoteDialogOpen}
        onUploadNote={(file) => {
          if (onUpload) onUpload(file);
        }}
      />

      <ShareSessionDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        session={null}
        draft={draft || null}
        documentCount={allDocumentsList.length}
      />
    </VStack>
  );
}
