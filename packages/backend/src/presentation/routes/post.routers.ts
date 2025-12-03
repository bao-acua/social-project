import { router } from "../../infrastructure/trpc/trpc";
import { authenticatedProcedure } from "../../infrastructure/trpc/procedure";

export const postRouter = router({
  query: authenticatedProcedure.query(async () => {
    return {
        post: 'post',
    };
  }),
});

export type PostRouter = typeof postRouter;