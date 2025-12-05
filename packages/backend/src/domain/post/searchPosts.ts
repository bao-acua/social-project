import { PostResponse, SearchPostsInput } from "@shared/trpc/routers/post";
import { TRPCError } from "@trpc/server";
import { db } from "../../infrastructure/database/connection";
import { searchPosts as searchPostsRepository, countSearchResults, countCommentsByPostIds } from "./repository/post.repository";

export async function searchPosts(input: SearchPostsInput, currentUserRole: string) {
  try {
    const { query, limit, offset, includeDeleted } = input;

    // Only admins can request deleted posts
    const canIncludeDeleted = includeDeleted && currentUserRole === 'admin';

    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safeOffset = Math.max(offset, 0);

    const [postsData, total] = await Promise.all([
      searchPostsRepository(db, query, safeLimit, safeOffset, canIncludeDeleted),
      countSearchResults(db, query, canIncludeDeleted),
    ]);

    const postIds = postsData.map(post => post.id);

    const commentCounts = await countCommentsByPostIds(db, postIds);

    const posts: PostResponse[] = postsData.map((post) => ({
      id: post.id,
      content: post.content,
      author: post.author,
      isDeleted: post.isDeleted,
      isEdited: post.isEdited,
      editedAt: post.editedAt,
      editedByAdmin: post.isEdited && post.editedBy !== null && post.editedBy !== post.authorId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      commentsCount: commentCounts.get(post.id) ?? 0,
    }));

    return {
      posts: posts,
      pagination: {
        limit: safeLimit,
        offset: safeOffset,
        total: total,
      },
    };
  } catch (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to search posts',
    });
  }
}
