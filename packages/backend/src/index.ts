import { createServer } from './infrastructure/server.js';

async function main() {
  console.log('Backend starting...');

  const server = await createServer({ port: 3000 });
  const address = server.server.address();
  const port = typeof address === 'string' ? address : address?.port || 3000;
  console.log(`Server listening on http://localhost:${port}`);
}

main().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});

