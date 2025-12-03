import { healthRouter } from '../../presentation/routes/health.router';
import { authRouter } from '../../presentation/routes/auth.routers';
import { postRouter } from '../../presentation/routes/post.routers';
import { router } from './trpc';

export const appRouter = router({
  health: healthRouter,
  auth: authRouter,
  posts: postRouter,
});

export type AppRouter = typeof appRouter;