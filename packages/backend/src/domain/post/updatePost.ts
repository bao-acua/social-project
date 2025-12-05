import { DBClient } from "../../infrastructure/database/connection";
import { TRPCError } from "@trpc/server";
import { countCommentsByPostIds, updatePost as updatePostRepository, getPostById } from "./repository/post.repository";
import { UpdatePostInputSchema, UpdatePostResponse } from "@shared/trpc/routers/post";

export async function updatePost(db: DBClient, input: UpdatePostInputSchema, currentUserId: string, currentUserRole: 'user' | 'admin'): Promise<UpdatePostResponse> {
  try {
    // First, get the post to check ownership
    const existingPost = await getPostById(db, input.id);

    if (!existingPost) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Post not found',
      });
    }

    // Check if user has permission to edit this post
    const isOwner = existingPost.authorId === currentUserId;
    const isAdmin = currentUserRole === 'admin';

    if (!isOwner && !isAdmin) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to edit this post',
      });
    }

    const post = await updatePostRepository(db, input.id, input.content, currentUserId);
    const commentCounts = await countCommentsByPostIds(db, [post.id]);
    const commentsCount = commentCounts.get(post.id) ?? 0;
    return {
      post: {
        id: post.id,
        content: post.content,
        author: {
          id: post.author.id,
          username: post.author.username,
          fullName: post.author.fullName,
          initials: post.author.initials,
          role: post.author.role,
        },
        isDeleted: post.isDeleted,
        isEdited: post.isEdited,
        editedAt: post.editedAt,
        editedByAdmin: post.isEdited && post.editedBy !== null && post.editedBy !== post.authorId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        commentsCount: commentsCount,
      },
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to update post',
    });
  }
}