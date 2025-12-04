import { describe, it, expect } from 'vitest';
import { createTestCaller, getTestDatabase } from '../../helpers/trpc';

describe('Health Router Integration Tests', () => {
  it('should return health status', async () => {
    const db = getTestDatabase();
    const caller = createTestCaller(db);

    const result = await caller.health.ping();

    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });
});

