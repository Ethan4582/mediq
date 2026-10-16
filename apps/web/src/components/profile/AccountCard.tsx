"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/shared/Avatar";
import { Button } from "@/components/ui/button";
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
    <div className="rounded-2xl border border-border/80 bg-card p-6 flex items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar name={displayName} src={user?.user_metadata?.avatar_url} size="lg" />
          <button
            type="button"
            className="absolute -bottom-1 -right-1 size-6 rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground shadow-xs hover:text-foreground cursor-pointer"
            title="Edit avatar"
          >
            <Pencil size={11} />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {displayName}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {user?.email}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        className="flex items-center gap-2 h-8 px-3 text-xs font-medium cursor-pointer"
      >
        <LogOut className="size-3.5" />
        <span>Sign Out</span>
      </Button>
    </div>
  );
}
