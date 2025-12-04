import { DBClient } from '../../infrastructure/database/connection';
import { TRPCError } from '@trpc/server';
import { updateComment as updateCommentRepository, getCommentById } from './repository/comment.repository';
import { UpdateCommentInputSchema, UpdateCommentResponse } from '@shared/trpc/routers/comment';
import { ResourceNotFoundError, PermissionError, PreconditionError } from '../../lib/errors';

export async function updateComment(
  db: DBClient,
  id: string,
  input: UpdateCommentInputSchema,
  currentUserId: string
): Promise<UpdateCommentResponse> {
  try {
    const comment = await getCommentById(db, id);

    if (!comment) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Comment not found',
        cause: new ResourceNotFoundError('Comment not found', { type: 'comment', id }),
      });
    }

    if (comment.isDeleted) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Cannot update deleted comment',
        cause: new PreconditionError('Cannot update deleted comment', [{ type: 'comment', id }]),
      });
    }

    if (comment.authorId !== currentUserId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You can only edit your own comments',
        cause: new PermissionError('You can only edit your own comments', { type: 'user', id: currentUserId }, {
          type: 'comment',
          id,
        }),
      });
    }

    const updatedComment = await updateCommentRepository(db, id, input.content, currentUserId);

    return {
      comment: {
        id: updatedComment.id,
        content: updatedComment.content,
        author: {
          id: updatedComment.author.id,
          username: updatedComment.author.username,
          fullName: updatedComment.author.fullName,
          initials: updatedComment.author.initials,
          role: updatedComment.author.role,
        },
        postId: updatedComment.postId,
        parentCommentId: updatedComment.parentCommentId,
        isDeleted: updatedComment.isDeleted,
        isEdited: updatedComment.isEdited,
        editedAt: updatedComment.editedAt,
        editedByAdmin: updatedComment.isEdited && updatedComment.editedBy !== null && updatedComment.editedBy !== updatedComment.authorId,
        createdAt: updatedComment.createdAt,
        updatedAt: updatedComment.updatedAt,
      },
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to update comment',
    });
  }
}

