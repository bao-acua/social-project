import { describe, it, expect } from 'vitest';
import { createTestCaller, getTestDatabase, loginByUser, loginByAdmin } from '../../helpers/trpc';
import { createTestPost } from '../../helpers/database';

describe('Post Router Integration Tests', () => {
  describe('createPost', () => {
    it('should successfully create a post', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db, {
        username: 'testuser',
        fullName: 'Test User',
      });

      const result = await caller.posts.createPost({
        content: 'This is a test post',
      });

      expect(result.post.content).toBe('This is a test post');
      expect(result.post.author).toBeDefined();
      expect(result.post.author?.id).toBe(user.id);
      expect(result.post.author?.username).toBe('testuser');
      expect(result.post.isDeleted).toBe(false);
      expect(result.post.isEdited).toBe(false);
      expect(result.post.commentsCount).toBe(0);
    });

    it('should throw error for empty content', async () => {
      const db = getTestDatabase();
      const { caller } = await loginByUser(db);

      await expect(
        caller.posts.createPost({
          content: '',
        })
      ).rejects.toThrow();
    });

    it('should throw error for content too long', async () => {
      const db = getTestDatabase();
      const { caller } = await loginByUser(db);

      const longContent = 'a'.repeat(5001);

      await expect(
        caller.posts.createPost({
          content: longContent,
        })
      ).rejects.toThrow();
    });

    it('should throw error when user is not authenticated', async () => {
      const db = getTestDatabase();
      const caller = createTestCaller(db);

      await expect(
        caller.posts.createPost({
          content: 'Test post',
        })
      ).rejects.toThrow();
    });
  });

  describe('updatePost', () => {
    it('should successfully update a post', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      const post = await createTestPost(db, {
        content: 'Original content',
        authorId: user.id,
      });

      const result = await caller.posts.updatePost({
        id: post.id,
        content: 'Updated content',
      });

      expect(result.post.content).toBe('Updated content');
      expect(result.post.isEdited).toBe(true);
      expect(result.post.editedAt).toBeDefined();
    });

    it('should throw error for empty content', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      const post = await createTestPost(db, {
        content: 'Original content',
        authorId: user.id,
      });

      await expect(
        caller.posts.updatePost({
          id: post.id,
          content: '',
        })
      ).rejects.toThrow();
    });

    it('should throw error for content too long', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      const post = await createTestPost(db, {
        content: 'Original content',
        authorId: user.id,
      });

      const longContent = 'a'.repeat(5001);

      await expect(
        caller.posts.updatePost({
          id: post.id,
          content: longContent,
        })
      ).rejects.toThrow();
    });

    it('should throw error for invalid post ID format', async () => {
      const db = getTestDatabase();
      const { caller } = await loginByUser(db);

      await expect(
        caller.posts.updatePost({
          id: 'invalid-uuid',
          content: 'Updated content',
        })
      ).rejects.toThrow();
    });

    it('should throw error when user is not authenticated', async () => {
      const db = getTestDatabase();
      const caller = createTestCaller(db);

      await expect(
        caller.posts.updatePost({
          id: '00000000-0000-0000-0000-000000000000',
          content: 'Updated content',
        })
      ).rejects.toThrow();
    });
  });

  describe('getTimeline', () => {
    it('should successfully get timeline with posts', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db, {
        username: 'testuser',
        fullName: 'Test User',
      });

      await createTestPost(db, {
        content: 'First post',
        authorId: user.id,
      });

      await createTestPost(db, {
        content: 'Second post',
        authorId: user.id,
      });

      const result = await caller.posts.getTimeline({
        limit: '10',
        offset: '0',
        includeDeleted: 'false',
      });

      expect(result.posts.length).toBeGreaterThanOrEqual(2);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.offset).toBe(0);
      expect(result.pagination.total).toBeGreaterThanOrEqual(2);
    });

    it('should respect pagination limits', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      for (let i = 0; i < 5; i++) {
        await createTestPost(db, {
          content: `Post ${i}`,
          authorId: user.id,
        });
      }

      const result = await caller.posts.getTimeline({
        limit: '2',
        offset: '0',
        includeDeleted: 'false',
      });

      expect(result.posts.length).toBeLessThanOrEqual(2);
      expect(result.pagination.limit).toBe(2);
    });

    it('should not return deleted posts for regular users', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      await createTestPost(db, {
        content: 'Active post',
        authorId: user.id,
        isDeleted: false,
      });

      await createTestPost(db, {
        content: 'Deleted post',
        authorId: user.id,
        isDeleted: true,
      });

      const result = await caller.posts.getTimeline({
        limit: '10',
        offset: '0',
        includeDeleted: 'true',
      });

      const deletedPosts = result.posts.filter(post => post.isDeleted);
      expect(deletedPosts.length).toBe(0);
    });

    it('should return deleted posts for admin users', async () => {
      const db = getTestDatabase();
      const { caller, user: admin } = await loginByAdmin(db, {
        username: 'admin',
        fullName: 'Admin User',
      });

      await createTestPost(db, {
        content: 'Active post',
        authorId: admin.id,
        isDeleted: false,
      });

      await createTestPost(db, {
        content: 'Deleted post',
        authorId: admin.id,
        isDeleted: true,
      });

      const result = await caller.posts.getTimeline({
        limit: '10',
        offset: '0',
        includeDeleted: 'true',
      });

      const deletedPosts = result.posts.filter(post => post.isDeleted);
      expect(deletedPosts.length).toBeGreaterThanOrEqual(1);
    });

    it('should throw error when user is not authenticated', async () => {
      const db = getTestDatabase();
      const caller = createTestCaller(db);

      await expect(
        caller.posts.getTimeline({
          limit: '10',
          offset: '0',
          includeDeleted: 'false',
        })
      ).rejects.toThrow();
    });
  });
});

