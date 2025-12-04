import { DBClient } from '../../../infrastructure/database/connection';
import { NewUser, User, users } from '../../../infrastructure/database/schema/users';

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