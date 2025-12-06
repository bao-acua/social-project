import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../packages/backend/src/infrastructure/database/schema';
import { sql } from 'drizzle-orm';

const DATABASE_TEST_URL = process.env.DATABASE_TEST_URL || 'postgres://localhost:5432/social_project_test_db';

export const getTestDatabaseConnection = () => {
  const client = postgres(DATABASE_TEST_URL);
  return drizzle(client, { schema });
};

export const clearDatabase = async () => {
  const db = getTestDatabaseConnection();

  // Delete all data from tables in correct order (respecting foreign keys)
  await db.delete(schema.comments);
  await db.delete(schema.posts);
  await db.delete(schema.refreshTokens);
  await db.delete(schema.users);
};

export const resetDatabase = async () => {
  await clearDatabase();
};

// Helper to create test users directly in the database
export const createTestUser = async (userData: {
  username: string;
  password: string;
  fullName: string;
  role?: 'user' | 'admin';
}) => {
  const db = getTestDatabaseConnection();
  const bcrypt = await import('bcrypt');

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const initials = userData.fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const [user] = await db.insert(schema.users).values({
    username: userData.username,
    password: hashedPassword,
    fullName: userData.fullName,
    initials,
    role: userData.role || 'user',
  }).returning();

  return user;
};

export const createTestPost = async (postData: {
  content: string;
  authorId: number;
  isDeleted?: boolean;
  deletedBy?: number;
}) => {
  const db = getTestDatabaseConnection();

  const [post] = await db.insert(schema.posts).values({
    content: postData.content,
    authorId: postData.authorId,
    isDeleted: postData.isDeleted || false,
    deletedBy: postData.deletedBy,
    deletedAt: postData.isDeleted ? new Date() : null,
  }).returning();

  return post;
};
