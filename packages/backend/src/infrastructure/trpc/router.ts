import { healthRouter } from '../../presentation/routes/health.router';
import { authRouter } from '../../presentation/routes/auth.routers';
import { postRouter } from '../../presentation/routes/post.routers';
import { router } from './trpc';
import { commentRouter } from '../../presentation/routes/comment.routers';

export const appRouter = router({
  health: healthRouter,
  auth: authRouter,
  posts: postRouter,
  comments: commentRouter,
});

export type AppRouter = typeof appRouter;