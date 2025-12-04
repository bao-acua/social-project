import { users, posts, comments } from '../../infrastructure/database/schema';
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

export async function createTestPost(db: DBClient, postData?: Partial<typeof posts.$inferInsert>) {
  const [post] = await db.insert(posts).values({
    content: postData?.content || 'Test post content',
    authorId: postData?.authorId || '',
    isDeleted: postData?.isDeleted || false,
    isEdited: postData?.isEdited || false,
    editedAt: postData?.editedAt || null,
    editedBy: postData?.editedBy || null,
    ...postData,
  }).returning();

  if (!post) {
    throw new Error('Failed to create test post');
  }

  return post;
}

export async function createTestComment(db: DBClient, commentData?: Partial<typeof comments.$inferInsert>) {
  const [comment] = await db.insert(comments).values({
    content: commentData?.content || 'Test comment content',
    postId: commentData?.postId || '',
    authorId: commentData?.authorId || '',
    parentCommentId: commentData?.parentCommentId || null,
    isDeleted: commentData?.isDeleted || false,
    isEdited: commentData?.isEdited || false,
    editedAt: commentData?.editedAt || null,
    editedBy: commentData?.editedBy || null,
    deletedAt: commentData?.deletedAt || null,
    deletedBy: commentData?.deletedBy || null,
    ...commentData,
  }).returning();

  if (!comment) {
    throw new Error('Failed to create test comment');
  }

  return comment;
}
