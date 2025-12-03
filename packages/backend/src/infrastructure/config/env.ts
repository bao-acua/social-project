import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().default('postgres://localhost:5432/social_project_db'),
  CORS_ORIGIN: z.string().default('http://localhost:3001'),
  INTERNAL_API_KEY: z.string().default(randomUUID()),
  PUBLIC_DIR: z.string().default(() => {
    return process.env.NODE_ENV == 'production' ? './dist' : './public';
  }),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
