import { TRPCError } from '@trpc/server';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { FastifyPluginAsync } from 'fastify';
import { createContext } from './context';
import { appRouter } from './router';

export const createTRPCPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
      onError: ({
        error,
        path,
        type,
        ctx,
        input,
      }: {
        error: TRPCError;
        path: string | undefined;
        type: 'query' | 'mutation' | 'subscription' | 'unknown';
        ctx: Awaited<ReturnType<typeof createContext>> | undefined;
        input: unknown;
      }) => {
        const logLevel =
          error instanceof TRPCError && error.code === 'UNAUTHORIZED'
            ? 'warn'
            : 'error';

        fastify.log[logLevel](
          {
            error: {
              code: error.code,
              message: process.env.NODE_ENV === 'development' ? error.message : '[REDACTED]',
              cause: process.env.NODE_ENV === 'development' ? error.cause : '[REDACTED]',
              stack: process.env.NODE_ENV === 'development' ? error.stack : '[REDACTED]',
            },
            trpc: {
              path,
              type,
              input: fastify.log.level === 'debug' ? input : '[REDACTED]',
              userId: (ctx?.user as unknown as Record<string, unknown>)?.id,
              tenantId: (ctx?.user as unknown as Record<string, unknown>)
                ?.tenantId,
            },
          },
          `tRPC Error in ${type}.${path}: ${error.name ?? 'UnknownError'}`
        );
      },
    },
  });
};
