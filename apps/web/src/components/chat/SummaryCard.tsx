import { FileText, MoreHorizontal, Download, Share, MessageSquare, Copy, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function parseOcrText(raw: string) {
  const sections: Record<string, string> = {}
  
  const normalized = raw.replace(/^#{1,6}\s*/gm, '')
  
  const sectionPatterns = [
    { key: 'diagnosis',    pattern: /DIAGNOSIS[:\s]+([\s\S]*?)(?=HISTORY|PAST HISTORY|PHYSICAL|$)/i },
    { key: 'history',      pattern: /(?:^|\n)HISTORY[:\s]+([\s\S]*?)(?=PAST HISTORY|PHYSICAL|$)/i },
    { key: 'pastHistory',  pattern: /PAST HISTORY[:\s]+([\s\S]*?)(?=PHYSICAL|EXAMINATION|$)/i },
    { key: 'examination',  pattern: /PHYSICAL EXAMINATION[:\s]+([\s\S]*?)(?=INVESTIGATIONS|$)/i },
    { key: 'investigations',pattern: /INVESTIGATIONS[:\s]+([\s\S]*?)(?=COURSE|$)/i },
    { key: 'course',       pattern: /COURSE IN THE HOSPITAL[:\s]+([\s\S]*?)(?=DISCHARGE|CONDITION|$)/i },
    { key: 'medications',  pattern: /(?:DISCHARGE )?MEDICATIONS?[:\s]+([\s\S]*?)(?=FOLLOW|ALLERGIES|$)/i },
    { key: 'followUp',     pattern: /FOLLOW[\s-]?UP[:\s]+([\s\S]*?)$/i },
  ]
  
  sectionPatterns.forEach(({ key, pattern }) => {
    const match = normalized.match(pattern)
    if (match) sections[key] = match[1].trim()
  })
  
  const diagnosisText = sections.diagnosis || ''
  const diagnoses = diagnosisText
    .split(/\n/)
    .map(d => d.replace(/^\d+[\)\.]\s*/, '').trim())
    .filter(d => d.length > 5)
  
  const vitalsMatch = (sections.examination || '').match(
    /PR[:\-]?([\d\/]+).*?BP[:\-]?([\d\/]+\s*mmHg).*?RR[:\-]?([\d\/]+).*?SP[O0]2[:\-]?([\d]+%[^,\n]*)/i
  )
  
  return {
    diagnoses,
    history: sections.history || null,
    pastHistory: sections.pastHistory || null,
    vitals: vitalsMatch ? {
      pr: vitalsMatch[1], bp: vitalsMatch[2],
      rr: vitalsMatch[3], spo2: vitalsMatch[4]
    } : null,
    examinationRaw: sections.examination || null,
    investigations: sections.investigations || null,
    course: sections.course || null,
    medications: sections.medications || null,
    followUp: sections.followUp || null,
  }
}

function isMissing(val: any) {
  if (!val) return true;
  if (typeof val === 'string') {
    return val === "—" || val.includes("MISSING") || val.includes("Pending");
  }
  return false;
}

function inferDocType(parsed: any, draft: any) {
  const v = draft?.vitals || parsed?.vitals;
  const m = draft?.medications || parsed?.medications;
  const l = draft?.investigations || parsed?.investigations;
  
  if (v) return "nursing document";
  if (m) return "discharge sheet";
  if (l) return "lab report";
  return "clinical document";
}

const AmberChip = () => (
  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[13px] font-medium w-fit">
    <AlertTriangle size={14} />
    Not documented
    <span className="text-amber-600/70 font-normal ml-1 border-l border-amber-200/60 pl-2">Not found in this document</span>
  </span>
);

interface SummaryCardProps {
  draft?: any;
  rawText?: string;
  fileName: string;
  pageCount: number;
  chunkCount: number;
  isFirst?: boolean;
  hideMetadata?: boolean;
}

export default function SummaryCard({
  draft,
  rawText = "",
  fileName,
  pageCount,
  chunkCount,
  isFirst,
  hideMetadata = false
}: SummaryCardProps) {
  // Use draft if available, otherwise fallback to parsing rawText
  const parsed = draft || parseOcrText(rawText);

  // Safely extract fields with null-checks
  const principalDiagnosis = draft?.diagnoses?.principal_diagnosis 
    ?? parsed.diagnoses?.[0] 
    ?? "MISSING";
    
  const secondaryDiagnoses = draft?.diagnoses?.secondary_diagnoses 
    ?? parsed.diagnoses?.slice(1) 
    ?? [];
    
  const courseSummary = draft?.course?.summary 
    ?? parsed.course 
    ?? "MISSING";
    
  const vitalsText = draft?.vitals 
    ? `PR: ${draft.vitals.pulse_rate}, BP: ${draft.vitals.blood_pressure}, RR: ${draft.vitals.respiratory_rate}, SpO2: ${draft.vitals.oxygen_saturation}`
    : parsed.vitals 
      ? `PR: ${parsed.vitals.pr}, BP: ${parsed.vitals.bp}, RR: ${parsed.vitals.rr}, SpO2: ${parsed.vitals.spo2}`
      : null;
      
  const examText = draft?.physical_examination ?? parsed.examinationRaw;
  const invText = draft?.investigations?.summary ?? parsed.investigations;
  const followUpText = draft?.follow_up?.instructions ?? parsed.followUp;
  
  const medsAdmit = draft?.medications?.admission ?? [];
  const medsDischarge = draft?.medications?.discharge ?? [];
  const medsText = draft?.medications 
    ? `Admission: ${medsAdmit.length} | Discharge: ${medsDischarge.length}` 
    : parsed.medications;

  const hasMinimalData = isMissing(principalDiagnosis) && isMissing(courseSummary);

  return (
    <div className="w-full flex flex-col gap-6 text-[#111827]">
      {!hideMetadata && (
        <div className="flex items-center gap-3 bg-[#f4f6f8] p-3 rounded-lg border border-[var(--border-default)]">
          <FileText size={20} className="text-[#2563eb]" />
          <div className="flex-1">
            <p className="text-sm font-medium">{fileName}</p>
            <p className="text-xs text-[var(--text-secondary)]">{pageCount} pages • {chunkCount} extracted chunks</p>
          </div>
        </div>
      )}
      
      {isFirst && (
        <h1 className="text-[26px] font-extrabold tracking-tight text-[#111827] mb-2">
          Patient summary
        </h1>
      )}

      {hasMinimalData ? (
        <div className="border-amber-200 bg-amber-50 rounded-2xl p-5 border">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-amber-600" size={20} />
            <h2 className="text-amber-800 font-medium text-lg">Limited clinical data extracted</h2>
          </div>
          <p className="text-amber-700/80 text-sm mb-5">
            This document appears to be a {inferDocType(parsed, draft)} — it may not contain all required discharge summary fields.
          </p>
          
          <div className="flex flex-col gap-3 mb-5">
            {vitalsText && (
              <p className="text-sm"><strong className="text-amber-900 font-semibold">Vitals:</strong> <span className="text-amber-800">{vitalsText}</span></p>
            )}
            {examText && (
              <p className="text-sm"><strong className="text-amber-900 font-semibold">Physical Exam:</strong> <span className="text-amber-800">{typeof examText === 'string' ? examText : JSON.stringify(examText)}</span></p>
            )}
            {invText && (
              <p className="text-sm"><strong className="text-amber-900 font-semibold">Investigations:</strong> <span className="text-amber-800">{typeof invText === 'string' ? invText : JSON.stringify(invText)}</span></p>
            )}
            {medsText && (
              <p className="text-sm"><strong className="text-amber-900 font-semibold">Medications:</strong> <span className="text-amber-800">{typeof medsText === 'string' ? medsText : JSON.stringify(medsText)}</span></p>
            )}
            {followUpText && (
              <p className="text-sm"><strong className="text-amber-900 font-semibold">Follow Up:</strong> <span className="text-amber-800">{typeof followUpText === 'string' ? followUpText : JSON.stringify(followUpText)}</span></p>
            )}
          </div>
          
          <div className="bg-white rounded-xl p-3 border border-amber-200/60 shadow-sm">
            <p className="text-amber-800 text-sm">
              <strong className="font-semibold">Tip:</strong> For a complete summary, upload all patient documents including discharge sheet, drug chart, and clinical notes.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Basic Info */}
          <div className="flex flex-col gap-2.5 text-[15px] leading-relaxed">
            <p className="flex items-center gap-2"><strong className="font-semibold text-[#111827] min-w-[120px]">Patient:</strong> <span className="text-[#374151]">Unknown</span></p>
            <div className="flex items-center gap-2"><strong className="font-semibold text-[#111827] min-w-[120px]">Admission Date:</strong> <AmberChip /></div>
            <div className="flex items-center gap-2"><strong className="font-semibold text-[#111827] min-w-[120px]">Discharge Date:</strong> <AmberChip /></div>
          </div>

          <div className="flex flex-col gap-2.5 text-[15px] leading-relaxed">
            <h2 className="text-[20px] font-bold text-[#111827] tracking-tight">Principal Diagnosis</h2>
            {isMissing(principalDiagnosis) ? (
               <AmberChip />
            ) : (
               <p className="text-[#374151]">{principalDiagnosis}</p>
            )}

            {secondaryDiagnoses && secondaryDiagnoses.length > 0 && (
              <div className="mt-4">
                <h3 className="text-[17px] font-semibold text-[#111827]">Secondary Diagnoses</h3>
                <ul className="list-disc pl-5 mt-2.5 space-y-2 text-[#374151] marker:text-[#2563eb]">
                  {secondaryDiagnoses.map((d: string, i: number) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5 text-[15px] leading-relaxed">
            <h2 className="text-[20px] font-bold text-[#111827] tracking-tight">Hospital Course</h2>
            {isMissing(courseSummary) ? (
              <AmberChip />
            ) : (
              <p className="text-[#374151] whitespace-pre-wrap">{courseSummary}</p>
            )}
          </div>

          {examText && (
            <div className="flex flex-col gap-2.5 text-[15px] leading-relaxed">
              <h2 className="text-[20px] font-bold text-[#111827] tracking-tight">Physical Examination</h2>
              {vitalsText && (
                <p className="text-[#374151] mb-1">
                  <strong className="font-semibold text-[#111827]">Vitals:</strong> {vitalsText}
                </p>
              )}
              <p className="text-[#374151] whitespace-pre-wrap">{typeof examText === 'string' ? examText : JSON.stringify(examText)}</p>
            </div>
          )}

          {invText && (
            <div className="flex flex-col gap-2.5 text-[15px] leading-relaxed">
              <h2 className="text-[20px] font-bold text-[#111827] tracking-tight">Investigations</h2>
              <p className="text-[#374151] whitespace-pre-wrap">{typeof invText === 'string' ? invText : JSON.stringify(invText)}</p>
            </div>
          )}

          {medsText && (
            <div className="flex flex-col gap-2.5 text-[15px] leading-relaxed">
              <h2 className="text-[20px] font-bold text-[#111827] tracking-tight">Medications</h2>
              <p className="text-[#374151] whitespace-pre-wrap">{typeof medsText === 'string' ? medsText : JSON.stringify(draft?.medications || medsText)}</p>
            </div>
          )}

          {followUpText && (
            <div className="flex flex-col gap-2.5 text-[15px] leading-relaxed">
              <h2 className="text-[20px] font-bold text-[#111827] tracking-tight">Follow-up</h2>
              <p className="text-[#374151] whitespace-pre-wrap">{typeof followUpText === 'string' ? followUpText : JSON.stringify(followUpText)}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

