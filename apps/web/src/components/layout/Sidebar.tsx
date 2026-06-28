"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Plus,
  ChevronsLeft,
  Search,
  Key,
  User,
  ChevronDown,
} from "lucide-react";
import { useSessions } from "@/hooks/useSessions";
import { useSessionStore } from "@/stores/sessionStore";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/shared/Avatar";
import SkeletonLine from "@/components/shared/SkeletonLine";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function Sidebar({
  user,
}: {
  user: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } };
}) {
  const { sessions, loading } = useSessions();
  const { isSidebarOpen, toggleSidebar } = useSessionStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? "User";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div
      className="w-[240px] h-full flex flex-col shrink-0 border-r"
      style={{ background: "var(--sidebar-bg)", borderColor: "var(--border-default)" }}
    >
      {/* Logo Row */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div
          >
            <img src="/logo.png" alt="MediQ" width={34} height={34} />
          </div>
          <span className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
            MediQ
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <ChevronsLeft size={16} />
        </button>
      </div>

      {/* New Session Button */}
      <div className="px-3 pb-3">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full rounded-lg py-2 text-sm font-medium text-white transition-colors"
          style={{ background: "var(--brand-primary)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--brand-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--brand-primary)")
          }
        >
          <Plus size={14} />
          New Session
        </Link>
      </div>

      {/* Search Bar */}
      <div className="px-3 pb-3">
        <div
          className="flex items-center gap-2 rounded-md px-3 py-1.5"
          style={{ background: "var(--bg-hover)" }}
        >
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search sessions"
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: "var(--text-primary)" }}
          />
          <span
            className="text-xs px-1.5 py-0.5 rounded border font-mono"
            style={{ color: "var(--text-muted)", borderColor: "var(--border-default)" }}
          >
            ⌘K
          </span>
        </div>
      </div>

      {/* Middle: Nav Links */}
      <div className="px-2 space-y-0.5">
        <Link
          href="/api-keys"
          className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <Key size={15} />
          API Keys
        </Link>
        <Link
          href="/profile"
          className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <User size={15} />
          Profile
        </Link>
      </div>

      <hr className="mx-3 my-2" style={{ borderColor: "var(--border-default)" }} />

      {/* Sessions Label */}
      <span
        className="px-3 py-1 text-xs font-medium uppercase tracking-wide"
        style={{ color: "var(--text-muted)" }}
      >
        Sessions
      </span>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-2">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2.5">
                <div
                  className="w-8 h-8 rounded-full animate-pulse shrink-0"
                  style={{ background: "var(--bg-hover)" }}
                />
                <div className="flex-1 space-y-1.5">
                  <SkeletonLine className="w-3/4 h-3" />
                  <SkeletonLine className="w-1/2 h-2.5" />
                </div>
              </div>
            ))
          : sessions.map((s) => {
              const isActive = pathname === `/chat/${s.id}`;
              const name = s.patient_name ?? s.title ?? "Unnamed case";
              const date = s.created_at
                ? formatDistanceToNow(new Date(s.created_at), { addSuffix: true })
                : "";
              return (
                <Link
                  key={s.id}
                  href={`/chat/${s.id}`}
                  className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 transition-colors text-left"
                  style={{
                    background: isActive ? "var(--bg-active)" : "transparent",
                  }}
                >
                  <Avatar name={name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {name}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                      {date}
                    </p>
                  </div>
                </Link>
              );
            })}
      </div>

      {/* Bottom User Row */}
      <div
        className="mt-auto px-3 py-3 border-t relative"
        style={{ borderColor: "var(--border-default)" }}
      >
        <button
          className="flex items-center gap-2.5 w-full rounded-lg px-2 py-2 hover:bg-[var(--bg-hover)] transition-colors"
          onClick={() => setShowUserMenu((v) => !v)}
        >
          <Avatar
            name={displayName}
            src={user?.user_metadata?.avatar_url}
            size="md"
          />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
              {displayName}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
              {user?.email}
            </p>
          </div>
          <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
        </button>

        {showUserMenu && (
          <div
            className="absolute bottom-full left-2 right-2 mb-1 rounded-lg border shadow-md overflow-hidden"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--border-default)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-hover)] transition-colors text-red-600"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
