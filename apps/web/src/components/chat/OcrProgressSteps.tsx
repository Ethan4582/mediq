import React from "react";

const STEPS = [
  { key: "uploading", label: "Uploading file" },
  { key: "ocr",       label: "Reading document" },
  { key: "chunking",  label: "Processing text" },
  { key: "embedding", label: "Generating embeddings" },
  { key: "ready",     label: "Complete" },
];

const stageToStep: Record<string, number> = {
  uploading: 0,
  ocr: 1,
  chunking: 2,
  embedding: 3,
  ready: 4,
};

export default function OcrProgressSteps({ stage }: { stage: string }) {
  const activeStep = stageToStep[stage] ?? 0;

  return (
    <div className="flex flex-col mt-4 w-full">
      <div className="flex items-center gap-0 w-full">
        {STEPS.map((step, i) => {
          const isCompleted = i < activeStep;
          const isActive = i === activeStep;

          let dotClass = "w-2.5 h-2.5 rounded-full z-10 shrink-0 transition-colors duration-300";
          if (isCompleted) dotClass += " bg-[#2563eb]";
          else if (isActive) dotClass += " bg-[#2563eb] ring-4 ring-[#2563eb]/20 animate-pulse";
          else dotClass += " bg-[#e5e7eb]";

          return (
            <React.Fragment key={step.key}>
              <div className={dotClass} />
              {i < STEPS.length - 1 && (
                <div 
                  className={`flex-1 h-px transition-colors duration-300 ${isCompleted ? "bg-[#2563eb]" : "bg-[#e5e7eb]"}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="text-[11px] font-medium text-[#2563eb] mt-3 h-4">
        {STEPS[activeStep]?.label || "Processing document..."}
      </div>
    </div>
  );
}
