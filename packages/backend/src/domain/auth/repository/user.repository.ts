import { DBClient } from '../../../infrastructure/database/connection';
import { NewUser, User, users } from '../../../infrastructure/database/schema/users';
import { eq } from 'drizzle-orm';

export function findUserByUsername(db: DBClient, username: string) {
  return db.query.users.findFirst({
    where: (users, { eq }) => eq(users.username, username),
  });
}

export async function createUser(db: DBClient, user: NewUser): Promise<User | undefined> {
  const [newUser] = await db.insert(users).values(user).returning();
  return newUser;
}

export async function findUserById(db: DBClient, id: string): Promise<User | undefined> {
  return db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, id),
  });
}

export async function updateUserProfile(
  db: DBClient,
  userId: string,
  data: { fullName: string; initials: string }
): Promise<User | undefined> {
  const [updatedUser] = await db
    .update(users)
    .set({
      fullName: data.fullName,
      initials: data.initials,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return updatedUser;
}