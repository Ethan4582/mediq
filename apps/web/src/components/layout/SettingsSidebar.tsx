"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Key, User, Settings, ArrowLeft, LogOut } from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const NAV_ITEMS = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/api-keys", label: "API Keys", icon: Key },
  { href: "/settings", label: "Preferences", icon: Settings },
];

export default function SettingsSidebar({ user }: { user: SupabaseUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "User";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <aside className="w-60 h-full border-r border-sidebar-border bg-sidebar flex flex-col justify-between select-none shrink-0">
      <div className="flex flex-col">
        {/* Top Header */}
        <div className="p-3 border-b border-sidebar-border/70 flex items-center justify-between">
          <Link href="/chat" prefetch={true} className="flex items-center gap-2 px-1 active:scale-[0.98] transition-transform">
            <Image
              src="/logo.png"
              alt="MediQ"
              width={20}
              height={20}
              style={{ width: "20px", height: "auto" }}
              className="object-contain shrink-0"
              priority
            />
            <span className="font-semibold text-sm tracking-tight text-foreground">MediQ</span>
          </Link>
          <Link
            href="/chat"
            prefetch={true}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 px-2 py-1 rounded-lg transition-colors active:scale-[0.97]"
            title="Return to Chat"
          >
            <ArrowLeft className="size-3.5" />
            <span>Chat</span>
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-1">
          <div className="px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Workspace & Settings
          </div>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href === "/profile" && pathname.startsWith("/profile"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors active:scale-[0.98]",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60 font-medium"
                  )}
                >
                  <Icon className={cn("size-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom User Profile */}
      <div className="p-3 border-t border-sidebar-border/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={displayName} src={user?.user_metadata?.avatar_url} size="sm" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-foreground truncate">{displayName}</span>
            <span className="text-[10px] text-muted-foreground truncate">{user?.email}</span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors cursor-pointer shrink-0 active:scale-90"
          title="Sign out"
        >
          <LogOut className="size-3.5" />
        </button>
      </div>
    </aside>
  );
}
