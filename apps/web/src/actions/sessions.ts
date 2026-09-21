'use server';

import { and, asc, desc, eq } from 'drizzle-orm';
import { db, folders, sessions } from '@/db';
import { createClient } from '@/lib/supabase/server';
import type { AppSession, Folder } from '@/types/app';

export async function getSessionsAndFoldersAction(): Promise<{
  sessions: AppSession[];
  folders: Folder[];
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { sessions: [], folders: [] };
  }

  const [dbSessions, dbFolders] = await Promise.all([
    db.query.sessions.findMany({
      where: eq(sessions.userId, user.id),
      orderBy: [desc(sessions.createdAt)],
    }),
    db.query.folders.findMany({
      where: eq(folders.userId, user.id),
      orderBy: [asc(folders.createdAt)],
    }),
  ]);

  const mappedSessions: AppSession[] = dbSessions.map((s) => ({
    id: s.id,
    user_id: s.userId,
    title: s.title,
    patient_name: s.patientName,
    status: s.status,
    is_pinned: s.isPinned,
    folder_id: s.folderId,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  }));

  const mappedFolders: Folder[] = dbFolders.map((f) => ({
    id: f.id,
    user_id: f.userId,
    name: f.name,
    created_at: f.createdAt,
  }));

  return {
    sessions: mappedSessions,
    folders: mappedFolders,
  };
}

export async function getSessionAction(sessionId: string): Promise<AppSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const s = await db.query.sessions.findFirst({
    where: and(eq(sessions.id, sessionId), eq(sessions.userId, user.id)),
  });

  if (!s) {
    return null;
  }

  return {
    id: s.id,
    user_id: s.userId,
    title: s.title,
    patient_name: s.patientName,
    status: s.status,
    is_pinned: s.isPinned,
    folder_id: s.folderId,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  };
}

export async function createSessionAction(params: {
  title: string;
  patientName?: string;
}): Promise<AppSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [created] = await db
    .insert(sessions)
    .values({
      userId: user.id,
      title: params.title,
      patientName: params.patientName ?? `Patient ${new Date().toLocaleDateString()}`,
      status: 'pending',
    })
    .returning();

  if (!created) {
    return null;
  }

  return {
    id: created.id,
    user_id: created.userId,
    title: created.title,
    patient_name: created.patientName,
    status: created.status,
    is_pinned: created.isPinned,
    folder_id: created.folderId,
    created_at: created.createdAt,
    updated_at: created.updatedAt,
  };
}

export async function renameSessionAction(id: string, newTitle: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await db
    .update(sessions)
    .set({
      title: newTitle,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(sessions.id, id), eq(sessions.userId, user.id)));
}

export async function deleteSessionAction(id: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await db.delete(sessions).where(and(eq(sessions.id, id), eq(sessions.userId, user.id)));
}

export async function togglePinAction(id: string, isPinned: boolean): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await db
    .update(sessions)
    .set({
      isPinned,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(sessions.id, id), eq(sessions.userId, user.id)));
}

export async function moveSessionToFolderAction(
  sessionId: string,
  folderId: string | null
): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await db
    .update(sessions)
    .set({
      folderId,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, user.id)));
}

export async function createFolderAction(name: string): Promise<Folder | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [created] = await db
    .insert(folders)
    .values({
      userId: user.id,
      name,
    })
    .returning();

  if (!created) {
    return null;
  }

  return {
    id: created.id,
    user_id: created.userId,
    name: created.name,
    created_at: created.createdAt,
  };
}
