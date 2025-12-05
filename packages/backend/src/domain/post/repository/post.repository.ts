import { DBClient } from "../../../infrastructure/database/connection";
import { comments, NewPost, Post, posts, User, users } from "../../../infrastructure/database/schema";
import { eq, desc, sql, and, inArray, isNull } from "drizzle-orm";


export type PostWithAuthor = Post & { author: User };

export async function getPosts(db: DBClient, limit: number, offset: number, includeDeleted: boolean = false): Promise<PostWithAuthor[]> {
  const query = db
    .select({
      id: posts.id,
      content: posts.content,
      authorId: posts.authorId,
      isDeleted: posts.isDeleted,
      deletedAt: posts.deletedAt,
      deletedBy: posts.deletedBy,
      isEdited: posts.isEdited,
      editedAt: posts.editedAt,
      editedBy: posts.editedBy,
      searchVector: posts.searchVector,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      author: users,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id));

  if (!includeDeleted) {
    query.where(eq(posts.isDeleted, false));
  }

  const results = await query
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  return results.map((row): PostWithAuthor => {
    const { author, ...postFields } = row;
    return {
      ...postFields,
      author,
    };
  });
}


export async function countTimeline(db: DBClient, includeDeleted: boolean = false): Promise<number> {
  const query = db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(posts);

  if (!includeDeleted) {
    query.where(eq(posts.isDeleted, false));
  }

  const result = await query;
  return result[0]?.count ?? 0;
}


export async function countCommentsByPostIds(db: DBClient, postIds: string[]): Promise<Map<string, number>> {
  if (postIds.length === 0) {
    return new Map();
  }

  const results = await db
    .select({
      postId: comments.postId,
      count: sql<number>`count(*)::int`,
    })
    .from(comments)
    .where(
      and(
        inArray(comments.postId, postIds),
        eq(comments.isDeleted, false),
        isNull(comments.parentCommentId)
      )
    )
    .groupBy(comments.postId);

  const countMap = new Map<string, number>();
  for (const result of results) {
    countMap.set(result.postId, result.count);
  }

  for (const postId of postIds) {
    if (!countMap.has(postId)) {
      countMap.set(postId, 0);
    }
  }

  return countMap;
}

export async function getPostById(db: DBClient, id: string): Promise<Post | undefined> {
  const post = await db.query.posts.findFirst({
    where: (posts, { eq }) => eq(posts.id, id),
  });
  return post;
}

export async function updatePost(db: DBClient, id: string, content: string, userId: string): Promise<PostWithAuthor> {
  const [post] = await db
    .update(posts)
    .set({
      content,
      isEdited: true,
      editedAt: new Date(),
      editedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();

  if (!post) {
    throw new Error(`Post with id ${id} not found`);
  }

  const author = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, post.authorId),
  });

  if (!author) {
    throw new Error(`Author with id ${post.authorId} not found`);
  }

  return {
    ...post,
    author,
  };
}


export async function softDeletePost(db: DBClient, id: string, userId: string): Promise<Post> {
  const [post] = await db
    .update(posts)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();

  return post!;
}

export async function createPost(db: DBClient, data: NewPost): Promise<Post> {
  const [post] = await db.insert(posts).values(data).returning();
  return post!;
}

export async function searchPosts(
  db: DBClient,
  query: string,
  limit: number,
  offset: number,
  includeDeleted: boolean = false
): Promise<PostWithAuthor[]> {
  const searchQuery = query.trim().split(/\s+/).join(' & ');

  const searchCondition = sql`(
    ${posts.searchVector} @@ to_tsquery('english', ${searchQuery})
    OR ${users.searchVector} @@ to_tsquery('english', ${searchQuery})
  )`;

  const whereConditions = includeDeleted
    ? [searchCondition]
    : [eq(posts.isDeleted, false), searchCondition];

  const results = await db
    .select({
      id: posts.id,
      content: posts.content,
      authorId: posts.authorId,
      isDeleted: posts.isDeleted,
      deletedAt: posts.deletedAt,
      deletedBy: posts.deletedBy,
      isEdited: posts.isEdited,
      editedAt: posts.editedAt,
      editedBy: posts.editedBy,
      searchVector: posts.searchVector,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      author: users,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(and(...whereConditions))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  return results.map((row): PostWithAuthor => {
    const { author, ...postFields } = row;
    return {
      ...postFields,
      author,
    };
  });
}

export async function countSearchResults(db: DBClient, query: string, includeDeleted: boolean = false): Promise<number> {
  const searchQuery = query.trim().split(/\s+/).join(' & ');

  const searchCondition = sql`(
    ${posts.searchVector} @@ to_tsquery('english', ${searchQuery})
    OR ${users.searchVector} @@ to_tsquery('english', ${searchQuery})
  )`;

  const whereConditions = includeDeleted
    ? [searchCondition]
    : [eq(posts.isDeleted, false), searchCondition];

  const result = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(and(...whereConditions));

  return result[0]?.count ?? 0;
}