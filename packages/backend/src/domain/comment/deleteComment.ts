import { DBClient } from '../../infrastructure/database/connection';
import { TRPCError } from '@trpc/server';
import { softDeleteComment as softDeleteCommentRepository, getCommentById } from './repository/comment.repository';
import { ResourceNotFoundError, PermissionError, PreconditionError } from '../../lib/errors';

export async function deleteComment(db: DBClient, id: string, currentUserId: string, userRole: 'user' | 'admin'): Promise<void> {
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
        message: 'Comment is already deleted',
        cause: new PreconditionError('Comment is already deleted', [{ type: 'comment', id }]),
      });
    }

    // Allow comment author or admin to delete
    if (comment.authorId !== currentUserId && userRole !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You can only delete your own comments',
        cause: new PermissionError('You can only delete your own comments', { type: 'user', id: currentUserId }, {
          type: 'comment',
          id,
        }),
      });
    }

    await softDeleteCommentRepository(db, id, currentUserId);
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to delete comment',
    });
  }
}

