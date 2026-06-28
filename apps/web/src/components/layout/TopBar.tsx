import { Share2, MoreHorizontal } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import SkeletonLine from "@/components/shared/SkeletonLine";
import type { AppSession } from "@/types/app";
import { format } from "date-fns";

export default function TopBar({
  session,
  loading,
}: {
  session: AppSession | null;
  loading: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-6 py-3 border-b shrink-0"
      style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        {loading || !session ? (
          <>
            <SkeletonLine className="w-48 h-5" />
            <SkeletonLine className="w-32 h-3.5 mt-1" />
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <span
                className="font-semibold text-base truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {session.patient_name ?? session.title ?? "Unnamed case"}
              </span>
              <StatusBadge status={session.status} />
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Session &middot; Created{" "}
              {format(new Date(session.created_at), "dd MMM yyyy, hh:mm a")}
            </p>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          className="flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-[var(--bg-hover)]"
          style={{
            borderColor: "var(--border-default)",
            color: "var(--text-secondary)",
          }}
        >
          <Share2 size={14} />
          Share
        </button>
        <button
          className="border rounded-lg p-1.5 transition-colors hover:bg-[var(--bg-hover)]"
          style={{
            borderColor: "var(--border-default)",
            color: "var(--text-secondary)",
          }}
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}
