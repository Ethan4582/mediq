import { describe, expect, it } from 'vitest';
import { getMessagesAction, type MessageReader } from '../messages';

const fakeReader: MessageReader = {
  findMessages: async () => [
    {
      id: 'msg-1',
      sessionId: 'sess-123',
      role: 'user',
      content: 'Hello doctor',
      metadata: null,
      createdAt: '2026-09-22T00:00:00Z',
    },
  ],
};

describe('getMessagesAction', () => {
  it('returns empty array if sessionId is empty', async () => {
    const result = await getMessagesAction('');

    expect(result).toEqual([]);
  });

  it('returns empty array if sessionId is new', async () => {
    const result = await getMessagesAction('new');

    expect(result).toEqual([]);
  });

  it('queries messages and maps fields accurately', async () => {
    const result = await getMessagesAction('sess-123', fakeReader);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'msg-1',
      session_id: 'sess-123',
      role: 'user',
      content: 'Hello doctor',
      metadata: null,
      created_at: '2026-09-22T00:00:00Z',
    });
  });
});
