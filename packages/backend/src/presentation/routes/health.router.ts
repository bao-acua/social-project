import { router } from "../../infrastructure/trpc/trpc";
import { publicProcedure } from "../../infrastructure/trpc/procedure";

export const healthRouter = router({
  ping: publicProcedure.query(async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  })
})

export type HealthRouter = typeof healthRouter;