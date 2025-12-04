import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getDatabaseUrl } from '../config/env';
import * as schema from './schema';
import type { DBClient } from './connection';

let testQueryClient: postgres.Sql | null = null;
let testDb: DBClient | null = null;

export function getTestDb(): DBClient {
  if (!testDb) {
    const databaseUrl = getDatabaseUrl();
    testQueryClient = postgres(databaseUrl, { max: 1 });
    testDb = drizzle(testQueryClient, { schema }) as DBClient;
  }
  return testDb;
}

export async function closeTestDb() {
  if (testQueryClient) {
    await testQueryClient.end();
    testQueryClient = null;
    testDb = null;
  }
}

export type TestDBClient = DBClient;

