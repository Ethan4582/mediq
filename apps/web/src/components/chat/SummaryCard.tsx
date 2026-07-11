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
  rawText: string
  fileName: string
  pageCount: number
  chunkCount: number
  isFirst?: boolean
}

export default function SummaryCard({
  rawText,
  fileName,
  pageCount,
  chunkCount,
  isFirst
}: SummaryCardProps) {
  const parsed = parseOcrText(rawText);

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
    <div className="w-full flex flex-col gap-6 text-[#111827] mt-2 mb-4 relative group pr-10">
      
      {/* Action buttons at the top right, visible on hover */}
      <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
        <button 
          onClick={() => navigator.clipboard.writeText(rawText)}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-[#f4f6f8] transition-colors"
          title="Copy text"
        >
          <Copy size={15} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-[#f4f6f8] transition-colors" title="More options">
               <MoreHorizontal size={15} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleDownloadPdf}>
              <Download className="mr-2 h-4 w-4" />
              <span>Download PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share className="mr-2 h-4 w-4" />
              <span>Share</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Agent Feedback</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
        {parsed.diagnoses.length > 0 ? (
           <p className="text-[#374151]">{parsed.diagnoses[0]}</p>
        ) : (
           <p className="text-[#6b7280] italic">Not found in document</p>
        )}

        {parsed.diagnoses.length > 1 && (
          <div className="mt-4">
            <h3 className="text-[17px] font-semibold text-[#111827]">Secondary Diagnoses</h3>
            <ul className="list-disc pl-5 mt-2.5 space-y-2 text-[#374151] marker:text-[#2563eb]">
              {parsed.diagnoses.slice(1).map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5 text-[15px] leading-relaxed">
        <h2 className="text-[20px] font-bold text-[#111827] tracking-tight">Hospital Course</h2>
        {parsed.course ? (
          <p className="text-[#374151] whitespace-pre-wrap">{parsed.course}</p>
        ) : (
          <p className="text-[#6b7280] italic">Pending — clinician review required</p>
        )}
      </div>

      {parsed.examinationRaw && (
        <div className="flex flex-col gap-2.5 text-[15px] leading-relaxed">
          <h2 className="text-[20px] font-bold text-[#111827] tracking-tight">Physical Examination</h2>
          {parsed.vitals && (
            <p className="text-[#374151] mb-1">
              <strong className="font-semibold text-[#111827]">Vitals:</strong> PR: {parsed.vitals.pr}, BP: {parsed.vitals.bp}, RR: {parsed.vitals.rr}, SpO2: {parsed.vitals.spo2}
            </p>
          )}
          <p className="text-[#374151] whitespace-pre-wrap">{parsed.examinationRaw}</p>
        </div>
      )}

      {parsed.investigations && (
        <div className="flex flex-col gap-2.5 text-[15px] leading-relaxed">
          <h2 className="text-[20px] font-bold text-[#111827] tracking-tight">Investigations</h2>
          <p className="text-[#374151] whitespace-pre-wrap">{parsed.investigations}</p>
        </div>
      )}

      {parsed.medications && (
        <div className="flex flex-col gap-2.5 text-[15px] leading-relaxed">
          <h2 className="text-[20px] font-bold text-[#111827] tracking-tight">Medications</h2>
          <p className="text-[#374151] whitespace-pre-wrap">{parsed.medications}</p>
        </div>
      )}

      {parsed.followUp && (
        <div className="flex flex-col gap-2.5 text-[15px] leading-relaxed">
          <h2 className="text-[20px] font-bold text-[#111827] tracking-tight">Follow-up</h2>
          <p className="text-[#374151] whitespace-pre-wrap">{parsed.followUp}</p>
        </div>
      )}

    </div>
  );
}
