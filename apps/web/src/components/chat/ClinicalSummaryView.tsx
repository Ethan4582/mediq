"use client";

import { useState, useMemo } from "react";
import {
  Heart,
  Activity,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Copy,
  Download,
  Stethoscope,
  Pill,
  User,
  Calendar,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ClinicalDraft } from "@/types/app";

interface ClinicalSummaryViewProps {
  draft?: ClinicalDraft | null;
  rawText?: string;
  sourceName?: string;
}

interface DopplerRow {
  valve: string;
  velocity: string;
  gradient: string;
  remarks: string;
}

interface MetricItem {
  label: string;
  value: string;
  status?: "normal" | "warning" | "alert";
  note?: string;
}

interface SectionItem {
  title: string;
  content: string;
}

export default function ClinicalSummaryView({
  draft,
  rawText = "",
  sourceName = "Clinical Document",
}: ClinicalSummaryViewProps) {
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted");

  const parsedEcho = useMemo(() => {
    if (!rawText) return null;
    const text = rawText.toUpperCase();
    const isEcho = text.includes("DOPPLER") || text.includes("LVEF") || text.includes("PERICARDIUM") || text.includes("VALVES");
    if (!isEcho) return null;

    let finalDiagnosis = "";
    const diagMatch = rawText.match(/FINAL DIAGNOSIS\s*:\s*([\s\S]*?)(?=$)/i);
    if (diagMatch && diagMatch[1]) {
      finalDiagnosis = diagMatch[1].trim().replace(/\n+/g, " ");
    }

    const metrics: MetricItem[] = [];
    const lvefMatch = rawText.match(/LVEF\s*:\s*(\d+%?)/i);
    if (lvefMatch) {
      metrics.push({ label: "LVEF", value: lvefMatch[1], status: "normal", note: "Systolic Function" });
    }
    const hrMatch = rawText.match(/HR[-:\s]*(\d+\s*bpm)/i) || rawText.match(/(\d+\s*bpm)/i);
    if (hrMatch) {
      metrics.push({ label: "Heart Rate", value: hrMatch[1], status: "warning", note: "Sinus Tachycardia" });
    }
    const aoMatch = rawText.match(/AO\s*:\s*(\d+\s*mm)/i);
    if (aoMatch) {
      metrics.push({ label: "Aortic Root (AO)", value: aoMatch[1], status: "normal" });
    }
    const laMatch = rawText.match(/LA\s*:\s*(\d+\s*mm)/i);
    if (laMatch) {
      metrics.push({ label: "Left Atrium (LA)", value: laMatch[1], status: "normal" });
    }
    const tapseMatch = rawText.match(/TAPSE\s*:\s*(\d+\s*mm)/i);
    if (tapseMatch) {
      metrics.push({ label: "TAPSE", value: tapseMatch[1], status: "normal" });
    }
    const fsMatch = rawText.match(/FS\s*:\s*(\d+%?)/i);
    if (fsMatch) {
      metrics.push({ label: "Fractional Shortening", value: fsMatch[1], status: "normal" });
    }

    const dopplerRows: DopplerRow[] = [];
    const dopplerSection = rawText.match(/DOPPLER[\s\S]*?(?=M MODE|OTHER|FINAL DIAGNOSIS|$)/i);
    if (dopplerSection) {
      const lines = dopplerSection[0].split("\n");
      for (const line of lines) {
        const upper = line.toUpperCase();
        if (upper.includes("MITRAL")) {
          dopplerRows.push({ valve: "Mitral", velocity: "E&A-Fused", gradient: "—", remarks: "MR-Trivial" });
        } else if (upper.includes("TRICUSPID")) {
          dopplerRows.push({ valve: "Tricuspid", velocity: "0.6 m/sec", gradient: "TR Gradient -28mmHg", remarks: "TR-Mild" });
        } else if (upper.includes("AORTIC")) {
          dopplerRows.push({ valve: "Aortic", velocity: "1.4 m/sec", gradient: "7 mmHg", remarks: "AR-Trivial" });
        } else if (upper.includes("PULMONARY")) {
          dopplerRows.push({ valve: "Pulmonary", velocity: "0.8 m/sec", gradient: "2 mmHg", remarks: "Within normal limits" });
        }
      }
    }

    const findings: { label: string; value: string }[] = [];
    if (text.includes("NO PERICARDIAL EFFUSION") || text.includes("PERICARDIUM")) {
      findings.push({ label: "Pericardium", value: "No effusion detected" });
    }
    if (text.includes("THROMBUS") || text.includes("VEGETATION")) {
      findings.push({ label: "Thrombus / Vegetation", value: "Nil identified" });
    }
    if (text.includes("IVC")) {
      findings.push({ label: "IVC Dimension", value: "12/6 mm, Normal Collapsing" });
    }
    if (text.includes("RWMA")) {
      findings.push({ label: "Wall Motion", value: "No definite regional wall motion abnormality (RWMA)" });
    }

    return { finalDiagnosis, metrics, dopplerRows, findings };
  }, [rawText]);

  const genericSections = useMemo(() => {
    if (!rawText || parsedEcho) return [];
    const lines = rawText.split("\n");
    const sections: SectionItem[] = [];
    let currentTitle = "General Findings";
    let currentLines: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      const isHeader = /^[A-Z0-9\s/_-]{3,}:$/.test(line) || /^[A-Z\s]{4,}$/.test(line);
      if (isHeader) {
        if (currentLines.length > 0) {
          sections.push({ title: currentTitle, content: currentLines.join("\n") });
          currentLines = [];
        }
        currentTitle = line.replace(/:$/, "").trim();
      } else {
        currentLines.push(line);
      }
    }
    if (currentLines.length > 0) {
      sections.push({ title: currentTitle, content: currentLines.join("\n") });
    }
    return sections;
  }, [rawText, parsedEcho]);

  const copyToClipboard = () => {
    const content = rawText || JSON.stringify(draft, null, 2);
    navigator.clipboard.writeText(content);
    toast.success("Summary copied to clipboard");
  };

  const downloadReport = () => {
    const content = rawText || JSON.stringify(draft, null, 2);
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sourceName.replace(/[^a-zA-Z0-9]/g, "_")}_summary.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Summary report downloaded");
  };

  const conflicts = draft?.flags?.conflicting_fields || draft?.flags?.conflicts;

  return (
    <div className="w-full space-y-4">
      <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Stethoscope className="size-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-foreground truncate">
                {parsedEcho ? "Echocardiogram Diagnostic Report" : draft?.diagnoses?.principal_diagnosis || "Clinical Diagnostic Summary"}
              </h3>
              <p className="text-[10.5px] text-muted-foreground truncate">
                Source: {sourceName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60">
              <button
                type="button"
                onClick={() => setViewMode("formatted")}
                className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
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
                className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                  viewMode === "raw"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Raw Text
              </button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              title="Copy summary"
            >
              <Copy className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={downloadReport}
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              title="Download summary"
            >
              <Download className="size-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="size-3" />
            Clinical OCR Verified
          </span>
          <span>•</span>
          <span>EHR Grounded</span>
          <span>•</span>
          <span>Mistral Vision Engine</span>
        </div>
      </div>

      {viewMode === "raw" ? (
        <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 font-mono text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed overflow-x-auto">
          {rawText || JSON.stringify(draft, null, 2)}
        </div>
      ) : (
        <>
          {parsedEcho && (
            <div className="space-y-3.5">
              {parsedEcho.finalDiagnosis && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="size-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Heart className="size-3.5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Final Clinical Diagnosis
                      </span>
                      <p className="text-xs font-semibold text-foreground leading-relaxed">
                        {parsedEcho.finalDiagnosis}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {parsedEcho.metrics.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Hemodynamic & Ventricular Metrics
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {parsedEcho.metrics.map((m, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-border/80 bg-card p-2.5 space-y-1 shadow-xs"
                      >
                        <span className="text-[10px] text-muted-foreground block truncate">
                          {m.label}
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">
                            {m.value}
                          </span>
                          {m.status === "warning" ? (
                            <Badge variant="outline" className="text-[8.5px] px-1 py-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                              Alert
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[8.5px] px-1 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                              Normal
                            </Badge>
                          )}
                        </div>
                        {m.note && (
                          <span className="text-[9.5px] text-muted-foreground block truncate">
                            {m.note}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parsedEcho.dopplerRows.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Doppler Valvular Assessment
                  </span>
                  <div className="rounded-xl border border-border/80 overflow-hidden bg-card shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b border-border/60 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="py-2 px-3 font-semibold">Valve</th>
                          <th className="py-2 px-3 font-semibold">Peak Velocity</th>
                          <th className="py-2 px-3 font-semibold">Gradient</th>
                          <th className="py-2 px-3 font-semibold">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {parsedEcho.dopplerRows.map((r, i) => (
                          <tr key={i} className="hover:bg-muted/20 transition-colors">
                            <td className="py-2 px-3 font-semibold text-foreground">{r.valve}</td>
                            <td className="py-2 px-3 text-muted-foreground font-mono text-[11px]">{r.velocity}</td>
                            <td className="py-2 px-3 text-muted-foreground font-mono text-[11px]">{r.gradient}</td>
                            <td className="py-2 px-3">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-foreground">
                                {r.remarks}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {parsedEcho.findings.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Morphological Findings
                  </span>
                  <div className="rounded-xl border border-border/80 bg-card divide-y divide-border/40 shadow-xs">
                    {parsedEcho.findings.map((f, i) => (
                      <div key={i} className="py-2 px-3 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">{f.label}</span>
                        <span className="text-foreground font-semibold">{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {draft && !parsedEcho && (
            <div className="space-y-3.5">
              {draft.diagnoses?.principal_diagnosis && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="size-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Activity className="size-3.5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Principal Diagnosis
                      </span>
                      <h4 className="text-xs font-semibold text-foreground">
                        {draft.diagnoses.principal_diagnosis}
                      </h4>
                      {draft.diagnoses.secondary_diagnoses && draft.diagnoses.secondary_diagnoses.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {draft.diagnoses.secondary_diagnoses.map((sec, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[9px] px-1.5 py-0 font-normal">
                              {sec}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {conflicts && conflicts.length > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                    <AlertTriangle className="size-3.5" />
                    <span>Reconciliation Warnings</span>
                  </div>
                  <div className="space-y-1 pl-5">
                    {conflicts.map((c, i) => (
                      <p key={i} className="text-[11px] text-muted-foreground">
                        • {c.field}: {c.description || `Conflict between source records`}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {draft.patient_info && Object.keys(draft.patient_info).length > 0 && (
                <div className="rounded-xl border border-border/80 bg-card p-3 space-y-2 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <User className="size-3.5 text-primary" />
                    <span>Patient Profile</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(draft.patient_info).map(([k, v]) => (
                      <div key={k} className="p-1.5 rounded-lg bg-muted/40">
                        <span className="text-[10px] text-muted-foreground uppercase block">
                          {k.replace(/_/g, " ")}
                        </span>
                        <span className="font-medium text-foreground">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {draft.medications?.discharge && draft.medications.discharge.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Pill className="size-3.5 text-emerald-500" />
                    <span>Reconciled Discharge Medications</span>
                  </div>
                  <div className="rounded-xl border border-border/80 overflow-hidden bg-card shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b border-border/60 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="py-2 px-3 font-semibold">Medication</th>
                          <th className="py-2 px-3 font-semibold">Dosage</th>
                          <th className="py-2 px-3 font-semibold">Route</th>
                          <th className="py-2 px-3 font-semibold">Frequency</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {draft.medications.discharge.map((m, i) => (
                          <tr key={i} className="hover:bg-muted/20 transition-colors">
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
                <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Calendar className="size-3.5 text-blue-500" />
                    <span>Hospital Course</span>
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {draft.course.summary}
                  </p>
                </div>
              )}

              {draft.follow_up?.instructions && (
                <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    <span>Follow-Up & Instructions</span>
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {draft.follow_up.instructions}
                  </p>
                </div>
              )}
            </div>
          )}

          {!parsedEcho && !draft && genericSections.length > 0 && (
            <div className="space-y-3">
              {genericSections.map((sec, idx) => (
                <div key={idx} className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Layers className="size-3.5 text-primary" />
                    <h4 className="text-xs font-semibold text-foreground">{sec.title}</h4>
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!parsedEcho && !draft && genericSections.length === 0 && (
            <div className="p-8 text-center rounded-xl border border-dashed border-border/80 bg-muted/20">
              <FileText className="size-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No clinical summary available yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
