import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

declare global {
  var _dbConn: postgres.Sql | undefined;
}

const conn =
  globalThis._dbConn ??
  postgres(connectionString, {
    prepare: false,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis._dbConn = conn;
}

export const db = drizzle(conn, { schema });

export type Database = typeof db;

export * from './schema';
