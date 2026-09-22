import { relations } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import type { Json } from '@/types/database';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().notNull(),
  displayName: text('display_name'),
  hasMistralKey: boolean('has_mistral_key').default(false),
  hasLlmKey: boolean('has_llm_key').default(false),
  activeLlmProvider: text('active_llm_provider'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const folders = pgTable(
  'folders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  (table) => [index('folders_user_id_idx').on(table.userId)]
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
    title: text('title'),
    patientName: text('patient_name'),
    status: text('status').default('pending'),
    isPinned: boolean('is_pinned').default(false),
    folderId: uuid('folder_id').references(() => folders.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  (table) => [
    index('sessions_user_id_created_at_idx').on(table.userId, table.createdAt),
    index('sessions_folder_id_idx').on(table.folderId),
  ]
);

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
    fileName: text('file_name'),
    r2Key: text('r2_key'),
    ocrStatus: text('ocr_status').default('pending'),
    pageCount: integer('page_count'),
    docType: text('doc_type'),
    rawText: text('raw_text'),
    progress: integer('progress').default(0),
    stage: text('stage').default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  (table) => [
    index('documents_session_id_idx').on(table.sessionId),
    index('documents_user_id_idx').on(table.userId),
  ]
);

export const chunks = pgTable(
  'chunks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
    chunkIndex: integer('chunk_index'),
    pageNum: integer('page_num'),
    text: text('text'),
    embedding: text('embedding'),
    metadata: jsonb('metadata').$type<Json>(),
  },
  (table) => [index('chunks_session_id_idx').on(table.sessionId)]
);

export const runs = pgTable(
  'runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
    documentId: uuid('document_id').references(() => documents.id, { onDelete: 'set null' }),
    status: text('status').default('pending'),
    iterationCount: integer('iteration_count').default(0),
    trace: jsonb('trace').$type<Json>(),
    providerUsed: text('provider_used'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'string' }),
  },
  (table) => [index('runs_session_id_idx').on(table.sessionId)]
);

export const drafts = pgTable(
  'drafts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
    runId: uuid('run_id').references(() => runs.id, { onDelete: 'set null' }),
    version: integer('version').default(1),
    content: jsonb('content').$type<Json>(),
    editedContent: jsonb('edited_content').$type<Json>(),
    editDistance: doublePrecision('edit_distance'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  (table) => [index('drafts_session_id_created_at_idx').on(table.sessionId, table.createdAt)]
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
    role: text('role'),
    content: text('content'),
    metadata: jsonb('metadata').$type<Json>(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  (table) => [index('messages_session_id_created_at_idx').on(table.sessionId, table.createdAt)]
);

export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
    provider: text('provider'),
    keyType: text('key_type').default('llm'),
    keyLast4: text('key_last4'),
    keyEncrypted: text('key_encrypted'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  (table) => [index('api_keys_user_id_idx').on(table.userId)]
);

export const profilesRelations = relations(profiles, ({ many }) => ({
  folders: many(folders),
  sessions: many(sessions),
  documents: many(documents),
  apiKeys: many(apiKeys),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [folders.userId],
    references: [profiles.id],
  }),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [sessions.userId],
    references: [profiles.id],
  }),
  folder: one(folders, {
    fields: [sessions.folderId],
    references: [folders.id],
  }),
  documents: many(documents),
  chunks: many(chunks),
  runs: many(runs),
  drafts: many(drafts),
  messages: many(messages),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  session: one(sessions, {
    fields: [documents.sessionId],
    references: [sessions.id],
  }),
  profile: one(profiles, {
    fields: [documents.userId],
    references: [profiles.id],
  }),
  chunks: many(chunks),
  runs: many(runs),
}));

export const chunksRelations = relations(chunks, ({ one }) => ({
  document: one(documents, {
    fields: [chunks.documentId],
    references: [documents.id],
  }),
  session: one(sessions, {
    fields: [chunks.sessionId],
    references: [sessions.id],
  }),
}));

export const runsRelations = relations(runs, ({ one, many }) => ({
  session: one(sessions, {
    fields: [runs.sessionId],
    references: [sessions.id],
  }),
  document: one(documents, {
    fields: [runs.documentId],
    references: [documents.id],
  }),
  drafts: many(drafts),
}));

export const draftsRelations = relations(drafts, ({ one }) => ({
  session: one(sessions, {
    fields: [drafts.sessionId],
    references: [sessions.id],
  }),
  run: one(runs, {
    fields: [drafts.runId],
    references: [runs.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  session: one(sessions, {
    fields: [messages.sessionId],
    references: [sessions.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  profile: one(profiles, {
    fields: [apiKeys.userId],
    references: [profiles.id],
  }),
}));

export type Profile = typeof profiles.$inferSelect;

export type NewProfile = typeof profiles.$inferInsert;

export type Folder = typeof folders.$inferSelect;

export type NewFolder = typeof folders.$inferInsert;

export type Session = typeof sessions.$inferSelect;

export type NewSession = typeof sessions.$inferInsert;

export type Document = typeof documents.$inferSelect;

export type NewDocument = typeof documents.$inferInsert;

export type Chunk = typeof chunks.$inferSelect;

export type NewChunk = typeof chunks.$inferInsert;

export type Run = typeof runs.$inferSelect;

export type NewRun = typeof runs.$inferInsert;

export type Draft = typeof drafts.$inferSelect;

export type NewDraft = typeof drafts.$inferInsert;

export type Message = typeof messages.$inferSelect;

export type NewMessage = typeof messages.$inferInsert;

export type ApiKey = typeof apiKeys.$inferSelect;

export type NewApiKey = typeof apiKeys.$inferInsert;
