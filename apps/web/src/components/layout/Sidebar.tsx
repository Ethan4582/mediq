"use client";
import Link from "next/link";
import { Key, User, LogOut } from "lucide-react";
import { useSessions } from "@/hooks/useSessions";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Sidebar({ user }: { user: { email?: string; display_name?: string } }) {
  const { sessions } = useSessions();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-gray-400";
      case "processing": return "bg-amber-400";
      case "done": return "bg-green-400";
      case "error": return "bg-red-400";
      default: return "bg-gray-400";
    }
  }

  return (
    <div className="w-60 h-full border-r flex flex-col bg-background">
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold">MediQ</h1>
      </div>
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {sessions?.map(s => (
          <Link key={s.id} href={`/chat/${s.id}`} className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors text-sm">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(s.status)}`} />
            <span className="truncate">{s.patient_name ?? s.title ?? "Unnamed case"}</span>
          </Link>
        ))}
      </div>
      <div className="p-4 border-t flex items-center justify-between">
        <div className="flex gap-2">
          <Link href="/api-keys" className="p-2 hover:bg-muted rounded"><Key size={18} /></Link>
          <Link href="/profile" className="p-2 hover:bg-muted rounded"><User size={18} /></Link>
        </div>
        <button onClick={handleSignOut} className="p-2 hover:bg-muted rounded text-red-500">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  )
}
