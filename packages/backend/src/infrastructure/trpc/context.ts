import { inferAsyncReturnType } from '@trpc/server';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { db } from '../database/connection';

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const authorization = req.headers.authorization;
  let user: unknown | null = null;

  if (authorization) {
  }

  return {
    req,
    res,
    db,
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
