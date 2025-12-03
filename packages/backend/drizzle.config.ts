import { defineConfig } from 'drizzle-kit';
import { env } from './src/infrastructure/config/env';


export default defineConfig({
  schema: './src/infrastructure/database/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  migrations: {
    prefix: 'timestamp'
  }
});

