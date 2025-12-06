import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './infrastructure/trpc/router';
import superjson from 'superjson';

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
      transformer: superjson,
    }),
  ],
});

async function test() {
  try {
    console.log('Testing tRPC server...\n');

    const result = await client.health.ping.query();
    console.log('✅ Health ping test passed!');
    console.log('Response:', result);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();

