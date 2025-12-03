import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { env } from '../config/env';

const runMigrations = async () => {
  const queryClient = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(queryClient);

  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle/migrations' });
  console.log('Migrations completed!');

  await queryClient.end();
};

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});

