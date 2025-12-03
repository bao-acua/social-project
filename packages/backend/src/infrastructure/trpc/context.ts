import { inferAsyncReturnType } from '@trpc/server';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { db } from '../database/connection';
import { extractBearerToken, verifyAccessToken } from '../auth/jwt';

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const authorization = req.headers.authorization;
  let user: unknown | null = null;

  if (authorization) {
    try {
      const token = await extractBearerToken(authorization);
      user = verifyAccessToken(token);
    } catch (error) {
      // Silently handle token verification errors
    }
  }
  return {
    req,
    res,
    db,
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
