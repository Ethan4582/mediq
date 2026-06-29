"use client";

import { useSessionStore } from "@/stores/sessionStore";
import Sidebar from "./Sidebar";
import type { User } from "@supabase/supabase-js";

export default function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const { isSidebarOpen, closeSidebar } = useSessionStore();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f0f2f5] p-3 gap-3">
      {/* Sidebar — toggled via margin on desktop, transform on mobile */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out shrink-0
          md:relative md:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:!ml-[-240px]"}
        `}
        style={{ width: "240px" }}
      >
        <Sidebar user={user} />
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
