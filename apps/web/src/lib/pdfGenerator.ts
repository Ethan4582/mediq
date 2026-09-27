import type { ClinicalDraft } from '@/types/app';

interface TableRow {
  name: string;
  dosage: string;
  route: string;
  frequency: string;
}

interface PdfSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: TableRow[];
  keyValuePairs?: Array<{ label: string; value: string }>;
}

export interface SummaryPdfData {
  title: string;
  patientName?: string;
  date?: string;
  sections?: PdfSection[];
  draft?: ClinicalDraft | null;
  rawText?: string;
}

function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!word) continue;
    if ((currentLine + (currentLine ? ' ' : '') + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      if (word.length > maxCharsPerLine) {
        let remaining = word;
        while (remaining.length > maxCharsPerLine) {
          lines.push(remaining.slice(0, maxCharsPerLine));
          remaining = remaining.slice(maxCharsPerLine);
        }
        currentLine = remaining;
      } else {
        currentLine = word;
      }
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [''];
}

export function buildPdfBlob(data: SummaryPdfData): Blob {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 45;
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = 50;

  const pagesCommands: string[][] = [];
  let currentCommands: string[] = [];
  let currentY = pageHeight - margin;

  const startNewPage = () => {
    if (currentCommands.length > 0) {
      pagesCommands.push(currentCommands);
    }
    currentCommands = [];
    currentY = pageHeight - margin;
  };

  const ensureSpace = (neededHeight: number) => {
    if (currentY - neededHeight < bottomMargin) {
      startNewPage();
    }
  };

  const drawText = (
    text: string,
    x: number,
    y: number,
    fontKey: 'F1' | 'F2' | 'F3',
    size: number,
    r = 0.1,
    g = 0.1,
    b = 0.15
  ) => {
    currentCommands.push(
      `0 g ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg BT /${fontKey} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${escapePdfText(text)}) Tj ET`
    );
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number, r = 0.8, g = 0.82, b = 0.85, lineWidth = 0.75) => {
    currentCommands.push(
      `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG ${lineWidth} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`
    );
  };

  const drawRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    fillR = 0.96,
    fillG = 0.97,
    fillB = 0.98,
    stroke = false
  ) => {
    currentCommands.push(
      `${fillR.toFixed(3)} ${fillG.toFixed(3)} ${fillB.toFixed(3)} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`
    );
    if (stroke) {
      currentCommands.push(
        `0.85 0.87 0.90 RG 0.5 w ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`
      );
    }
  };

  drawRect(margin, currentY - 24, contentWidth, 24, 0.93, 0.95, 0.98);
  drawText('MEDIQ CLINICAL INTELLIGENCE', margin + 10, currentY - 16, 'F1', 8, 0.12, 0.38, 0.88);
  drawText('VERIFIED CLINICAL RECORD', pageWidth - margin - 120, currentY - 16, 'F1', 7.5, 0.4, 0.45, 0.5);
  currentY -= 36;

  const titleLines = wrapText(data.title || 'Clinical Summary Report', 50);
  for (const line of titleLines) {
    ensureSpace(24);
    drawText(line, margin, currentY - 14, 'F1', 16, 0.08, 0.12, 0.2);
    currentY -= 20;
  }
  currentY -= 4;

  const dateStr = data.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const patientInfo = data.patientName ? `Patient: ${data.patientName}` : '';
  const metaText = [patientInfo, `Date: ${dateStr}`, 'System: MediQ Clinical Engine'].filter(Boolean).join('  |  ');
  drawText(metaText, margin, currentY - 10, 'F2', 8.5, 0.4, 0.45, 0.5);
  currentY -= 18;

  drawLine(margin, currentY, pageWidth - margin, currentY, 0.82, 0.85, 0.88, 1);
  currentY -= 16;

  const sectionsToRender: PdfSection[] = [];

  if (data.sections && data.sections.length > 0) {
    sectionsToRender.push(...data.sections);
  } else if (data.draft) {
    const d = data.draft;

    if (d.patient_info && Object.keys(d.patient_info).length > 0) {
      sectionsToRender.push({
        title: 'Patient Demographics',
        keyValuePairs: Object.entries(d.patient_info).map(([k, v]) => ({
          label: k.replace(/_/g, ' '),
          value: String(v),
        })),
      });
    }

    if (d.diagnoses) {
      const bullets: string[] = [];
      if (d.diagnoses.principal_diagnosis) {
        bullets.push(`Principal Diagnosis: ${d.diagnoses.principal_diagnosis}`);
      }
      if (d.diagnoses.secondary_diagnoses && d.diagnoses.secondary_diagnoses.length > 0) {
        d.diagnoses.secondary_diagnoses.forEach((sd) => bullets.push(`Secondary Diagnosis: ${sd}`));
      }
      if (bullets.length > 0) {
        sectionsToRender.push({
          title: 'Clinical Diagnoses',
          bullets,
        });
      }
    }

    if (d.medications?.discharge && d.medications.discharge.length > 0) {
      sectionsToRender.push({
        title: 'Reconciled Discharge Medications',
        table: d.medications.discharge.map((m) => ({
          name: m.name || '',
          dosage: m.dosage || m.dose || 'As directed',
          route: m.route || 'Oral',
          frequency: m.frequency || 'Daily',
        })),
      });
    }

    if (d.course?.summary) {
      sectionsToRender.push({
        title: 'Hospital Course',
        paragraphs: [d.course.summary],
      });
    }

    if (d.follow_up?.instructions) {
      sectionsToRender.push({
        title: 'Follow-Up & Discharge Instructions',
        paragraphs: [d.follow_up.instructions],
      });
    }
  } else if (data.rawText) {
    const cleaned = data.rawText
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[\s*\{.*?"box_2d".*?\}\s*\]/g, '')
      .trim();

    const rawSections = cleaned.split(/(?=\n#{1,3}\s+)/g);
    for (const rawSec of rawSections) {
      const trimmed = rawSec.trim();
      if (!trimmed) continue;
      const lines = trimmed.split('\n');
      const firstLine = lines[0] ?? '';
      const isHeader = firstLine.startsWith('#');
      const title = isHeader ? firstLine.replace(/^#+\s*/, '') : 'Clinical Findings';
      const body = isHeader ? lines.slice(1).join('\n').trim() : trimmed;
      if (body) {
        sectionsToRender.push({
          title,
          paragraphs: [body],
        });
      }
    }
  }

  for (const section of sectionsToRender) {
    ensureSpace(36);
    drawRect(margin, currentY - 18, contentWidth, 18, 0.96, 0.97, 0.99);
    drawText(section.title.toUpperCase(), margin + 8, currentY - 13, 'F1', 9, 0.12, 0.35, 0.75);
    drawLine(margin, currentY - 18, pageWidth - margin, currentY - 18, 0.85, 0.88, 0.92, 0.5);
    currentY -= 26;

    if (section.keyValuePairs && section.keyValuePairs.length > 0) {
      ensureSpace(32);
      const colWidth = contentWidth / 2;
      for (let i = 0; i < section.keyValuePairs.length; i += 2) {
        ensureSpace(16);
        const item1 = section.keyValuePairs[i];
        if (item1) {
          drawText(item1.label.toUpperCase(), margin + 4, currentY - 10, 'F1', 7.5, 0.45, 0.5, 0.55);
          drawText(item1.value, margin + 4, currentY - 20, 'F2', 9, 0.1, 0.15, 0.2);
        }
        const item2 = section.keyValuePairs[i + 1];
        if (item2) {
          drawText(item2.label.toUpperCase(), margin + colWidth + 4, currentY - 10, 'F1', 7.5, 0.45, 0.5, 0.55);
          drawText(item2.value, margin + colWidth + 4, currentY - 20, 'F2', 9, 0.1, 0.15, 0.2);
        }
        currentY -= 26;
      }
      currentY -= 4;
    }

    if (section.bullets && section.bullets.length > 0) {
      for (const bullet of section.bullets) {
        const wrapped = wrapText(bullet, 80);
        ensureSpace(wrapped.length * 13 + 4);
        drawText('•', margin + 6, currentY - 10, 'F1', 10, 0.15, 0.4, 0.85);
        for (let idx = 0; idx < wrapped.length; idx++) {
          const l = wrapped[idx] ?? '';
          drawText(l, margin + 18, currentY - 10, idx === 0 && l.includes(':') ? 'F1' : 'F2', 9, 0.12, 0.15, 0.2);
          currentY -= 13;
        }
        currentY -= 2;
      }
      currentY -= 4;
    }

    if (section.table && section.table.length > 0) {
      ensureSpace(28);
      const colW1 = contentWidth * 0.38;
      const colW2 = contentWidth * 0.24;
      const colW3 = contentWidth * 0.18;

      drawRect(margin, currentY - 18, contentWidth, 18, 0.94, 0.95, 0.97, true);
      drawText('MEDICATION', margin + 6, currentY - 12, 'F1', 7.5, 0.3, 0.35, 0.4);
      drawText('DOSAGE', margin + colW1 + 6, currentY - 12, 'F1', 7.5, 0.3, 0.35, 0.4);
      drawText('ROUTE', margin + colW1 + colW2 + 6, currentY - 12, 'F1', 7.5, 0.3, 0.35, 0.4);
      drawText('FREQUENCY', margin + colW1 + colW2 + colW3 + 6, currentY - 12, 'F1', 7.5, 0.3, 0.35, 0.4);
      currentY -= 18;

      for (let rIdx = 0; rIdx < section.table.length; rIdx++) {
        const row = section.table[rIdx];
        if (!row) continue;
        ensureSpace(18);
        const isAlt = rIdx % 2 === 1;
        if (isAlt) {
          drawRect(margin, currentY - 18, contentWidth, 18, 0.98, 0.985, 0.99);
        }
        drawLine(margin, currentY - 18, pageWidth - margin, currentY - 18, 0.9, 0.92, 0.94, 0.5);

        drawText(row.name, margin + 6, currentY - 12, 'F1', 8.5, 0.1, 0.15, 0.25);
        drawText(row.dosage, margin + colW1 + 6, currentY - 12, 'F2', 8.5, 0.2, 0.25, 0.3);
        drawText(row.route, margin + colW1 + colW2 + 6, currentY - 12, 'F2', 8.5, 0.2, 0.25, 0.3);
        drawText(row.frequency, margin + colW1 + colW2 + colW3 + 6, currentY - 12, 'F2', 8.5, 0.2, 0.25, 0.3);
        currentY -= 18;
      }
      currentY -= 8;
    }

    if (section.paragraphs && section.paragraphs.length > 0) {
      for (const p of section.paragraphs) {
        const paras = p.split('\n\n');
        for (const subp of paras) {
          const cleanP = subp.replace(/\n/g, ' ').trim();
          if (!cleanP) continue;
          const wrapped = wrapText(cleanP, 85);
          ensureSpace(wrapped.length * 13 + 6);
          for (const line of wrapped) {
            drawText(line, margin, currentY - 10, 'F2', 9, 0.15, 0.18, 0.22);
            currentY -= 13;
          }
          currentY -= 6;
        }
      }
    }

    currentY -= 10;
  }

  if (currentCommands.length > 0) {
    pagesCommands.push(currentCommands);
  }

  const totalPages = Math.max(pagesCommands.length, 1);
  for (let pIndex = 0; pIndex < pagesCommands.length; pIndex++) {
    const pageCmds = pagesCommands[pIndex];
    if (!pageCmds) continue;
    const footerY = 32;
    pageCmds.push(
      `0.85 0.87 0.90 RG 0.5 w ${margin} ${footerY + 12} m ${pageWidth - margin} ${footerY + 12} l S`
    );
    pageCmds.push(
      `0 g 0.45 0.5 0.55 rg BT /F2 7.5 Tf ${margin} ${footerY} Td (${escapePdfText(
        'MediQ Clinical Intelligence System • Confidential Medical Record • EHR Grounded'
      )}) Tj ET`
    );
    pageCmds.push(
      `0 g 0.45 0.5 0.55 rg BT /F1 7.5 Tf ${pageWidth - margin - 60} ${footerY} Td (${escapePdfText(
        `Page ${pIndex + 1} of ${totalPages}`
      )}) Tj ET`
    );
  }

  const pdfObjects: string[] = [];

  pdfObjects.push('<< /Type /Catalog /Pages 2 0 R >>');
  pdfObjects.push('<< /Type /Pages /Kids [] /Count 0 >>');
  pdfObjects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  pdfObjects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  pdfObjects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>');

  const pageObjStartNum = 6;
  const kidsRefs: string[] = [];

  for (let i = 0; i < pagesCommands.length; i++) {
    const pageObjNum = pageObjStartNum + i * 2;
    const contentObjNum = pageObjNum + 1;
    kidsRefs.push(`${pageObjNum} 0 R`);

    const streamContent = (pagesCommands[i] ?? []).join('\n');
    const streamLength = new TextEncoder().encode(streamContent).length;

    pdfObjects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(
        2
      )}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentObjNum} 0 R >>`
    );

    pdfObjects.push(`<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`);
  }

  pdfObjects[1] = `<< /Type /Pages /Kids [${kidsRefs.join(' ')}] /Count ${pagesCommands.length} >>`;

  let pdfString = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets: number[] = [0];

  for (let i = 0; i < pdfObjects.length; i++) {
    offsets.push(new TextEncoder().encode(pdfString).length);
    pdfString += `${i + 1} 0 obj\n${pdfObjects[i]}\nendobj\n`;
  }

  const startXref = new TextEncoder().encode(pdfString).length;
  pdfString += `xref\n0 ${pdfObjects.length + 1}\n0000000000 65535 f \n`;

  for (let i = 1; i <= pdfObjects.length; i++) {
    const off = offsets[i] ?? 0;
    pdfString += `${off.toString().padStart(10, '0')} 00000 n \n`;
  }

  pdfString += `trailer\n<< /Size ${pdfObjects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return new Blob([new TextEncoder().encode(pdfString)], { type: 'application/pdf' });
}

export function downloadClinicalSummaryPdf(data: SummaryPdfData, fallbackFileName = 'clinical_summary'): void {
  const blob = buildPdfBlob(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeTitle = (data.title || fallbackFileName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  a.download = `${safeTitle || 'clinical_summary'}.pdf`;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
