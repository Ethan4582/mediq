"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Key, User as UserIcon, Settings, BarChart3, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/shared/Avatar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface SidebarUserMenuProps {
  user: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } };
  isCollapsed?: boolean;
}

export default function SidebarUserMenu({
  user,
  isCollapsed = false,
}: SidebarUserMenuProps) {
  const router = useRouter();
  const supabase = createClient();
  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Profile";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full gap-2.5 p-1.5 h-9 hover:bg-muted/80 rounded-xl transition-colors cursor-pointer",
            isCollapsed ? "justify-center p-0 size-9 mx-auto" : "justify-start"
          )}
          title={displayName}
        >
          <Avatar name={displayName} src={user?.user_metadata?.avatar_url} size="sm" />
          {!isCollapsed && (
            <span className="text-xs font-semibold text-foreground truncate min-w-0">
              {displayName}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isCollapsed ? "start" : "end"}
        side={isCollapsed ? "right" : "top"}
        className="w-56 p-1.5 shadow-lg border-border"
      >
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer">
            <UserIcon className="size-4 text-muted-foreground" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer">
            <Settings className="size-4 text-muted-foreground" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/analytics" className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer">
            <BarChart3 className="size-4 text-muted-foreground" />
            <span>Analytics</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/api-keys" className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer">
            <Key className="size-4 text-muted-foreground" />
            <span>API Keys</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          <LogOut className="size-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
