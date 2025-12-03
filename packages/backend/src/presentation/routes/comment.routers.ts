import { router } from "../../infrastructure/trpc/trpc";
import { authenticatedProcedure } from "../../infrastructure/trpc/procedure";

export const commentRouter = router({
  query: authenticatedProcedure.query(async () => {
    return {
        comment: 'comment',
    };
  }),
});

export type CommentRouter = typeof commentRouter;