import { FileText, MoreHorizontal, Info } from "lucide-react";
import FlagChip from "./FlagChip";
import type { DraftContent } from "@/types/app";

interface SummaryCardProps {
  draft: DraftContent;
  patientName?: string;
  sourceCount?: number;
}

export default function SummaryCard({
  draft,
  patientName = "Unknown Patient",
  sourceCount = 0,
}: SummaryCardProps) {
  const admission = draft.sections.find((s) => s.section_type === "admission");
  const diagnosis = draft.sections.find((s) => s.section_type === "diagnosis");
  const course = draft.sections.find((s) => s.section_type === "hospital_course");

  return (
    <div
      className="rounded-xl border overflow-hidden max-w-[680px]"
      style={{
        borderColor: "var(--card-border)",
        boxShadow: "var(--card-shadow)",
        background: "var(--card-bg)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div className="flex items-center gap-2">
          <FileText size={16} style={{ color: "var(--brand-primary)" }} />
          <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
            Discharge Summary (Draft)
          </span>
        </div>
        <button style={{ color: "var(--text-muted)" }}>
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Three-column grid */}
      <div className="grid grid-cols-3 divide-x" style={{ borderColor: "var(--border-default)" }}>
        {/* Col 1: Patient / Dates */}
        <div className="px-5 py-4 space-y-3">
          <div>
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Patient</p>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{patientName}</p>
          </div>
          {admission?.fields.admission_date && (
            <div>
              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Admission Date</p>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {String(admission.fields.admission_date)}
              </p>
            </div>
          )}
          {admission?.fields.discharge_date && (
            <div>
              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Discharge Date</p>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {String(admission.fields.discharge_date)}
              </p>
            </div>
          )}
        </div>

        {/* Col 2: Diagnosis */}
        <div className="px-5 py-4 space-y-3">
          {diagnosis?.fields.principal && (
            <div>
              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Principal Diagnosis</p>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {String(diagnosis.fields.principal)}
              </p>
            </div>
          )}
          {Array.isArray(diagnosis?.fields.secondary) && (
            <div>
              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Secondary Diagnoses</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {(diagnosis!.fields.secondary as string[]).map((d, i) => (
                  <li key={i} className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Col 3: Hospital Course */}
        <div className="px-5 py-4">
          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Hospital Course</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {course?.fields.summary
              ? String(course.fields.summary)
              : "No hospital course details provided."}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-5 py-3 border-t"
        style={{
          borderColor: "var(--border-default)",
          background: "var(--bg-secondary)",
        }}
      >
        <div className="flex items-center gap-3">
          <FlagChip type="confidence" label="Confidence: High" />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Sources: {sourceCount} documents
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          Review required
          <Info size={12} className="ml-1" />
        </div>
      </div>
    </div>
  );
}
