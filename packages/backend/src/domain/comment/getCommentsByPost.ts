import { DBClient } from '../../infrastructure/database/connection';
import { TRPCError } from '@trpc/server';
import { getCommentsByPostId as getCommentsByPostIdRepository, countCommentsByPostId } from './repository/comment.repository';
import { CommentQuerySchemaInput, CommentsByPostResponse } from '@shared/trpc/routers/comment';

export async function getCommentsByPost(
  db: DBClient,
  postId: string,
  input: CommentQuerySchemaInput
): Promise<CommentsByPostResponse> {
  try {
    const { limit, offset } = input;

    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safeOffset = Math.max(offset, 0);

    const [commentsData, total] = await Promise.all([
      getCommentsByPostIdRepository(db, postId, safeLimit, safeOffset),
      countCommentsByPostId(db, postId),
    ]);

    const comments = commentsData.map((comment) => ({
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.author.id,
        username: comment.author.username,
        fullName: comment.author.fullName,
        initials: comment.author.initials,
        role: comment.author.role,
      },
      postId: comment.postId,
      parentCommentId: comment.parentCommentId,
      isDeleted: comment.isDeleted,
      isEdited: comment.isEdited,
      editedAt: comment.editedAt,
      editedByAdmin: comment.isEdited && comment.editedBy !== null && comment.editedBy !== comment.authorId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));

    return {
      comments,
      pagination: {
        limit: safeLimit,
        offset: safeOffset,
        total,
      },
    };
  } catch (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get comments',
    });
  }
}

