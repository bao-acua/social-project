import { describe, it, expect } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createTestCaller, getTestDatabase, loginByUser } from '../../helpers/trpc';
import { createTestUser } from '../../helpers/database';
import { hashPassword } from '../../../lib/password/password';

describe('Auth Router Integration Tests', () => {
  describe('register', () => {
    it('should successfully register a new user', async () => {
      const db = getTestDatabase();
      const caller = createTestCaller(db);

      const result = await caller.auth.register({
        username: 'newuser',
        password: 'StrongPassw0rd!@#',
        fullName: 'New User',
        role: 'user',
      });

      expect(result.user.username).toBe('newuser');
      expect(result.user.fullName).toBe('New User');
      expect(result.user.role).toBe('user');
      expect(result.user.initials).toBeDefined();
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });

    it('should throw error for weak password', async () => {
      const db = getTestDatabase();
      const caller = createTestCaller(db);

      await expect(
        caller.auth.register({
          username: 'newuser',
          password: 'weak',
          fullName: 'New User',
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should throw error for duplicate username', async () => {
      const db = getTestDatabase();
      const caller = createTestCaller(db);

      await createTestUser(db, {
        username: 'existinguser',
        password: await hashPassword('SomePassword123!'),
        fullName: 'Existing User',
      });

      await expect(
        caller.auth.register({
          username: 'existinguser',
          password: 'StrongPassw0rd!@#',
          fullName: 'New User',
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should throw error for invalid username format', async () => {
      const db = getTestDatabase();
      const caller = createTestCaller(db);

      await expect(
        caller.auth.register({
          username: 'invalid user!',
          password: 'StrongPassw0rd!@#',
          fullName: 'New User',
        })
      ).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const db = getTestDatabase();
      const caller = createTestCaller(db);

      const password = 'TestPassword123!';
      const hashedPassword = await hashPassword(password);

      await createTestUser(db, {
        username: 'testuser',
        password: hashedPassword,
        fullName: 'Test User',
      });

      const result = await caller.auth.login({
        username: 'testuser',
        password: password,
      });

      expect(result.user.username).toBe('testuser');
      expect(result.user.fullName).toBe('Test User');
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });

    it('should throw UNAUTHORIZED error for non-existent user', async () => {
      const db = getTestDatabase();
      const caller = createTestCaller(db);

      await expect(
        caller.auth.login({
          username: 'nonexistent',
          password: 'password123',
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should throw UNAUTHORIZED error for incorrect password', async () => {
      const db = getTestDatabase();
      const caller = createTestCaller(db);

      const password = 'TestPassword123!';
      const hashedPassword = await hashPassword(password);

      await createTestUser(db, {
        username: 'testuser',
        password: hashedPassword,
        fullName: 'Test User',
      });

      await expect(
        caller.auth.login({
          username: 'testuser',
          password: 'WrongPassword123!',
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('me', () => {
    it('should return current user information', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db, {
        username: 'testuser',
        fullName: 'Test User',
      });

      const result = await caller.auth.me();

      expect(result.id).toBe(user.id);
      expect(result.username).toBe('testuser');
      expect(result.fullName).toBe('Test User');
      expect(result.role).toBe('user');
    });

    it('should throw error when user is not authenticated', async () => {
      const db = getTestDatabase();
      const caller = createTestCaller(db);

      await expect(
        caller.auth.me()
      ).rejects.toThrow();
    });
  });
});

