import { describe, it, expect } from 'vitest';
import { createTestCaller, getTestDatabase, loginByUser } from '../../helpers/trpc';
import { createTestPost, createTestComment } from '../../helpers/database';

describe('Comment Router Integration Tests', () => {
  describe('createComment', () => {
    it('should successfully create a comment', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db, {
        username: 'testuser',
        fullName: 'Test User',
      });

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: user.id,
      });

      const result = await caller.comments.createComment({
        postId: post.id,
        content: 'This is a test comment',
      });

      expect(result.comment.content).toBe('This is a test comment');
      expect(result.comment.author).toBeDefined();
      expect(result.comment.author.id).toBe(user.id);
      expect(result.comment.author.username).toBe('testuser');
      expect(result.comment.postId).toBe(post.id);
      expect(result.comment.isDeleted).toBe(false);
      expect(result.comment.isEdited).toBe(false);
    });

    it('should successfully create a reply comment', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: user.id,
      });

      const parentComment = await createTestComment(db, {
        content: 'Parent comment',
        postId: post.id,
        authorId: user.id,
      });

      const result = await caller.comments.createComment({
        postId: post.id,
        content: 'This is a reply',
        parentCommentId: parentComment.id,
      });

      expect(result.comment.content).toBe('This is a reply');
      expect(result.comment.parentCommentId).toBe(parentComment.id);
      expect(result.comment.postId).toBe(post.id);
    });

    it('should throw error for empty content', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: user.id,
      });

      await expect(
        caller.comments.createComment({
          postId: post.id,
          content: '',
        })
      ).rejects.toThrow();
    });

    it('should throw error for content too long', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: user.id,
      });

      const longContent = 'a'.repeat(2001);

      await expect(
        caller.comments.createComment({
          postId: post.id,
          content: longContent,
        })
      ).rejects.toThrow();
    });

    it('should throw error when post not found', async () => {
      const db = getTestDatabase();
      const { caller } = await loginByUser(db);

      await expect(
        caller.comments.createComment({
          postId: '00000000-0000-0000-0000-000000000000',
          content: 'Test comment',
        })
      ).rejects.toThrow();
    });

    it('should throw error when parent comment not found', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: user.id,
      });

      await expect(
        caller.comments.createComment({
          postId: post.id,
          content: 'Test comment',
          parentCommentId: '00000000-0000-0000-0000-000000000000',
        })
      ).rejects.toThrow();
    });

    it('should throw error when trying to reply to deleted comment', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: user.id,
      });

      const parentComment = await createTestComment(db, {
        content: 'Parent comment',
        postId: post.id,
        authorId: user.id,
        isDeleted: true,
      });

      await expect(
        caller.comments.createComment({
          postId: post.id,
          content: 'Reply to deleted comment',
          parentCommentId: parentComment.id,
        })
      ).rejects.toThrow();
    });

    it('should throw error when user is not authenticated', async () => {
      const db = getTestDatabase();
      const caller = createTestCaller(db);

      await expect(
        caller.comments.createComment({
          postId: '00000000-0000-0000-0000-000000000000',
          content: 'Test comment',
        })
      ).rejects.toThrow();
    });
  });

  describe('getCommentsByPost', () => {
    it('should successfully get comments by post', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: user.id,
      });

      await createTestComment(db, {
        content: 'First comment',
        postId: post.id,
        authorId: user.id,
      });

      await createTestComment(db, {
        content: 'Second comment',
        postId: post.id,
        authorId: user.id,
      });

      const result = await caller.comments.getCommentsByPost({
        postId: post.id,
        limit: 10,
        offset: 0,
      });

      expect(result.comments.length).toBeGreaterThanOrEqual(2);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.offset).toBe(0);
      expect(result.pagination.total).toBeGreaterThanOrEqual(2);
    });

    it('should respect pagination limits', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: user.id,
      });

      for (let i = 0; i < 5; i++) {
        await createTestComment(db, {
          content: `Comment ${i}`,
          postId: post.id,
          authorId: user.id,
        });
      }

      const result = await caller.comments.getCommentsByPost({
        postId: post.id,
        limit: 2,
        offset: 0,
      });

      expect(result.comments.length).toBeLessThanOrEqual(2);
      expect(result.pagination.limit).toBe(2);
    });

    it('should not return deleted comments', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: user.id,
      });

      await createTestComment(db, {
        content: 'Active comment',
        postId: post.id,
        authorId: user.id,
        isDeleted: false,
      });

      await createTestComment(db, {
        content: 'Deleted comment',
        postId: post.id,
        authorId: user.id,
        isDeleted: true,
      });

      const result = await caller.comments.getCommentsByPost({
        postId: post.id,
        limit: 10,
        offset: 0,
      });

      const deletedComments = result.comments.filter(comment => comment.isDeleted);
      expect(deletedComments.length).toBe(0);
    });

    it('should throw error when user is not authenticated', async () => {
      const db = getTestDatabase();
      const caller = createTestCaller(db);

      await expect(
        caller.comments.getCommentsByPost({
          postId: '00000000-0000-0000-0000-000000000000',
          limit: 10,
          offset: 0,
        })
      ).rejects.toThrow();
    });
  });

  describe('updateComment', () => {
    it('should successfully update a comment', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: user.id,
      });

      const comment = await createTestComment(db, {
        content: 'Original content',
        postId: post.id,
        authorId: user.id,
      });

      const result = await caller.comments.updateComment({
        id: comment.id,
        content: 'Updated content',
      });

      expect(result.comment.content).toBe('Updated content');
      expect(result.comment.isEdited).toBe(true);
      expect(result.comment.editedAt).toBeDefined();
    });

    it('should throw error for empty content', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: user.id,
      });

      const comment = await createTestComment(db, {
        content: 'Original content',
        postId: post.id,
        authorId: user.id,
      });

      await expect(
        caller.comments.updateComment({
          id: comment.id,
          content: '',
        })
      ).rejects.toThrow();
    });

    it('should throw error for content too long', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: user.id,
      });

      const comment = await createTestComment(db, {
        content: 'Original content',
        postId: post.id,
        authorId: user.id,
      });

      const longContent = 'a'.repeat(2001);

      await expect(
        caller.comments.updateComment({
          id: comment.id,
          content: longContent,
        })
      ).rejects.toThrow();
    });

    it('should throw error when comment not found', async () => {
      const db = getTestDatabase();
      const { caller } = await loginByUser(db);

      await expect(
        caller.comments.updateComment({
          id: '00000000-0000-0000-0000-000000000000',
          content: 'Updated content',
        })
      ).rejects.toThrow();
    });

    it('should throw error when trying to update deleted comment', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: user.id,
      });

      const comment = await createTestComment(db, {
        content: 'Original content',
        postId: post.id,
        authorId: user.id,
        isDeleted: true,
      });

      await expect(
        caller.comments.updateComment({
          id: comment.id,
          content: 'Updated content',
        })
      ).rejects.toThrow();
    });

    it('should throw error when user tries to update another user\'s comment', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);
      const { user: otherUser } = await loginByUser(db, {
        username: 'otheruser',
        fullName: 'Other User',
      });

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: user.id,
      });

      const comment = await createTestComment(db, {
        content: 'Original content',
        postId: post.id,
        authorId: otherUser.id,
      });

      await expect(
        caller.comments.updateComment({
          id: comment.id,
          content: 'Updated content',
        })
      ).rejects.toThrow();
    });

    it('should throw error when user is not authenticated', async () => {
      const db = getTestDatabase();
      const caller = createTestCaller(db);

      await expect(
        caller.comments.updateComment({
          id: '00000000-0000-0000-0000-000000000000',
          content: 'Updated content',
        })
      ).rejects.toThrow();
    });
  });

  describe('deleteComment', () => {
    it('should successfully delete a comment', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: user.id,
      });

      const comment = await createTestComment(db, {
        content: 'Comment to delete',
        postId: post.id,
        authorId: user.id,
      });

      const result = await caller.comments.deleteComment({
        id: comment.id,
      });

      expect(result.success).toBe(true);
    });

    it('should throw error when comment not found', async () => {
      const db = getTestDatabase();
      const { caller } = await loginByUser(db);

      await expect(
        caller.comments.deleteComment({
          id: '00000000-0000-0000-0000-000000000000',
        })
      ).rejects.toThrow();
    });

    it('should throw error when trying to delete already deleted comment', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: user.id,
      });

      const comment = await createTestComment(db, {
        content: 'Comment to delete',
        postId: post.id,
        authorId: user.id,
        isDeleted: true,
      });

      await expect(
        caller.comments.deleteComment({
          id: comment.id,
        })
      ).rejects.toThrow();
    });

    it('should throw error when user tries to delete another user\'s comment', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);
      const { user: otherUser } = await loginByUser(db, {
        username: 'otheruser',
        fullName: 'Other User',
      });

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: user.id,
      });

      const comment = await createTestComment(db, {
        content: 'Comment to delete',
        postId: post.id,
        authorId: otherUser.id,
      });

      await expect(
        caller.comments.deleteComment({
          id: comment.id,
        })
      ).rejects.toThrow();
    });

    it('should throw error when user is not authenticated', async () => {
      const db = getTestDatabase();
      const caller = createTestCaller(db);

      await expect(
        caller.comments.deleteComment({
          id: '00000000-0000-0000-0000-000000000000',
        })
      ).rejects.toThrow();
    });
  });
});

