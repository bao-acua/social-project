import { beforeAll, afterAll, beforeEach } from 'vitest';
import postgres from 'postgres';
import { getDatabaseUrl } from '../infrastructure/config/env';
import { cleanupDatabase } from './helpers/database-transaction';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import { existsSync } from 'fs';
import path from 'path';

let setupClient: postgres.Sql | null = null;

beforeAll(async () => {
  const databaseUrl = getDatabaseUrl();
  setupClient = postgres(databaseUrl, { max: 1 });
  const db = drizzle(setupClient);

  try {
    const migrationsPath = path.resolve(__dirname, '../../../drizzle/migrations');
    const journalPath = path.join(migrationsPath, 'meta/_journal.json');

    if (existsSync(journalPath)) {
      await migrate(db, { migrationsFolder: migrationsPath });
    } else {
      console.warn('Migrations not found. Please run "yarn db:push" or "yarn db:generate && yarn db:migrate" first.');
      console.warn('Tests will attempt to run but may fail if schema is not set up.');
    }
  } catch (error) {
    console.error('Schema setup failed in test setup:', error);
    console.warn('Continuing without migrations - ensure database schema is set up manually');
  }
});

beforeEach(async () => {
  await cleanupDatabase();
});

afterAll(async () => {
  if (setupClient) {
    await setupClient.end();
  }
});

