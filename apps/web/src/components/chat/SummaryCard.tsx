"use client";

import { FileText, MoreHorizontal, Download, Share, Copy, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AmberChip, parseOcrText, isMissing } from "./SummaryCardSection";

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
  hideMetadata = false,
}: SummaryCardProps) {
  const parsed = parseOcrText(rawText);

  const getPrincipalDiagnosis = () => {
    if (draft?.diagnoses?.principal_diagnosis && !isMissing(draft.diagnoses.principal_diagnosis)) {
      return draft.diagnoses.principal_diagnosis;
    }
    if (parsed.diagnoses.length > 0) {
      return parsed.diagnoses[0];
    }
    return null;
  };

  const getSecondaryDiagnoses = () => {
    if (draft?.diagnoses?.secondary_diagnoses?.length) {
      return draft.diagnoses.secondary_diagnoses.filter((d: string) => !isMissing(d));
    }
    if (parsed.diagnoses.length > 1) {
      return parsed.diagnoses.slice(1);
    }
    return [];
  };

  const principal = getPrincipalDiagnosis();
  const secondary = getSecondaryDiagnoses();

  return (
    <Card className="shadow-sm border-border bg-card text-card-foreground">
      <CardContent className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">{fileName}</h3>
              {!hideMetadata && (
                <p className="text-xs text-muted-foreground">
                  {pageCount} {pageCount === 1 ? "page" : "pages"} · {chunkCount} extracted chunks
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="text-xs gap-2">
                <Copy className="size-3.5" /> Copy Summary
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs gap-2">
                <Download className="size-3.5" /> Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs gap-2">
                <Share className="size-3.5" /> Share Case
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Diagnosis section */}
        <div className="space-y-2 border-t pt-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Principal Diagnosis
          </span>
          {principal ? (
            <p className="text-sm font-medium text-foreground">{principal}</p>
          ) : (
            <AmberChip />
          )}

          {secondary.length > 0 && (
            <div className="pt-2 space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Secondary Diagnoses
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {secondary.map((s: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs font-normal">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Course Summary */}
        {draft?.course?.summary && (
          <div className="space-y-1 border-t pt-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Hospital Course
            </span>
            <p className="text-xs text-muted-foreground line-clamp-3">
              {draft.course.summary}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
