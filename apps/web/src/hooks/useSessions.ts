import { useCallback, useEffect, useState } from 'react';
import {
  createFolderAction,
  deleteSessionAction,
  getSessionsAndFoldersAction,
  moveSessionToFolderAction,
  renameSessionAction,
  togglePinAction,
} from '@/actions/sessions';
import { useSessionStore } from '@/stores/sessionStore';
import type { AppSession, Folder } from '@/types/app';

export function useSessions() {
  const [sessions, setSessions] = useState<AppSession[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshKey } = useSessionStore();

  const refetch = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getSessionsAndFoldersAction();
      setSessions(data.sessions);
      setFolders(data.folders);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await getSessionsAndFoldersAction();

        if (!ignore) {
          setSessions(data.sessions);
          setFolders(data.folders);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const renameSession = async (id: string, newTitle: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s)));
    await renameSessionAction(id, newTitle);
  };

  const deleteSession = async (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    await deleteSessionAction(id);
  };

  const togglePin = async (id: string, isPinned: boolean) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_pinned: !isPinned } : s))
    );
    await togglePinAction(id, !isPinned);
  };

  const createFolder = async (name: string) => {
    const created = await createFolderAction(name);

    if (created) {
      setFolders((prev) => [...prev, created]);
    }
  };

  const moveSessionToFolder = async (sessionId: string, folderId: string | null) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, folder_id: folderId } : s))
    );
    await moveSessionToFolderAction(sessionId, folderId);
  };

  return {
    sessions,
    folders,
    loading,
    refetch,
    renameSession,
    deleteSession,
    togglePin,
    createFolder,
    moveToFolder: moveSessionToFolder,
    moveSessionToFolder,
  };
}
