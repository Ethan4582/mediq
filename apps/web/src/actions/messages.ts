'use server';

import { asc, eq } from 'drizzle-orm';
import { db, messages } from '@/db';
import type { Message } from '@/types/app';

export async function getMessagesAction(sessionId: string): Promise<Message[]> {
  if (!sessionId || sessionId === 'new') {
    return [];
  }

  const dbMessages = await db.query.messages.findMany({
    where: eq(messages.sessionId, sessionId),
    orderBy: [asc(messages.createdAt)],
  });

  return dbMessages.map((m) => ({
    id: m.id,
    session_id: m.sessionId,
    role: m.role,
    content: m.content,
    metadata: m.metadata,
    created_at: m.createdAt,
  }));
}
