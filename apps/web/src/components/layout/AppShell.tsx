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
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Sidebar — always visible on desktop, toggled on mobile */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
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
