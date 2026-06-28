import SkeletonLine from "@/components/shared/SkeletonLine";
import { BarChart2, FileText, Crown } from "lucide-react";
import React from "react";

const stats = [
  { 
    label: "Runs today", 
    value: "0", 
    limit: "/ 1 limit",
    icon: <BarChart2 size={22} className="text-blue-600" />,
    iconBg: "bg-blue-50"
  },
  { 
    label: "Pages processed", 
    value: "0", 
    limit: "/ 300 today",
    icon: <FileText size={22} className="text-green-600" />,
    iconBg: "bg-green-50"
  },
  { 
    label: "Active tier", 
    value: "Free", 
    limit: "",
    icon: <Crown size={22} className="text-purple-600" />,
    iconBg: "bg-purple-50"
  },
];

export default function UsageStats({ loading }: { loading?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border p-6 flex items-start gap-4 shadow-sm bg-white"
          style={{ borderColor: "var(--card-border)" }}
        >
          {/* Icon Block */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${s.iconBg}`}>
            {s.icon}
          </div>

          {/* Text Content */}
          <div className="flex flex-col mt-0.5">
            <p className="text-xs font-medium text-gray-500 mb-1">
              {s.label}
            </p>
            {loading ? (
              <SkeletonLine className="w-16 h-7" />
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-[28px] leading-none font-semibold text-gray-900">
                  {s.value}
                </span>
              </div>
            )}
            {!loading && s.limit && (
              <span className="text-xs text-gray-400 font-medium mt-1">
                {s.limit}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
