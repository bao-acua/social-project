import { getTestDb, type TestDBClient } from '../../infrastructure/database/test-connection';
import { users, refreshTokens, posts, comments } from '../../infrastructure/database/schema';
import { sql } from 'drizzle-orm';

export function getTestDatabase(): TestDBClient {
  return getTestDb();
}

export async function cleanupDatabase() {
  const db = getTestDb();

  await db.execute(sql`TRUNCATE TABLE ${comments}, ${posts}, ${refreshTokens}, ${users} RESTART IDENTITY CASCADE`);
}

