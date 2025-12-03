import { middleware } from "./trpc";
import { Context } from "./context";
import { TRPCError } from "@trpc/server";

export const isAuthenticated = middleware<Context>(({ ctx, next }) => {
  console.log("🚀 ~ ctx.user:", ctx.user)
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});