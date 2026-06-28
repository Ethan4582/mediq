import { Share2, MoreHorizontal, Menu } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import SkeletonLine from "@/components/shared/SkeletonLine";
import { useSessionStore } from "@/stores/sessionStore";
import type { AppSession } from "@/types/app";
import { format } from "date-fns";

export default function TopBar({
  session,
  loading,
}: {
  session: AppSession | null;
  loading: boolean;
}) {
  const { isSidebarOpen, toggleSidebar } = useSessionStore();

  return (
    <div
      className="flex items-center justify-between px-6 py-3 border-b shrink-0 transition-all duration-300"
      style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}
    >
      <div className="flex items-center gap-4 min-w-0">
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 -ml-2 rounded-md hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hidden md:block"
          >
            <Menu size={18} />
          </button>
        )}
        <div className="flex flex-col gap-0.5 min-w-0">
          {loading ? (
            <>
              <SkeletonLine className="w-48 h-5" />
              <SkeletonLine className="w-32 h-3.5 mt-1" />
            </>
          ) : !session ? (
            <>
              <span className="font-semibold text-base truncate" style={{ color: "var(--text-primary)" }}>
                New Case
              </span>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Start by typing or uploading a document
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <span
                  className="font-semibold text-base truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {session.patient_name ?? session.title ?? "Unnamed Case"}
                </span>
                {session.status && <StatusBadge status={session.status} />}
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {session.created_at ? (
                  <>Session &middot; Created {format(new Date(session.created_at), "dd MMM yyyy, hh:mm a")}</>
                ) : (
                  "New Session"
                )}
              </p>
            </>
          )}
        </div>
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
