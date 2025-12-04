import { router } from "../../infrastructure/trpc/trpc";
import { authenticatedProcedure } from "../../infrastructure/trpc/procedure";
import { createPostResponseSchema, createPostSchema, timelineQuerySchema, timelineResponseSchema, updatePostInputSchema, updatePostResponseSchema, updatePostSchema } from "@shared/trpc/routers/post";
import { getTimeline } from "../../domain/post/getTimeline";
import { createPost } from "../../domain/post/createPost";
import { updatePost } from "../../domain/post/updatePost";

export const postRouter = router({
  getTimeline: authenticatedProcedure
  .input(timelineQuerySchema)
  .output(timelineResponseSchema)
  .query(async ({ input, ctx }) => {
    return await getTimeline(input, ctx.user!.role);
  }),
  createPost: authenticatedProcedure
  .input(createPostSchema)
  .output(createPostResponseSchema)
  .mutation(async ({ input, ctx }) => {
    return await createPost(ctx.db, input, ctx.user!.userId);
  }),
  updatePost: authenticatedProcedure
  .input(updatePostInputSchema)
  .output(updatePostResponseSchema)
  .mutation(async ({ input, ctx }) => {
    return await updatePost(ctx.db, input, ctx.user!.userId);
  }),
});

export type PostRouter = typeof postRouter;