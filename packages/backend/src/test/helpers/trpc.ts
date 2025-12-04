import type { TestDBClient } from '../../infrastructure/database/test-connection';
import type { Context } from '../../infrastructure/trpc/context';
import { appRouter } from '../../infrastructure/trpc/router';
import { getTestDatabase } from './database-transaction';
import { createTestUser } from './database';
import { hashPassword } from '../../lib/password/password';

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

export async function loginByUser(db: TestDBClient, userData?: { username?: string; fullName?: string }) {
  const password = 'TestPassword123!';
  const hashedPassword = await hashPassword(password);
  const user = await createTestUser(db, {
    username: userData?.username || `testuser_${Date.now()}`,
    password: hashedPassword,
    fullName: userData?.fullName || 'Test User',
    role: 'user',
  });

  if (!user) {
    throw new Error('Failed to create test user');
  }

  const caller = createTestCaller(db, {
    userId: user.id,
    username: user.username,
    role: user.role,
  });

  return { caller, user, password };
}

export async function loginByAdmin(db: TestDBClient, userData?: { username?: string; fullName?: string }) {
  const password = 'TestPassword123!';
  const hashedPassword = await hashPassword(password);

  const user = await createTestUser(db, {
    username: userData?.username || `admin_${Date.now()}`,
    password: hashedPassword,
    fullName: userData?.fullName || 'Admin User',
    role: 'admin',
  });

  if (!user) {
    throw new Error('Failed to create test admin user');
  }

  const caller = createTestCaller(db, {
    userId: user.id,
    username: user.username,
    role: user.role,
  });

  return { caller, user, password };
}

export { getTestDatabase };

