import { users } from '../../infrastructure/database/schema';
import { eq } from 'drizzle-orm';
import type { DBClient } from '../../infrastructure/database/connection';

export async function createTestUser(db: DBClient, userData?: Partial<typeof users.$inferInsert>) {
  const [user] = await db.insert(users).values({
    username: userData?.username || `testuser_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    password: userData?.password || '$2b$10$hashedpassword',
    fullName: userData?.fullName || 'Test User',
    initials: userData?.initials || 'TU',
    role: userData?.role || 'user',
    ...userData,
  }).returning();

  return user;
}

export async function findTestUser(db: DBClient, username: string) {
  return db.query.users.findFirst({
    where: (users, { eq }) => eq(users.username, username),
  });
}

export async function deleteTestUser(db: DBClient, userId: string) {
  await db.delete(users).where(eq(users.id, userId));
}

