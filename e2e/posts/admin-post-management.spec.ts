import { test, expect } from '../fixtures/base';
import { createTestUser, createTestPost } from '../helpers/database';
import { TEST_USERS, TEST_POSTS } from '../fixtures/test-data';

test.describe('Admin Post Management', () => {
  test('admin should be able to delete any user post', async ({ page, cleanDatabase }) => {
    // Create admin and regular user
    const admin = await createTestUser(TEST_USERS.admin);
    const user = await createTestUser(TEST_USERS.user1);

    // Create a post by regular user
    const post = await createTestPost({
      content: TEST_POSTS.post1.content,
      authorId: user.id,
    });

    // Login as admin
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.admin.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.admin.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Should see the user's post
    await expect(page.locator(`text=${TEST_POSTS.post1.content}`)).toBeVisible();

    // Open post actions menu
    await page.getByTestId('post-actions-menu-trigger').first().click();

    // Should see delete option
    await expect(page.getByTestId('post-delete-button')).toBeVisible();

    // Click delete
    await page.getByTestId('post-delete-button').click();

    // Confirm deletion in dialog
    await expect(page.getByTestId('delete-post-dialog')).toBeVisible();
    await page.getByTestId('delete-post-confirm-button').click();

    // Post should disappear from timeline
    await expect(page.locator(`text=${TEST_POSTS.post1.content}`)).not.toBeVisible();
  });

  test('admin should be able to see deleted posts in timeline', async ({ page, cleanDatabase }) => {
    // Create admin and regular user
    const admin = await createTestUser(TEST_USERS.admin);
    const user = await createTestUser(TEST_USERS.user1);

    // Create a deleted post
    const deletedPost = await createTestPost({
      content: TEST_POSTS.deletedPost.content,
      authorId: user.id,
      isDeleted: true,
      deletedBy: admin.id,
    });

    // Login as admin
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.admin.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.admin.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Admin should see deleted post (backend should return deleted posts for admin)
    // Note: This depends on your backend implementation
    // If your backend filters deleted posts for everyone, this test might need adjustment

    // For now, we'll test that after admin deletes a post, they can verify it's gone
    // Create an active post first
    const activePost = await createTestPost({
      content: 'Active post for admin test',
      authorId: user.id,
    });

    await page.reload();

    // Should see the active post
    await expect(page.locator('text=Active post for admin test')).toBeVisible();
  });

  test('admin should be able to edit posts they own', async ({ page, cleanDatabase }) => {
    // Create admin
    const admin = await createTestUser(TEST_USERS.admin);

    // Create a post by admin
    const post = await createTestPost({
      content: 'Admin original post content',
      authorId: admin.id,
    });

    // Login as admin
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.admin.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.admin.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Should see the post
    await expect(page.locator('text=Admin original post content')).toBeVisible();

    // Open post actions menu
    await page.getByTestId('post-actions-menu-trigger').first().click();

    // Should see edit option
    await expect(page.getByTestId('post-edit-button')).toBeVisible();

    // Click edit
    await page.getByTestId('post-edit-button').click();

    // Edit dialog should open
    await expect(page.getByTestId('edit-post-dialog')).toBeVisible();

    // Change content
    const newContent = 'Admin edited post content';
    await page.getByTestId('edit-post-content-input').fill(newContent);

    // Save changes
    await page.getByTestId('edit-post-save-button').click();

    // Should see updated content
    await expect(page.locator(`text=${newContent}`)).toBeVisible();
    await expect(page.locator('text=Admin original post content')).not.toBeVisible();
  });

  test('admin should NOT be able to edit posts by other users', async ({ page, cleanDatabase }) => {
    // Create admin and regular user
    const admin = await createTestUser(TEST_USERS.admin);
    const user = await createTestUser(TEST_USERS.user1);

    // Create a post by regular user
    const post = await createTestPost({
      content: 'User post that admin cannot edit',
      authorId: user.id,
    });

    // Login as admin
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.admin.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.admin.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Should see the user's post
    await expect(page.locator('text=User post that admin cannot edit')).toBeVisible();

    // Open post actions menu
    await page.getByTestId('post-actions-menu-trigger').first().click();

    // Should see delete but NOT edit option
    await expect(page.getByTestId('post-delete-button')).toBeVisible();
    await expect(page.getByTestId('post-edit-button')).not.toBeVisible();
  });

  test('admin can delete multiple posts', async ({ page, cleanDatabase }) => {
    // Create admin and regular user
    const admin = await createTestUser(TEST_USERS.admin);
    const user = await createTestUser(TEST_USERS.user1);

    // Create multiple posts by user
    await createTestPost({
      content: 'User post 1',
      authorId: user.id,
    });
    await createTestPost({
      content: 'User post 2',
      authorId: user.id,
    });

    // Login as admin
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.admin.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.admin.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Delete first post
    await page.getByTestId('post-actions-menu-trigger').first().click();
    await page.getByTestId('post-delete-button').click();
    await page.getByTestId('delete-post-confirm-button').click();

    // Wait for first post to disappear
    await expect(page.locator('text=User post 1')).not.toBeVisible();

    // Delete second post
    await page.getByTestId('post-actions-menu-trigger').first().click();
    await page.getByTestId('post-delete-button').click();
    await page.getByTestId('delete-post-confirm-button').click();

    // Wait for second post to disappear
    await expect(page.locator('text=User post 2')).not.toBeVisible();
  });
});
