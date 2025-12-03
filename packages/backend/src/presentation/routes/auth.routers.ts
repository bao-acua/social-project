import { router } from "../../infrastructure/trpc/trpc";
import { publicProcedure } from "../../infrastructure/trpc/procedure";
import { loginSchema, registerSchema } from "@shared/trpc/routers/auth";

export const authRouter = router({
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      return {
        accessToken: 'token',
        refreshToken: 'refresh-token',
      };
    }),

  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      return {
        accessToken: 'token',
        refreshToken: 'refresh-token',
      };
    }),
});

export type AuthRouter = typeof authRouter;