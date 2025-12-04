import { DBClient } from "../../infrastructure/database/connection";
import { TRPCError } from "@trpc/server";
import { softDeletePost as softDeletePostRepository } from "./repository/post.repository";
import { Post } from "../../infrastructure/database/schema";
import { PostIdParamSchema } from "@shared/trpc/routers/post";

export async function deletePost(db: DBClient, input: PostIdParamSchema, currentUserId: string): Promise<Post> {
  try {
    const post = await softDeletePostRepository(db, input.id, currentUserId);
    return post;
  } catch (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to delete post',
    });
  }
}