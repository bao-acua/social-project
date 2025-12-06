import { describe, it, expect } from 'vitest';
import { createTestCaller, getTestDatabase, loginByUser, loginByAdmin } from '../../helpers/trpc';
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

  describe('Admin privileges', () => {
    it('should allow admin to edit another user\'s comment', async () => {
      const db = getTestDatabase();
      const { caller: adminCaller, user: adminUser } = await loginByAdmin(db, {
        username: 'admin',
        fullName: 'Admin User',
      });
      const { user: regularUser } = await loginByUser(db, {
        username: 'regularuser',
        fullName: 'Regular User',
      });

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: regularUser.id,
      });

      const comment = await createTestComment(db, {
        content: 'Original comment',
        postId: post.id,
        authorId: regularUser.id,
      });

      const result = await adminCaller.comments.updateComment({
        id: comment.id,
        content: 'Admin edited this comment',
      });

      expect(result.comment.content).toBe('Admin edited this comment');
      expect(result.comment.isEdited).toBe(true);
      expect(result.comment.editedByAdmin).toBe(true);
      expect(result.comment.author.id).toBe(regularUser.id); // Original author unchanged
    });

    it('should allow admin to delete another user\'s comment', async () => {
      const db = getTestDatabase();
      const { caller: adminCaller } = await loginByAdmin(db, {
        username: 'admin',
        fullName: 'Admin User',
      });
      const { user: regularUser } = await loginByUser(db, {
        username: 'regularuser',
        fullName: 'Regular User',
      });

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: regularUser.id,
      });

      const comment = await createTestComment(db, {
        content: 'Comment to be deleted by admin',
        postId: post.id,
        authorId: regularUser.id,
      });

      const result = await adminCaller.comments.deleteComment({
        id: comment.id,
      });

      expect(result.success).toBe(true);
    });

    it('should show editedByAdmin as false when author edits their own comment', async () => {
      const db = getTestDatabase();
      const { caller, user } = await loginByUser(db);

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: user.id,
      });

      const comment = await createTestComment(db, {
        content: 'Original comment',
        postId: post.id,
        authorId: user.id,
      });

      const result = await caller.comments.updateComment({
        id: comment.id,
        content: 'Self edited comment',
      });

      expect(result.comment.content).toBe('Self edited comment');
      expect(result.comment.isEdited).toBe(true);
      expect(result.comment.editedByAdmin).toBe(false);
    });

    it('should allow admin to see deleted comments', async () => {
      const db = getTestDatabase();
      const { caller: adminCaller } = await loginByAdmin(db, {
        username: 'admin',
        fullName: 'Admin User',
      });
      const { caller: userCaller, user: regularUser } = await loginByUser(db, {
        username: 'regularuser',
        fullName: 'Regular User',
      });

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: regularUser.id,
      });

      const comment = await createTestComment(db, {
        content: 'Comment to be deleted',
        postId: post.id,
        authorId: regularUser.id,
      });

      // Delete the comment
      await adminCaller.comments.deleteComment({
        id: comment.id,
      });

      // Admin should see the deleted comment
      const adminResult = await adminCaller.comments.getCommentsByPost({
        postId: post.id,
        limit: 20,
        offset: 0,
      });

      expect(adminResult.comments).toHaveLength(1);
      expect(adminResult.comments[0].id).toBe(comment.id);
      expect(adminResult.comments[0].isDeleted).toBe(true);

      // Regular user should NOT see the deleted comment
      const userResult = await userCaller.comments.getCommentsByPost({
        postId: post.id,
        limit: 20,
        offset: 0,
      });

      expect(userResult.comments).toHaveLength(0);
    });

    it('should count deleted comments for admin but not for regular users', async () => {
      const db = getTestDatabase();
      const { caller: adminCaller } = await loginByAdmin(db, {
        username: 'admin',
        fullName: 'Admin User',
      });
      const { caller: userCaller, user: regularUser } = await loginByUser(db, {
        username: 'regularuser',
        fullName: 'Regular User',
      });

      const post = await createTestPost(db, {
        content: 'Test post',
        authorId: regularUser.id,
      });

      // Create 3 comments
      const comment1 = await createTestComment(db, {
        content: 'Comment 1',
        postId: post.id,
        authorId: regularUser.id,
      });

      const comment2 = await createTestComment(db, {
        content: 'Comment 2',
        postId: post.id,
        authorId: regularUser.id,
      });

      const comment3 = await createTestComment(db, {
        content: 'Comment 3',
        postId: post.id,
        authorId: regularUser.id,
      });

      // Delete one comment
      await adminCaller.comments.deleteComment({
        id: comment2.id,
      });

      // Admin should see total of 3 comments (including deleted)
      const adminResult = await adminCaller.comments.getCommentsByPost({
        postId: post.id,
        limit: 20,
        offset: 0,
      });

      expect(adminResult.pagination.total).toBe(3);
      expect(adminResult.comments).toHaveLength(3);

      // Regular user should see total of 2 comments (excluding deleted)
      const userResult = await userCaller.comments.getCommentsByPost({
        postId: post.id,
        limit: 20,
        offset: 0,
      });

      expect(userResult.pagination.total).toBe(2);
      expect(userResult.comments).toHaveLength(2);
    });
  });
});

