import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { createTRPCPlugin } from './trpc/plugin';
export interface ServerOptions {
  port?: number;
  host?: string;
}

export async function createServer(options: ServerOptions = {}): Promise<FastifyInstance> {
  const { port = 3000, host = '0.0.0.0' } = options;

  const server = Fastify({
    logger: true,
    maxParamLength: 5000,
  });

  // Register CORS plugin
  await server.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  server.get('/health', async () => {
    return { status: 'ok' };
  });

  await server.register(createTRPCPlugin);

  await server.listen({ port, host });

  return server;
}

