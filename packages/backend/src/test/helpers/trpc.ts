import type { TestDBClient } from '../../infrastructure/database/test-connection';
import type { Context } from '../../infrastructure/trpc/context';
import { appRouter } from '../../infrastructure/trpc/router';
import { getTestDatabase } from './database-transaction';

export function createTestContext(db: TestDBClient, user?: { userId: string; username: string; role: string }): Context {
  return {
    req: {} as any,
    res: {} as any,
    db: db as any,
    user: user ? {
      userId: user.userId,
      username: user.username,
      role: user.role as 'user' | 'admin',
    } : undefined,
  };
}

export function createTestCaller(db: TestDBClient, user?: { userId: string; username: string; role: string }) {
  const context = createTestContext(db, user);
  return appRouter.createCaller(context);
}

export { getTestDatabase };

