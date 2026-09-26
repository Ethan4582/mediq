"use client";

import { useState, useMemo, type ReactNode } from "react";
import {
  Heart,
  Activity,
  AlertTriangle,
  FileText,
  Copy,
  Download,
  Stethoscope,
  Pill,
  Calendar,
  Layers,
  FlaskConical,
  ClipboardList,
  Syringe,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ClinicalDraft } from "@/types/app";

interface ClinicalSummaryViewProps {
  draft?: ClinicalDraft | null;
  rawText?: string;
  sourceName?: string;
  searchQuery?: string;
}

interface ParsedTable {
  headers: string[];
  rows: string[][];
}

type ParsedBlock =
  | { type: "text"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; table: ParsedTable }
  | { type: "kv"; pairs: { label: string; value: string }[] };

interface DocumentSection {
  title: string;
  iconType: "diagnosis" | "vitals" | "exam" | "investigation" | "course" | "nursing" | "procedure" | "meds" | "general";
  blocks: ParsedBlock[];
}

function cleanOcrText(text: string): string {
  if (!text) return "";

  let cleaned = text.replace(/!\[.*?\]\(.*?\)/g, "");

  cleaned = cleaned.replace(/\[\s*\{\s*"box_2d"[\s\S]*?"caption"\s*:\s*"/g, "");
  cleaned = cleaned.replace(/\[\s*\{\s*"box_2d"[\s\S]*?\}\s*\]/g, "");
  cleaned = cleaned.replace(/\{"box_2d"[\s\S]*?\}/g, "");
  cleaned = cleaned.replace(/\["\}\]/g, "");
  cleaned = cleaned.replace(/"\}\]/g, "");

  cleaned = cleaned.replace(/\r\n/g, "\n");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  return cleaned.trim();
}

function parseMarkdownTable(lines: string[]): ParsedTable | null {
  if (lines.length < 2) return null;

  const rowData: string[][] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.includes("|")) continue;

    if (/^\|?(\s*:?-+:?\s*\|?)+$/.test(trimmed)) {
      continue;
    }

    const cells = trimmed
      .split("|")
      .map((c) => c.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

    if (cells.length > 0) {
      rowData.push(cells);
    }
  }

  if (rowData.length === 0) return null;

  const maxCols = Math.max(...rowData.map((r) => r.length));
  const normalizedRows = rowData.map((r) => {
    while (r.length < maxCols) {
      r.push("");
    }
    return r;
  });

  const emptyCols = new Set<number>();
  for (let c = 0; c < maxCols; c++) {
    const allEmpty = normalizedRows.every((r) => !r[c] || r[c].trim() === "");
    if (allEmpty) emptyCols.add(c);
  }

  const prunedRows = normalizedRows.map((r) => r.filter((_, idx) => !emptyCols.has(idx)));

  if (prunedRows.length === 0 || prunedRows[0].length === 0) return null;

  const headers = prunedRows[0];
  const rows = prunedRows.slice(1);

  return { headers, rows };
}

function parseSectionContent(contentLines: string[]): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  let i = 0;

  while (i < contentLines.length) {
    const line = contentLines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    if (line.includes("|") && (i + 1 < contentLines.length && contentLines[i + 1].includes("|"))) {
      const tableLines: string[] = [];
      while (i < contentLines.length && contentLines[i].trim().includes("|")) {
        tableLines.push(contentLines[i]);
        i++;
      }
      const parsedTable = parseMarkdownTable(tableLines);
      if (parsedTable) {
        blocks.push({ type: "table", table: parsedTable });
        continue;
      }
    }

    if (/^(\d+\)|[-*•]|->)\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < contentLines.length && /^(\d+\)|[-*•]|->)\s+/.test(contentLines[i].trim())) {
        listItems.push(contentLines[i].trim().replace(/^(\d+\)|[-*•]|->)\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", items: listItems });
      continue;
    }

    if (line.includes(",") && (line.includes("-") || line.includes(":"))) {
      const chunks = line.split(",").map((c) => c.trim()).filter(Boolean);
      const isKvCandidate = chunks.every((chunk) => chunk.includes("-") || chunk.includes(":"));
      if (isKvCandidate && chunks.length >= 2) {
        const pairs = chunks.map((chunk) => {
          const delim = chunk.includes(":") ? ":" : "-";
          const [lbl, ...val] = chunk.split(delim);
          return { label: lbl.trim(), value: val.join(delim).trim() };
        });
        blocks.push({ type: "kv", pairs });
        i++;
        continue;
      }
    }

    const textLines: string[] = [line];
    i++;
    while (
      i < contentLines.length &&
      contentLines[i].trim() &&
      !contentLines[i].trim().includes("|") &&
      !/^(\d+\)|[-*•]|->)\s+/.test(contentLines[i].trim())
    ) {
      textLines.push(contentLines[i].trim());
      i++;
    }
    blocks.push({ type: "text", text: textLines.join(" ") });
  }

  return blocks;
}

function getIconForTitle(title: string): DocumentSection["iconType"] {
  const upper = title.toUpperCase();
  if (upper.includes("DIAGNOS") || upper.includes("ASSESSMENT")) return "diagnosis";
  if (upper.includes("VITAL") || upper.includes("DOPPLER") || upper.includes("HEMODYNAMIC")) return "vitals";
  if (upper.includes("EXAM") || upper.includes("PHYSICAL")) return "exam";
  if (upper.includes("INVESTIGAT") || upper.includes("LAB") || upper.includes("TEST")) return "investigation";
  if (upper.includes("COURSE") || upper.includes("HOSPITAL") || upper.includes("OBSERVATION")) return "course";
  if (upper.includes("NURS")) return "nursing";
  if (upper.includes("PROCEDURE") || upper.includes("ORDER")) return "procedure";
  if (upper.includes("MEDICAT") || upper.includes("DRUG") || upper.includes("PRESCRIPT")) return "meds";
  return "general";
}

export default function ClinicalSummaryView({
  draft,
  rawText = "",
  sourceName = "Clinical Document",
  searchQuery = "",
}: ClinicalSummaryViewProps) {
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted");

  const cleanedRaw = useMemo(() => cleanOcrText(rawText), [rawText]);

  const documentSections = useMemo((): DocumentSection[] => {
    if (!cleanedRaw) return [];

    const lines = cleanedRaw.split("\n");
    const sections: DocumentSection[] = [];

    let currentTitle = "Clinical Findings";
    let currentLines: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        if (currentLines.length > 0) {
          currentLines.push("");
        }
        continue;
      }

      const isHeaderCandidate =
        /^[A-Z0-9\s/_\-()]{3,}:$/.test(line) ||
        (/^[A-Z\s/_\-()]{4,}$/.test(line) && !line.includes("|") && line.length < 50);

      if (isHeaderCandidate) {
        if (currentLines.length > 0) {
          sections.push({
            title: currentTitle,
            iconType: getIconForTitle(currentTitle),
            blocks: parseSectionContent(currentLines),
          });
          currentLines = [];
        }
        currentTitle = line.replace(/:$/, "").trim();
      } else {
        currentLines.push(rawLine);
      }
    }

    if (currentLines.length > 0) {
      sections.push({
        title: currentTitle,
        iconType: getIconForTitle(currentTitle),
        blocks: parseSectionContent(currentLines),
      });
    }

    return sections;
  }, [cleanedRaw]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return documentSections;
    const q = searchQuery.toLowerCase();
    return documentSections.filter((sec) => {
      if (sec.title.toLowerCase().includes(q)) return true;
      return sec.blocks.some((b) => {
        if (b.type === "text") return b.text.toLowerCase().includes(q);
        if (b.type === "list") return b.items.some((item) => item.toLowerCase().includes(q));
        if (b.type === "kv") return b.pairs.some((p) => p.label.toLowerCase().includes(q) || p.value.toLowerCase().includes(q));
        if (b.type === "table") {
          return (
            b.table.headers.some((h) => h.toLowerCase().includes(q)) ||
            b.table.rows.some((row) => row.some((cell) => cell.toLowerCase().includes(q)))
          );
        }
        return false;
      });
    });
  }, [documentSections, searchQuery]);

  const copyToClipboard = () => {
    const content = cleanedRaw || (draft ? JSON.stringify(draft, null, 2) : "");
    navigator.clipboard.writeText(content);
    toast.success("Summary copied to clipboard");
  };

  const downloadReport = () => {
    const content = cleanedRaw || (draft ? JSON.stringify(draft, null, 2) : "");
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sourceName.replace(/[^a-zA-Z0-9]/g, "_")}_summary.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Summary report downloaded");
  };

  const renderSectionIcon = (type: DocumentSection["iconType"]): ReactNode => {
    switch (type) {
      case "diagnosis":
        return <Activity className="size-3.5 text-blue-600" />;
      case "vitals":
        return <Heart className="size-3.5 text-rose-500" />;
      case "exam":
        return <Stethoscope className="size-3.5 text-indigo-500" />;
      case "investigation":
        return <FlaskConical className="size-3.5 text-amber-500" />;
      case "course":
        return <Calendar className="size-3.5 text-blue-500" />;
      case "nursing":
        return <ClipboardList className="size-3.5 text-teal-600" />;
      case "procedure":
        return <Syringe className="size-3.5 text-purple-600" />;
      case "meds":
        return <Pill className="size-3.5 text-emerald-600" />;
      default:
        return <Layers className="size-3.5 text-primary" />;
    }
  };

  const documentTitle =
    draft?.diagnoses?.principal_diagnosis ||
    sourceName.replace(/\.[^/.]+$/, "") ||
    "Clinical Summary";

  const conflicts = draft?.flags?.conflicting_fields || draft?.flags?.conflicts;

  return (
    <div className="w-full">
      <div className="bg-card rounded-xl border border-border/80 shadow-xs p-5 sm:p-7 space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-4">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate">
              {documentTitle}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              Source: {sourceName}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60">
              <button
                type="button"
                onClick={() => setViewMode("formatted")}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  viewMode === "formatted"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Formatted
              </button>
              <button
                type="button"
                onClick={() => setViewMode("raw")}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  viewMode === "raw"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Raw Text
              </button>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer shadow-xs"
              title="Copy summary"
            >
              <Copy className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={downloadReport}
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer shadow-xs"
              title="Download summary"
            >
              <Download className="size-3.5" />
            </Button>
          </div>
        </div>

        {viewMode === "raw" ? (
          <div className="rounded-lg border border-border/70 bg-muted/30 p-4 font-mono text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {cleanedRaw || JSON.stringify(draft, null, 2)}
          </div>
        ) : (
          <div className="space-y-6">
            {draft && (
              <div className="space-y-5">
                {draft.diagnoses?.principal_diagnosis && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary border-b border-border/60 pb-1.5">
                      <Activity className="size-3.5 text-blue-600" />
                      <span>Principal Diagnosis</span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-foreground pt-1">
                      {draft.diagnoses.principal_diagnosis}
                    </p>
                    {draft.diagnoses.secondary_diagnoses && draft.diagnoses.secondary_diagnoses.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {draft.diagnoses.secondary_diagnoses.map((sec, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0.5 font-normal">
                            {sec}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {conflicts && conflicts.length > 0 && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                      <AlertTriangle className="size-3.5" />
                      <span>Reconciliation Alerts</span>
                    </div>
                    <div className="space-y-1 pl-5">
                      {conflicts.map((c, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          • {c.field}: {c.description || "Conflict detected in record values"}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {draft.medications?.discharge && draft.medications.discharge.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary border-b border-border/60 pb-1.5">
                      <Pill className="size-3.5 text-emerald-600" />
                      <span>Reconciled Medications</span>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-border/80 bg-muted/20">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border/70 bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase">
                            <th className="py-2 px-3">Medication</th>
                            <th className="py-2 px-3">Dosage</th>
                            <th className="py-2 px-3">Route</th>
                            <th className="py-2 px-3">Frequency</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {draft.medications.discharge.map((m, idx) => (
                            <tr key={idx} className="hover:bg-muted/30">
                              <td className="py-2 px-3 font-semibold text-foreground">{m.name}</td>
                              <td className="py-2 px-3 text-muted-foreground font-mono">{m.dosage || m.dose || "—"}</td>
                              <td className="py-2 px-3 text-muted-foreground">{m.route || "Oral"}</td>
                              <td className="py-2 px-3 text-muted-foreground">{m.frequency || "Daily"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {draft.course?.summary && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary border-b border-border/60 pb-1.5">
                      <Calendar className="size-3.5 text-blue-500" />
                      <span>Hospital Course</span>
                    </div>
                    <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap pt-1">
                      {draft.course.summary}
                    </p>
                  </div>
                )}

                {draft.follow_up?.instructions && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary border-b border-border/60 pb-1.5">
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                      <span>Follow-up & Instructions</span>
                    </div>
                    <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap pt-1">
                      {draft.follow_up.instructions}
                    </p>
                  </div>
                )}
              </div>
            )}

            {filteredSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary border-b border-border/60 pb-1.5">
                  {renderSectionIcon(section.iconType)}
                  <span>{section.title}</span>
                </div>

                <div className="space-y-2 pt-0.5">
                  {section.blocks.map((block, bIdx) => {
                    if (block.type === "text") {
                      return (
                        <p key={bIdx} className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                          {block.text}
                        </p>
                      );
                    }

                    if (block.type === "list") {
                      return (
                        <ul key={bIdx} className="space-y-1 text-xs text-foreground/90 pl-1">
                          {block.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-2">
                              <span className="text-primary font-bold text-[11px] leading-5 shrink-0">•</span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }

                    if (block.type === "kv") {
                      return (
                        <div key={bIdx} className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-1">
                          {block.pairs.map((pair, pIdx) => (
                            <div key={pIdx} className="p-2 rounded-lg bg-muted/40 border border-border/60">
                              <span className="text-[10px] text-muted-foreground uppercase block font-medium truncate">
                                {pair.label}
                              </span>
                              <span className="text-xs font-semibold text-foreground block truncate">
                                {pair.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    if (block.type === "table") {
                      return (
                        <div key={bIdx} className="overflow-x-auto my-2 rounded-lg border border-border/80 bg-muted/20">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-border/70 bg-muted/50 text-[11px] font-semibold text-muted-foreground">
                                {block.table.headers.map((h, hIdx) => (
                                  <th key={hIdx} className="py-2 px-3">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                              {block.table.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-muted/30 transition-colors">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="py-2 px-3 text-foreground/90 text-xs">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
            ))}

            {!draft && filteredSections.length === 0 && (
              <div className="py-12 text-center">
                <FileText className="size-8 text-muted-foreground/60 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  {searchQuery ? `No clinical sections matching "${searchQuery}"` : "No clinical summary available yet."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
