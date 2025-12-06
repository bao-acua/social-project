import { DBClient } from '../../../infrastructure/database/connection';
import { comments, Comment, NewComment, User, users } from '../../../infrastructure/database/schema';
import { eq, desc, and, isNull, sql } from 'drizzle-orm';

export type CommentWithAuthor = Comment & { author: User };

export async function getCommentsByPostId(
  db: DBClient,
  postId: string,
  limit: number,
  offset: number,
  includeDeleted: boolean = false
): Promise<CommentWithAuthor[]> {
  const whereConditions = [
    eq(comments.postId, postId),
    isNull(comments.parentCommentId)
  ];

  // Only filter out deleted comments if not an admin
  if (!includeDeleted) {
    whereConditions.push(eq(comments.isDeleted, false));
  }

  const query = db
    .select({
      id: comments.id,
      content: comments.content,
      postId: comments.postId,
      authorId: comments.authorId,
      parentCommentId: comments.parentCommentId,
      isDeleted: comments.isDeleted,
      deletedAt: comments.deletedAt,
      deletedBy: comments.deletedBy,
      isEdited: comments.isEdited,
      editedAt: comments.editedAt,
      editedBy: comments.editedBy,
      searchVector: comments.searchVector,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      author: users,
    })
    .from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(and(...whereConditions))
    .orderBy(desc(comments.createdAt))
    .limit(limit)
    .offset(offset);

  const results = await query;

  return results.map((row): CommentWithAuthor => {
    const { author, ...commentFields } = row;
    return {
      ...commentFields,
      author,
    };
  });
}

export async function getCommentById(db: DBClient, id: string): Promise<CommentWithAuthor | null> {
  const result = await db
    .select({
      id: comments.id,
      content: comments.content,
      postId: comments.postId,
      authorId: comments.authorId,
      parentCommentId: comments.parentCommentId,
      isDeleted: comments.isDeleted,
      deletedAt: comments.deletedAt,
      deletedBy: comments.deletedBy,
      isEdited: comments.isEdited,
      editedAt: comments.editedAt,
      editedBy: comments.editedBy,
      searchVector: comments.searchVector,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      author: users,
    })
    .from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.id, id))
    .limit(1);

  if (!result[0]) {
    return null;
  }

  const { author, ...commentFields } = result[0];
  return {
    ...commentFields,
    author,
  };
}

export async function createComment(db: DBClient, data: NewComment): Promise<Comment> {
  const [comment] = await db.insert(comments).values(data).returning();
  if (!comment) {
    throw new Error('Failed to create comment');
  }
  return comment;
}

export async function updateComment(
  db: DBClient,
  id: string,
  content: string,
  userId: string
): Promise<CommentWithAuthor> {
  const [comment] = await db
    .update(comments)
    .set({
      content,
      isEdited: true,
      editedAt: new Date(),
      editedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, id))
    .returning();

  if (!comment) {
    throw new Error(`Comment with id ${id} not found`);
  }

  const author = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, comment.authorId),
  });

  if (!author) {
    throw new Error(`Author with id ${comment.authorId} not found`);
  }

  return {
    ...comment,
    author,
  };
}

export async function softDeleteComment(db: DBClient, id: string, userId: string): Promise<Comment> {
  const [comment] = await db
    .update(comments)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, id))
    .returning();

  if (!comment) {
    throw new Error(`Comment with id ${id} not found`);
  }

  return comment;
}

export async function countCommentsByPostId(db: DBClient, postId: string, includeDeleted: boolean = false): Promise<number> {
  const whereConditions = [eq(comments.postId, postId)];

  // Only filter out deleted comments if not an admin
  if (!includeDeleted) {
    whereConditions.push(eq(comments.isDeleted, false));
  }

  const result = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(comments)
    .where(and(...whereConditions));

  return result[0]?.count ?? 0;
}

