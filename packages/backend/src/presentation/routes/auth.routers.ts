import { router } from "../../infrastructure/trpc/trpc";
import { authenticatedProcedure, publicProcedure } from "../../infrastructure/trpc/procedure";
import { loginSchema, registerSchema, authResponseSchema, userResponseSchema } from "@shared/trpc/routers/auth";
import { login } from "../../domain/auth/login";
import { register } from "../../domain/auth/register";
import { me } from "../../domain/auth/me";

export const authRouter = router({
  login: publicProcedure
    .input(loginSchema)
    .output(authResponseSchema)
    .mutation(async ({ input, ctx }) => {
      return await login(ctx.db, input);
    }),

  register: publicProcedure
    .input(registerSchema)
    .output(authResponseSchema)
    .mutation(async ({ input, ctx }) => {
      return await register(ctx.db, input);
    }),

  me: authenticatedProcedure
    .output(userResponseSchema)
    .query(async ({ ctx }) => {
      return await me(ctx.db, ctx.user!.userId);
    }),
});

export type AuthRouter = typeof authRouter;