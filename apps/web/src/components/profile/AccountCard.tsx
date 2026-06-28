"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/shared/Avatar";
import { LogOut, Pencil } from "lucide-react";

export default function AccountCard({
  user,
}: {
  user: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } };
}) {
  const supabase = createClient();
  const router = useRouter();
  const displayName = user?.user_metadata?.full_name ?? user?.email ?? "User";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div
      className="rounded-xl border p-6 flex items-center justify-between gap-4"
      style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar name={displayName} src={user?.user_metadata?.avatar_url} size="xl" />
          <button
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border bg-white flex items-center justify-center text-gray-500 shadow-sm"
            style={{ borderColor: "var(--border-default)" }}
          >
            <Pencil size={12} />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {displayName}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {user?.email}
          </p>
        </div>
      </div>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 border rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
        style={{ borderColor: "var(--border-default)", color: "var(--brand-primary)" }}
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
}
