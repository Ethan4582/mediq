"use client";

import Image from "next/image";

export default function ChatEmptyState() {
  return (
    <div className="w-full max-w-[840px] mx-auto flex-1 flex flex-col items-center justify-center gap-5 py-24 px-6 text-center select-none">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-200/90 bg-white shadow-xs">
        <Image
          src="/logo.png"
          alt="MediQ"
          width={40}
          height={40}
          priority
          className="w-10 h-10 object-contain"
        />
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h3 className="font-semibold text-xl text-gray-900 tracking-tight">
          How can MediQ help today?
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Upload a patient document or ask questions to generate a discharge summary.
        </p>
      </div>
    </div>
  );
}
