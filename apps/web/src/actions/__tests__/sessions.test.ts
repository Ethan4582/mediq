import { describe, expect, it } from 'vitest';
import {
  getSessionAction,
  getSessionsAndFoldersAction,
  type SessionReader,
  type SingleSessionReader,
} from '../sessions';
import type { User } from '@supabase/supabase-js';

const mockUser: User = {
  id: 'user-456',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2026-09-22T00:00:00Z',
};

const fakeReader: SessionReader = {
  getUser: async () => mockUser,
  findSessions: async () => [
    {
      id: 'sess-1',
      userId: 'user-456',
      title: 'Cardiology Review',
      patientName: 'Jane Doe',
      status: 'completed',
      isPinned: true,
      folderId: null,
      createdAt: '2026-09-22T00:00:00Z',
      updatedAt: '2026-09-22T01:00:00Z',
    },
  ],
  findFolders: async () => [
    {
      id: 'folder-1',
      userId: 'user-456',
      name: 'Inpatient',
      createdAt: '2026-09-22T00:00:00Z',
    },
  ],
};

const fakeSingleReader: SingleSessionReader = {
  getUser: async () => mockUser,
  findSession: async () => ({
    id: 'sess-1',
    userId: 'user-456',
    title: 'Cardiology Review',
    patientName: 'Jane Doe',
    status: 'completed',
    isPinned: true,
    folderId: null,
    createdAt: '2026-09-22T00:00:00Z',
    updatedAt: '2026-09-22T01:00:00Z',
  }),
};

describe('sessions actions', () => {
  it('returns empty lists if user is unauthenticated', async () => {
    const data = await getSessionsAndFoldersAction({
      getUser: async () => null,
    });

    expect(data.sessions).toEqual([]);
    expect(data.folders).toEqual([]);
  });

  it('retrieves user sessions and folders', async () => {
    const data = await getSessionsAndFoldersAction(fakeReader);

    expect(data.sessions).toHaveLength(1);
    expect(data.folders).toHaveLength(1);
    expect(data.sessions[0]?.title).toBe('Cardiology Review');
    expect(data.folders[0]?.name).toBe('Inpatient');
  });

  it('retrieves a single session by id', async () => {
    const session = await getSessionAction('sess-1', fakeSingleReader);

    expect(session).not.toBeNull();
    expect(session?.id).toBe('sess-1');
    expect(session?.patient_name).toBe('Jane Doe');
  });
});
