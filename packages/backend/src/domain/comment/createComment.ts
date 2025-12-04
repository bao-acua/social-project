import { DBClient } from '../../infrastructure/database/connection';
import { TRPCError } from '@trpc/server';
import { createComment as createCommentRepository, getCommentById } from './repository/comment.repository';
import { findUserById } from '../auth/repository/user.repository';
import { CreateCommentInputSchema, CreateCommentResponse } from '@shared/trpc/routers/comment';
import { ResourceNotFoundError, PreconditionError } from '../../lib/errors';

export async function createComment(
  db: DBClient,
  postId: string,
  input: CreateCommentInputSchema,
  currentUserId: string
): Promise<CreateCommentResponse> {
  try {
    const post = await db.query.posts.findFirst({
      where: (posts, { eq }) => eq(posts.id, postId),
    });

    if (!post) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Post not found',
        cause: new ResourceNotFoundError('Post not found', { type: 'post', id: postId }),
      });
    }

    if (post.isDeleted) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Cannot comment on deleted post',
        cause: new PreconditionError('Cannot comment on deleted post', [{ type: 'post', id: postId }]),
      });
    }

    if (input.parentCommentId) {
      const parentComment = await getCommentById(db, input.parentCommentId);

      if (!parentComment) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Parent comment not found',
          cause: new ResourceNotFoundError('Parent comment not found', {
            type: 'comment',
            id: input.parentCommentId,
          }),
        });
      }

      if (parentComment.isDeleted) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot reply to deleted comment',
          cause: new PreconditionError('Cannot reply to deleted comment', [
            { type: 'comment', id: input.parentCommentId },
          ]),
        });
      }

      if (parentComment.postId !== postId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Parent comment does not belong to this post',
          cause: new PreconditionError('Parent comment does not belong to this post', [
            { type: 'comment', id: input.parentCommentId },
          ]),
        });
      }
    }

    const comment = await createCommentRepository(db, {
      content: input.content,
      postId: postId,
      authorId: currentUserId,
      parentCommentId: input.parentCommentId || null,
      isDeleted: false,
      isEdited: false,
      editedAt: null,
      editedBy: null,
      deletedAt: null,
      deletedBy: null,
    });

    const author = await findUserById(db, comment.authorId);

    if (!author) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Author not found',
        cause: new ResourceNotFoundError('Author not found', { type: 'user', id: currentUserId }),
      });
    }

    return {
      comment: {
        id: comment.id,
        content: comment.content,
        author: {
          id: author.id,
          username: author.username,
          fullName: author.fullName,
          initials: author.initials,
          role: author.role,
        },
        postId: comment.postId,
        parentCommentId: comment.parentCommentId,
        isDeleted: comment.isDeleted,
        isEdited: comment.isEdited,
        editedAt: comment.editedAt,
        editedByAdmin: false,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create comment',
    });
  }
}

