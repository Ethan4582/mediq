import { FileText, MoreHorizontal, Download, Share, MessageSquare, Copy } from "lucide-react";
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

interface SummaryCardProps {
  draft?: any;
  rawText?: string;
  fileName: string;
  pageCount: number;
  chunkCount: number;
  isFirst?: boolean;
}

export default function SummaryCard({
  draft,
  rawText = "",
  fileName,
  pageCount,
  chunkCount,
  isFirst
}: SummaryCardProps) {
  // Use draft if available, otherwise fallback to parsing rawText
  const parsed = draft || parseOcrText(rawText);

  // Safely extract fields with null-checks
  const principalDiagnosis = draft?.diagnoses?.principal_diagnosis 
    ?? parsed.diagnoses?.[0] 
    ?? "MISSING — clinician review required";
    
  const secondaryDiagnoses = draft?.diagnoses?.secondary_diagnoses 
    ?? parsed.diagnoses?.slice(1) 
    ?? [];
    
  const courseSummary = draft?.course?.summary 
    ?? parsed.course 
    ?? "Pending — clinician review required";
    
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

  const handleDownloadPdf = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Discharge Summary</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; padding: 40px; color: #111827; max-width: 800px; margin: 0 auto; }
            pre { white-space: pre-wrap; font-family: inherit; margin-top: 20px; }
            h2 { color: #2563eb; }
          </style>
        </head>
        <body>
          <h2>Discharge Summary (Draft)</h2>
          <hr />
          <pre>${rawText}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="w-full flex flex-col gap-6 text-[#111827]">
      <div className="flex items-center gap-3 bg-[#f4f6f8] p-3 rounded-lg border border-[var(--border-default)]">
        <FileText size={20} className="text-[#2563eb]" />
        <div className="flex-1">
          <p className="text-sm font-medium">{fileName}</p>
          <p className="text-xs text-[var(--text-secondary)]">{pageCount} pages • {chunkCount} extracted chunks</p>
        </div>
      </div>
      
      {isFirst && (
        <h1 className="text-[26px] font-extrabold tracking-tight text-[#111827] mb-2">
          Patient summary
        </h1>
      )}

      {/* Basic Info */}
      <div className="flex flex-col gap-1.5 text-[15px] leading-relaxed">
        <p><strong className="font-semibold text-[#111827]">Patient:</strong> <span className="text-[#374151]">Unknown</span></p>
        <p><strong className="font-semibold text-[#111827]">Admission Date:</strong> <span className="text-[#374151]">—</span></p>
        <p><strong className="font-semibold text-[#111827]">Discharge Date:</strong> <span className="text-[#374151]">—</span></p>
      </div>

      <div className="flex flex-col gap-2.5 text-[15px] leading-relaxed">
        <h2 className="text-[20px] font-bold text-[#111827] tracking-tight">Principal Diagnosis</h2>
        {principalDiagnosis ? (
           <p className="text-[#374151]">{principalDiagnosis}</p>
        ) : (
           <p className="text-[#6b7280] italic">Not found in document</p>
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
        {courseSummary ? (
          <p className="text-[#374151] whitespace-pre-wrap">{courseSummary}</p>
        ) : (
          <p className="text-[#6b7280] italic">Pending — clinician review required</p>
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

    </div>
  );
}
