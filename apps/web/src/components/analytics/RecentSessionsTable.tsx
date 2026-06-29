"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ExternalLink } from "lucide-react";
import { RecentSession } from "@/types/app";
import StatusBadge from "@/components/shared/StatusBadge";
import SkeletonLine from "@/components/shared/SkeletonLine";

export default function RecentSessionsTable({
  data,
  loading,
}: {
  data: RecentSession[];
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "var(--card-border)" }}>
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Recent Sessions</h2>
      </div>

      {loading ? (
        <div className="px-6 py-4 space-y-4">
          {[0, 1, 2].map((i) => <SkeletonLine key={i} className="h-10" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-500">
          No sessions yet. Upload your first document to get started.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500">
              {["Session", "Date", "Pages", "Provider", "Status", "Action"].map((h) => (
                <th key={h} className="text-left px-6 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.session_id} className="border-b border-gray-100 last:border-none hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 max-w-[180px] truncate">
                  {(s.title || `Case #${s.session_id.slice(0, 6)}`).slice(0, 30)}
                </td>
                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                  {format(parseISO(s.created_at), "MMM d, yyyy HH:mm")}
                </td>
                <td className="px-6 py-4 text-gray-700 font-medium">{s.page_count}</td>
                <td className="px-6 py-4">
                  {s.provider_used ? (
                    <span className="capitalize rounded-full px-2 py-0.5 text-xs bg-gray-100 text-gray-600 font-medium">
                      {s.provider_used}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={s.status as "done" | "pending" | "error"} />
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/chat/${s.session_id}`}
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    Open <ExternalLink size={12} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
