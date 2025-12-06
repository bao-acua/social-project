import { test, expect } from '../fixtures/base';
import { createTestUser, createTestPost } from '../helpers/database';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('User Post Management', () => {
  test('user should be able to create a new post', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    // Click create post button
    await page.getByTestId('create-post-trigger').click();

    // Fill in post content
    const postContent = 'This is my new test post!';
    await page.getByTestId('create-post-content-input').fill(postContent);

    // Submit post
    await page.getByTestId('create-post-submit-button').click();

    // Should see the new post in timeline
    await expect(page.locator(`text=${postContent}`)).toBeVisible();
  });

  test('user should NOT be able to see deleted posts', async ({ page, cleanDatabase }) => {
    // Create two users
    const user1 = await createTestUser(TEST_USERS.user1);
    const admin = await createTestUser(TEST_USERS.admin);

    // Create an active post
    await createTestPost({
      content: 'Active post content',
      authorId: user1.id,
    });

    // Create a deleted post
    await createTestPost({
      content: 'Deleted post content',
      authorId: user1.id,
      isDeleted: true,
      deletedBy: admin.id,
    });

    // Login as user1
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.user1.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Should see active post
    await expect(page.locator('text=Active post content')).toBeVisible();

    // Should NOT see deleted post
    await expect(page.locator('text=Deleted post content')).not.toBeVisible();
  });

  test('user should be able to edit their own post', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    // Create a post by this user
    await createTestPost({
      content: 'Original post content',
      authorId: user.id,
    });

    // Login as user
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.user1.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Should see the post
    await expect(page.locator('text=Original post content')).toBeVisible();

    // Open post actions menu
    await page.getByTestId('post-actions-menu-trigger').first().click();

    // Should see edit option
    await expect(page.getByTestId('post-edit-button')).toBeVisible();

    // Click edit
    await page.getByTestId('post-edit-button').click();

    // Edit dialog should open
    await expect(page.getByTestId('edit-post-dialog')).toBeVisible();

    // Change content
    const newContent = 'Edited post content by user';
    await page.getByTestId('edit-post-content-input').clear();
    await page.getByTestId('edit-post-content-input').fill(newContent);

    // Save changes
    await page.getByTestId('edit-post-save-button').click();

    // Should see updated content
    await expect(page.locator(`text=${newContent}`)).toBeVisible();
    await expect(page.locator('text=Original post content')).not.toBeVisible();
  });

  test('user should be able to delete their own post', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    // Create a post by this user
    await createTestPost({
      content: 'Post to be deleted by user',
      authorId: user.id,
    });

    // Login as user
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.user1.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Should see the post
    await expect(page.locator('text=Post to be deleted by user')).toBeVisible();

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
    await expect(page.locator('text=Post to be deleted by user')).not.toBeVisible();
  });

  test('user should NOT be able to edit posts by other users', async ({ page, cleanDatabase }) => {
    // Create two users
    const user1 = await createTestUser(TEST_USERS.user1);
    const user2 = await createTestUser(TEST_USERS.user2);

    // Create a post by user2
    await createTestPost({
      content: 'Post by another user',
      authorId: user2.id,
    });

    // Login as user1
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.user1.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Should see user2's post
    await expect(page.locator('text=Post by another user')).toBeVisible();

    // Should NOT see post actions menu for user2's post
    // (or if visible, should not have edit/delete options)
    const actionsMenu = page.getByTestId('post-actions-menu-trigger');
    if (await actionsMenu.isVisible()) {
      await actionsMenu.click();

      // Should not see edit or delete options
      await expect(page.getByTestId('post-edit-button')).not.toBeVisible();
      await expect(page.getByTestId('post-delete-button')).not.toBeVisible();
    }
  });

  test('user should NOT be able to delete posts by other users', async ({ page, cleanDatabase }) => {
    // Create two users
    const user1 = await createTestUser(TEST_USERS.user1);
    const user2 = await createTestUser(TEST_USERS.user2);

    // Create a post by user2
    await createTestPost({
      content: 'Post by user2 that user1 cannot delete',
      authorId: user2.id,
    });

    // Login as user1
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.user1.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Should see user2's post
    await expect(page.locator('text=Post by user2 that user1 cannot delete')).toBeVisible();

    // Actions menu should not be visible or not have delete option
    const actionsMenu = page.getByTestId('post-actions-menu-trigger');
    if (await actionsMenu.isVisible()) {
      await actionsMenu.click();
      await expect(page.getByTestId('post-delete-button')).not.toBeVisible();
    }
  });

  test('user should see validation error for empty post', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    // Click create post button
    await page.getByTestId('create-post-trigger').click();

    // Try to submit without content
    await page.getByTestId('create-post-submit-button').click();

    // Should show validation error
    await expect(page.getByTestId('create-post-error')).toBeVisible();
    await expect(page.locator('text=/.*cannot be empty.*/i')).toBeVisible();
  });

  test('user should be able to cancel post creation', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    // Click create post button
    await page.getByTestId('create-post-trigger').click();

    // Fill in some content
    await page.getByTestId('create-post-content-input').fill('This post will be cancelled');

    // Click cancel
    await page.getByTestId('create-post-cancel-button').click();

    // Dialog should close
    await expect(page.getByTestId('create-post-dialog')).not.toBeVisible();

    // Post should not be created
    await expect(page.locator('text=This post will be cancelled')).not.toBeVisible();
  });

  test('user should be able to cancel post edit', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    // Create a post by this user
    const originalContent = 'Original post that will not be edited';
    await createTestPost({
      content: originalContent,
      authorId: user.id,
    });

    // Login as user
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.user1.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Open edit dialog
    await page.getByTestId('post-actions-menu-trigger').first().click();
    await page.getByTestId('post-edit-button').click();

    // Change content
    await page.getByTestId('edit-post-content-input').fill('This edit will be cancelled');

    // Click cancel
    await page.getByTestId('edit-post-cancel-button').click();

    // Dialog should close
    await expect(page.getByTestId('edit-post-dialog')).not.toBeVisible();

    // Original content should still be visible
    await expect(page.locator(`text=${originalContent}`)).toBeVisible();
    await expect(page.locator('text=This edit will be cancelled')).not.toBeVisible();
  });

  test('user should be able to cancel post deletion', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    // Create a post by this user
    const postContent = 'Post that will not be deleted';
    await createTestPost({
      content: postContent,
      authorId: user.id,
    });

    // Login as user
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.user1.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Open delete dialog
    await page.getByTestId('post-actions-menu-trigger').first().click();
    await page.getByTestId('post-delete-button').click();

    // Dialog should be visible
    await expect(page.getByTestId('delete-post-dialog')).toBeVisible();

    // Click cancel
    await page.getByTestId('delete-post-cancel-button').click();

    // Dialog should close
    await expect(page.getByTestId('delete-post-dialog')).not.toBeVisible();

    // Post should still be visible
    await expect(page.locator(`text=${postContent}`)).toBeVisible();
  });
});
