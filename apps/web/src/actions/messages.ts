'use server';

import { asc, eq } from 'drizzle-orm';
import { db, messages } from '@/db';
import type { Message } from '@/types/app';
import type { Json } from '@/types/database';

export interface MessageReader {
  findMessages?: (sessionId: string) => Promise<
    Array<{
      id: string;
      sessionId: string;
      role: string;
      content: string;
      metadata: Json;
      createdAt: string;
    }>
  >;
}

export async function getMessagesAction(
  sessionId: string,
  reader?: MessageReader
): Promise<Message[]> {
  if (!sessionId || sessionId === 'new') {
    return [];
  }

  const dbMessages = reader?.findMessages
    ? await reader.findMessages(sessionId)
    : await db.query.messages.findMany({
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
