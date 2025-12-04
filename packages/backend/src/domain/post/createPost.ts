import { DBClient } from "../../infrastructure/database/connection";
import { TRPCError } from "@trpc/server";
import { createPost as createPostRepository } from "./repository/post.repository";
import { findUserById } from "../auth/repository/user.repository";
import { CreatePostInputSchema, CreatePostResponse } from "@shared/trpc/routers/post";

export async function createPost(db: DBClient, input: CreatePostInputSchema, currentUserId: string): Promise<CreatePostResponse> {
  try {
    const post = await createPostRepository(db, {
      content: input.content,
      authorId: currentUserId,
      isDeleted: false,
      isEdited: false,
      editedAt: null,
      editedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const author = await findUserById(db, post.authorId);

    if (!author) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Author not found',
      });
    }

    return {
      post: {
        id: post.id,
        content: post.content,
        author: {
          id: author.id,
          username: author.username,
          fullName: author.fullName,
          initials: author.initials,
          role: author.role,
        },
        isDeleted: post.isDeleted,
        isEdited: post.isEdited,
        editedAt: post.editedAt,
        editedByAdmin: post.isEdited && post.editedBy !== null && post.editedBy !== post.authorId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        commentsCount: 0,
      },
    };
  } catch (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to update post',
    });
  }
}