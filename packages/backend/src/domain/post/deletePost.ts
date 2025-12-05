import { DBClient } from "../../infrastructure/database/connection";
import { TRPCError } from "@trpc/server";
import { softDeletePost as softDeletePostRepository, getPostById } from "./repository/post.repository";
import { Post } from "../../infrastructure/database/schema";
import { PostIdParamSchema } from "@shared/trpc/routers/post";

export async function deletePost(db: DBClient, input: PostIdParamSchema, currentUserId: string, currentUserRole: 'user' | 'admin'): Promise<Post> {
  try {
    // First, get the post to check ownership
    const existingPost = await getPostById(db, input.id);

    if (!existingPost) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Post not found',
      });
    }

    // Check if user has permission to delete this post
    const isOwner = existingPost.authorId === currentUserId;
    const isAdmin = currentUserRole === 'admin';

    if (!isOwner && !isAdmin) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to delete this post',
      });
    }

    const post = await softDeletePostRepository(db, input.id, currentUserId);
    return post;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to delete post',
    });
  }
}