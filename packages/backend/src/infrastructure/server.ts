import Fastify, { FastifyInstance } from 'fastify';

export interface ServerOptions {
  port?: number;
  host?: string;
}

export async function createServer(options: ServerOptions = {}): Promise<FastifyInstance> {
  const { port = 3000, host = '0.0.0.0' } = options;

  const server = Fastify({
    logger: true,
  });

  server.get('/health', async () => {
    return { status: 'ok' };
  });

  await server.listen({ port, host });

  return server;
}

