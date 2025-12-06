// Vercel serverless function entry point
import Fastify from 'fastify';
import cors from '@fastify/cors';

let app;

async function build() {
  if (app) return app;

  try {
    console.log('[Serverless] Building Fastify app...');

    // Import the tRPC plugin
    const { createTRPCPlugin } = await import('../dist/infrastructure/trpc/plugin.js');

    app = Fastify({
      logger: false, // Disable logger in serverless
      trustProxy: true,
      routerOptions: {
        maxParamLength: 5000
      }
    });

    // Register CORS plugin
    const frontendUrls = process.env.FRONTEND_URL?.trim();
    const allowedOrigins = frontendUrls
      ? frontendUrls.split(',').map(url => url.trim())
      : true;

    await app.register(cors, {
      origin: allowedOrigins, // Allow specified origins or all if not specified
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Health check route
    app.get('/health', async () => ({ status: 'ok' }));

    // Register tRPC
    await app.register(createTRPCPlugin);

    console.log('[Serverless] Fastify app ready');
    return app;
  } catch (error) {
    console.error('[Serverless] Failed to build app:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  try {
    await build();
    await app.ready();
    app.server.emit('request', req, res);
  } catch (error) {
    console.error('[Serverless] Handler error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }));
  }
}
