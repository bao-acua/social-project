import { router } from "../../infrastructure/trpc/trpc";
import { authenticatedProcedure } from "../../infrastructure/trpc/procedure";
import {
  createCommentInputSchema,
  createCommentResponseSchema,
  updateCommentInputSchema,
  updateCommentResponseSchema,
  getCommentsByPostInputSchema,
  commentsByPostResponseSchema,
  commentIdParamSchema,
} from "@shared/trpc/routers/comment";
import { createComment } from "../../domain/comment/createComment";
import { updateComment } from "../../domain/comment/updateComment";
import { deleteComment } from "../../domain/comment/deleteComment";
import { getCommentsByPost } from "../../domain/comment/getCommentsByPost";

export const commentRouter = router({
  createComment: authenticatedProcedure
    .input(createCommentInputSchema)
    .output(createCommentResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const { postId, ...commentData } = input;
      return await createComment(ctx.db, postId, commentData, ctx.user!.userId);
    }),

  getCommentsByPost: authenticatedProcedure
    .input(getCommentsByPostInputSchema)
    .output(commentsByPostResponseSchema)
    .query(async ({ input, ctx }) => {
      const { postId, ...queryData } = input;
      return await getCommentsByPost(ctx.db, postId, queryData, ctx.user!.role);
    }),

  updateComment: authenticatedProcedure
    .input(updateCommentInputSchema)
    .output(updateCommentResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;
      return await updateComment(ctx.db, id, updateData, ctx.user!.userId, ctx.user!.role);
    }),

  deleteComment: authenticatedProcedure
    .input(commentIdParamSchema)
    .mutation(async ({ input, ctx }) => {
      await deleteComment(ctx.db, input.id, ctx.user!.userId, ctx.user!.role);
      return { success: true };
    }),
});

export type CommentRouter = typeof commentRouter;
