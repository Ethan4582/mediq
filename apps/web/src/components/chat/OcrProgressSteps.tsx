import React from "react";

const STEPS = [
  { key: "uploading", label: "Uploading file" },
  { key: "ocr",       label: "Reading document" },
  { key: "chunking",  label: "Processing text" },
  { key: "ready",     label: "Complete" },
];

const stageToStep: Record<string, number> = {
  uploading: 0,
  ocr: 1,
  chunking: 2,
  ready: 3,
};

export default function OcrProgressSteps({ stage }: { stage: string }) {
  const activeStep = stageToStep[stage] ?? 0;

  return (
    <div className="flex items-center gap-0 mt-3 relative h-6 pb-2">
      {STEPS.map((step, i) => {
        const isCompleted = i < activeStep;
        const isActive = i === activeStep;

        let dotClass = "w-2 h-2 rounded-full z-10 shrink-0";
        if (isCompleted) dotClass += " bg-[#2563eb]";
        else if (isActive) dotClass += " bg-[#2563eb] animate-pulse";
        else dotClass += " bg-[#e5e7eb]";

        return (
          <React.Fragment key={step.key}>
            <div className="relative flex flex-col items-center">
              <div className={dotClass} />
              {isActive && (
                <span className="absolute top-3 text-[10px] text-[#2563eb] font-medium whitespace-nowrap">
                  {step.label}
                </span>
              )}
            </div>
            {i < STEPS.length - 1 && (
              <div 
                className={`flex-1 h-px ${isCompleted || isActive ? "bg-[#2563eb]" : "bg-[#e5e7eb]"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
