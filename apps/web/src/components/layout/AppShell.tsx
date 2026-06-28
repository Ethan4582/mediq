"use client";
import Sidebar from "./Sidebar";
import { useSessionStore } from "@/stores/sessionStore";

export default function AppShell({ children, user }: { children: React.ReactNode, user: any }) {
  const { isSidebarOpen, closeSidebar } = useSessionStore();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <Sidebar user={user} />
      </div>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeSidebar} />
      )}
      <main className="flex-1 overflow-auto flex flex-col relative">
        {children}
      </main>
    </div>
  )
}
