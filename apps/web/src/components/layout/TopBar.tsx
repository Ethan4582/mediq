import { useState } from "react";
import { Settings, Share2, MoreHorizontal, Menu } from "lucide-react";
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
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div
      className="shrink-0 transition-all duration-300 w-full bg-transparent"
    >
      <div className="flex items-center justify-between px-6 py-3 mx-auto w-full max-w-[860px]">
        <div className="flex items-center gap-4 min-w-0">
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 -ml-2 rounded-md bg-[#f4f6f8] border border-[#e5e7eb] hover:bg-[#e5e7eb] hover:text-[#111827] focus:ring-2 focus:ring-[#2563eb]/20 transition-all hidden md:block cursor-pointer"
              style={{ color: "var(--text-secondary)" }}
            >
              <Menu size={16} />
            </button>
          )}
        </div>

        <div 
          className="flex items-center gap-2 shrink-0 relative py-1"
          onMouseEnter={() => setShowSettings(true)}
          onMouseLeave={() => setShowSettings(false)}
        >
          <button
            className="p-2 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer text-gray-500 hover:text-gray-800 transition-colors"
          >
            <Settings size={18} />
          </button>
          
          {showSettings && (
            <div 
              className="absolute right-0 top-full mt-1 w-56 rounded-lg border shadow-md bg-white p-1 z-50"
              style={{
                borderColor: "var(--border-default)",
              }}
            >
              <button className="w-full text-left cursor-pointer flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] px-3 py-2 rounded-md transition-colors bg-transparent border-none">
                <Share2 size={14} />
                <span>Start new session or branch</span>
              </button>
              <button className="w-full text-left cursor-pointer flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] px-3 py-2 rounded-md transition-colors bg-transparent border-none">
                <MoreHorizontal size={14} />
                <span>More options</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
