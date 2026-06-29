import { Share2, MoreHorizontal, Menu } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import SkeletonLine from "@/components/shared/SkeletonLine";
import { useSessionStore } from "@/stores/sessionStore";
import type { AppSession } from "@/types/app";

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
      className="border-b border-[#f0f2f5] shrink-0 transition-all duration-300 w-full"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="flex items-center justify-between px-6 py-4 mx-auto w-full max-w-[780px]">
        <div className="flex items-center gap-4 min-w-0">
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 -ml-2 rounded-md bg-[#f4f6f8] border border-[#e5e7eb] hover:bg-[#e5e7eb] hover:text-[#111827] focus:ring-2 focus:ring-[#2563eb]/20 transition-all hidden md:block"
              style={{ color: "var(--text-secondary)" }}
            >
              <Menu size={16} />
            </button>
          )}
          <div className="flex flex-col gap-0.5 min-w-0">
            {loading ? (
              <SkeletonLine className="w-48 h-5" />
            ) : !session ? (
              <span className="font-semibold text-base tracking-tight truncate" style={{ color: "var(--text-primary)" }}>
                New Case
              </span>
            ) : (
              <div className="flex items-center gap-2.5">
                <span
                  className="font-semibold text-base tracking-tight truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {session.patient_name ?? session.title ?? "Unnamed Case"}
                </span>
                {session.status && <StatusBadge status={session.status} />}
              </div>
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
    </div>
  );
}
