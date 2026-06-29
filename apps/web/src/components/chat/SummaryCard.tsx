import { FileText, MoreHorizontal, Info, ChevronDown, Activity, FlaskConical, Pill, Calendar } from "lucide-react";
import { useState } from "react";

// Parse raw OCR text into structured sections
function parseOcrText(raw: string) {
  const sections: Record<string, string> = {}
  
  // Split on section headers (handles # prefix from Mistral and plain CAPS headers)
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
  
  // Extract diagnoses as array (numbered list or newline separated)
  const diagnosisText = sections.diagnosis || ''
  const diagnoses = diagnosisText
    .split(/\n/)
    .map(d => d.replace(/^\d+[\)\.]\s*/, '').trim())
    .filter(d => d.length > 5)
  
  // Extract vitals from examination
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
  rawText: string
  fileName: string
  pageCount: number
  chunkCount: number
}

function ExpandableSection({ 
  icon: Icon, 
  title, 
  children 
}: { 
  icon: any, 
  title: string, 
  children: React.ReactNode 
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-t border-[#f0f2f5]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#f9fafb] text-sm font-medium text-[#374151] transition-colors"
      >
        <span className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#6b7280]" />
          {title}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#9ca3af] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-5 pb-4 text-sm text-[#374151] leading-relaxed border-t border-[#f0f2f5] pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

export default function SummaryCard({
  rawText,
  fileName,
  pageCount,
  chunkCount
}: SummaryCardProps) {
  const parsed = parseOcrText(rawText);

  return (
    <div className="rounded-2xl border border-[#e5e7eb] shadow-[0_1px_4px_rgba(0,0,0,0.08)] bg-white overflow-hidden w-full">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f2f5]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#2563eb]" />
          <span className="text-sm font-semibold text-[#111827]">
            Discharge Summary (Draft)
          </span>
        </div>
        <button className="w-8 h-8 rounded-lg hover:bg-[#f4f6f8] flex items-center justify-center text-[#9ca3af]">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 divide-x divide-[#f0f2f5]">
        
        {/* Col 1 */}
        <div className="px-5 py-5 space-y-4">
          <div>
            <p className="text-xs text-[#9ca3af] font-medium mb-1">Patient</p>
            <p className="text-sm font-semibold text-[#111827]">Unknown</p>
          </div>
          <div>
            <p className="text-xs text-[#9ca3af] font-medium mb-1">Admission Date</p>
            <p className="text-sm font-semibold text-[#111827]">—</p>
          </div>
          <div>
            <p className="text-xs text-[#9ca3af] font-medium mb-1">Discharge Date</p>
            <p className="text-sm font-semibold text-[#111827]">—</p>
          </div>
        </div>

        {/* Col 2 */}
        <div className="px-5 py-5">
          <p className="text-xs text-[#9ca3af] font-medium mb-1">Principal Diagnosis</p>
          {parsed.diagnoses.length > 0 ? (
             <p className="text-sm font-semibold text-[#111827] leading-snug">
               {parsed.diagnoses[0]}
             </p>
          ) : (
             <p className="text-sm text-[#d1d5db] italic text-[13px]">Not found in document</p>
          )}

          {parsed.diagnoses.length > 1 && (
            <>
              <p className="text-xs text-[#9ca3af] font-medium mt-4 mb-2">Secondary Diagnoses</p>
              <ul className="space-y-1">
                {parsed.diagnoses.slice(1).map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#374151]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9ca3af] mt-1.5 shrink-0"/>
                    {d}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Col 3 */}
        <div className="px-5 py-5">
          <p className="text-xs text-[#9ca3af] font-medium mb-1">Hospital Course</p>
          {parsed.course ? (
            <p className="text-sm text-[#374151] leading-relaxed line-clamp-6">
              {parsed.course}
            </p>
          ) : (
            <p className="text-sm text-[#9ca3af] italic">Pending — clinician review required</p>
          )}
        </div>
      </div>

      {/* Expandable Sections */}
      {parsed.examinationRaw && (
        <ExpandableSection icon={Activity} title="Physical Examination">
          {parsed.vitals && (
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div className="rounded-xl bg-[#f4f6f8] px-3 py-2">
                <p className="text-xs text-[#9ca3af]">PR</p>
                <p className="text-sm font-semibold text-[#111827]">{parsed.vitals.pr}</p>
              </div>
              <div className="rounded-xl bg-[#f4f6f8] px-3 py-2">
                <p className="text-xs text-[#9ca3af]">BP</p>
                <p className="text-sm font-semibold text-[#111827]">{parsed.vitals.bp}</p>
              </div>
              <div className="rounded-xl bg-[#f4f6f8] px-3 py-2">
                <p className="text-xs text-[#9ca3af]">RR</p>
                <p className="text-sm font-semibold text-[#111827]">{parsed.vitals.rr}</p>
              </div>
              <div className="rounded-xl bg-[#f4f6f8] px-3 py-2">
                <p className="text-xs text-[#9ca3af]">SpO2</p>
                <p className="text-sm font-semibold text-[#111827]">{parsed.vitals.spo2}</p>
              </div>
            </div>
          )}
          <p className="whitespace-pre-wrap">{parsed.examinationRaw}</p>
        </ExpandableSection>
      )}

      {parsed.investigations && (
        <ExpandableSection icon={FlaskConical} title="Investigations">
          <p className="whitespace-pre-wrap">{parsed.investigations}</p>
        </ExpandableSection>
      )}

      {parsed.medications && (
        <ExpandableSection icon={Pill} title="Medications">
          <p className="whitespace-pre-wrap">{parsed.medications}</p>
        </ExpandableSection>
      )}

      {parsed.followUp && (
        <ExpandableSection icon={Calendar} title="Follow-up">
          <p className="whitespace-pre-wrap">{parsed.followUp}</p>
        </ExpandableSection>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#f9fafb] border-t border-[#f0f2f5]">
        <div className="flex items-center">
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#16a34a] bg-[#dcfce7] rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
            Confidence: High
          </span>
          <span className="text-xs text-[#6b7280] ml-3">
            Sources: {chunkCount} chunks
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-[#6b7280]">
          Review required
          <Info className="w-3.5 h-3.5" />
        </span>
      </div>

    </div>
  );
}
