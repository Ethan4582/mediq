import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSessionStore } from "@/stores/sessionStore";
import type { AppSession, Folder } from "@/types/app";

export function useSessions() {
  const [sessions, setSessions] = useState<AppSession[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { refreshKey } = useSessionStore();

  const fetchSessionsAndFolders = async () => {
    setLoading(true);
    const { data: user } = await supabase.auth.getUser();
    
    if (user.user) {
      const [sessionsRes, foldersRes] = await Promise.all([
        supabase
          .from("sessions")
          .select("id, title, patient_name, status, created_at, is_pinned, folder_id")
          .order("created_at", { ascending: false }),
        supabase
          .from("folders")
          .select("*")
          .order("created_at", { ascending: true })
      ]);

      if (!sessionsRes.error && sessionsRes.data) {
        setSessions(sessionsRes.data as AppSession[]);
      }
      if (!foldersRes.error && foldersRes.data) {
        setFolders(foldersRes.data as Folder[]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessionsAndFolders();
  }, [refreshKey]);

  const renameSession = async (id: string, newTitle: string) => {
    await supabase.from("sessions").update({ title: newTitle }).eq("id", id);
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s)));
  };

  const deleteSession = async (id: string) => {
    await supabase.from("sessions").delete().eq("id", id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const togglePin = async (id: string, isPinned: boolean) => {
    await supabase.from("sessions").update({ is_pinned: isPinned }).eq("id", id);
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, is_pinned: isPinned } : s)));
  };

  const moveToFolder = async (id: string, folderId: string | null) => {
    await supabase.from("sessions").update({ folder_id: folderId }).eq("id", id);
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, folder_id: folderId } : s)));
  };

  const createFolder = async (name: string) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data } = await supabase
      .from("folders")
      .insert({ user_id: user.user.id, name })
      .select()
      .single();
    if (data) {
      setFolders((prev) => [...prev, data as Folder]);
    }
  };

  return { sessions, folders, loading, renameSession, deleteSession, togglePin, moveToFolder, createFolder };
}
