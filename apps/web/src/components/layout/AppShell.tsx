"use client";

import { useSessionStore } from "@/stores/sessionStore";
import Sidebar from "./Sidebar";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

export default function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const { isSidebarOpen, closeSidebar } = useSessionStore();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out shrink-0 md:relative md:translate-x-0",
          !isSidebarOpen ? "-translate-x-full md:translate-x-0" : "translate-x-0",
          isSidebarOpen ? "w-60" : "w-14"
        )}
      >
        <Sidebar user={user} />
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Main content viewport */}
      <main className="flex-1 overflow-hidden flex flex-col min-w-0 bg-background">
        {children}
      </main>
    </div>
  );
}
