import { test, expect } from '../fixtures/base';
import { createTestUser, createTestPost } from '../helpers/database';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('User Post Management', () => {
  test('user should be able to create a new post', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    const createPostTrigger = page.getByTestId('create-post-trigger');
    await createPostTrigger.waitFor({ state: 'visible' });
    await createPostTrigger.click();

    const postContent = 'This is my new test post!';
    const contentInput = page.getByTestId('create-post-content-input');
    await contentInput.waitFor({ state: 'visible' });
    await contentInput.fill(postContent);

    const submitButton = page.getByTestId('create-post-submit-button');
    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await expect(page.locator(`text=${postContent}`)).toBeVisible();
  });

  test('user should NOT be able to see deleted posts', async ({ page, cleanDatabase }) => {
    const user1 = await createTestUser(TEST_USERS.user1);
    const admin = await createTestUser(TEST_USERS.admin);

    await createTestPost({
      content: 'Active post content',
      authorId: user1.id,
    });

    await createTestPost({
      content: 'Deleted post content',
      authorId: user1.id,
      isDeleted: true,
      deletedBy: admin.id,
    });

    await page.goto('/login');

    const usernameInput = page.getByTestId('login-username-input');
    const passwordInput = page.getByTestId('login-password-input');
    const submitButton = page.getByTestId('login-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(TEST_USERS.user1.username);

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(TEST_USERS.user1.password);

    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await page.waitForURL('/timeline');

    await expect(page.locator('text=Active post content')).toBeVisible();
    await expect(page.locator('text=Deleted post content')).not.toBeVisible();
  });

  test('user should be able to edit their own post', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    await createTestPost({
      content: 'Original post content',
      authorId: user.id,
    });

    await page.goto('/login');

    const usernameInput = page.getByTestId('login-username-input');
    const passwordInput = page.getByTestId('login-password-input');
    const submitButton = page.getByTestId('login-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(TEST_USERS.user1.username);

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(TEST_USERS.user1.password);

    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await page.waitForURL('/timeline');

    await expect(page.locator('text=Original post content')).toBeVisible();

    const actionsMenuTrigger = page.getByTestId('post-actions-menu-trigger').first();
    await actionsMenuTrigger.waitFor({ state: 'visible' });
    await actionsMenuTrigger.click();

    const editButton = page.getByTestId('post-edit-button');
    await editButton.waitFor({ state: 'visible' });
    await expect(editButton).toBeVisible();
    await editButton.click();

    const editDialog = page.getByTestId('edit-post-dialog');
    await editDialog.waitFor({ state: 'visible' });
    await expect(editDialog).toBeVisible();

    const newContent = 'Edited post content by user';
    const contentInput = page.getByTestId('edit-post-content-input');
    await contentInput.waitFor({ state: 'visible' });
    await contentInput.clear();
    await contentInput.fill(newContent);

    const saveButton = page.getByTestId('edit-post-save-button');
    await saveButton.waitFor({ state: 'visible' });
    await saveButton.click();

    await expect(page.locator(`text=${newContent}`)).toBeVisible();
    await expect(page.locator('text=Original post content')).not.toBeVisible();
  });

  test('user should be able to delete their own post', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    await createTestPost({
      content: 'Post to be deleted by user',
      authorId: user.id,
    });

    await page.goto('/login');

    const usernameInput = page.getByTestId('login-username-input');
    const passwordInput = page.getByTestId('login-password-input');
    const submitButton = page.getByTestId('login-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(TEST_USERS.user1.username);

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(TEST_USERS.user1.password);

    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await page.waitForURL('/timeline');

    await expect(page.locator('text=Post to be deleted by user')).toBeVisible();

    const actionsMenuTrigger = page.getByTestId('post-actions-menu-trigger').first();
    await actionsMenuTrigger.waitFor({ state: 'visible' });
    await actionsMenuTrigger.click();

    const deleteButton = page.getByTestId('post-delete-button');
    await deleteButton.waitFor({ state: 'visible' });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    const deleteDialog = page.getByTestId('delete-post-dialog');
    await deleteDialog.waitFor({ state: 'visible' });
    await expect(deleteDialog).toBeVisible();

    const confirmButton = page.getByTestId('delete-post-confirm-button');
    await confirmButton.waitFor({ state: 'visible' });
    await confirmButton.click();

    await expect(page.locator('text=Post to be deleted by user')).not.toBeVisible();
  });

  test('user should NOT be able to edit posts by other users', async ({ page, cleanDatabase }) => {
    const user1 = await createTestUser(TEST_USERS.user1);
    const user2 = await createTestUser(TEST_USERS.user2);

    await createTestPost({
      content: 'Post by another user',
      authorId: user2.id,
    });

    await page.goto('/login');

    const usernameInput = page.getByTestId('login-username-input');
    const passwordInput = page.getByTestId('login-password-input');
    const submitButton = page.getByTestId('login-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(TEST_USERS.user1.username);

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(TEST_USERS.user1.password);

    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await page.waitForURL('/timeline');

    await expect(page.locator('text=Post by another user')).toBeVisible();

    const actionsMenu = page.getByTestId('post-actions-menu-trigger');
    if (await actionsMenu.isVisible()) {
      await actionsMenu.click();

      await expect(page.getByTestId('post-edit-button')).not.toBeVisible();
      await expect(page.getByTestId('post-delete-button')).not.toBeVisible();
    }
  });

  test('user should NOT be able to delete posts by other users', async ({ page, cleanDatabase }) => {
    const user1 = await createTestUser(TEST_USERS.user1);
    const user2 = await createTestUser(TEST_USERS.user2);

    await createTestPost({
      content: 'Post by user2 that user1 cannot delete',
      authorId: user2.id,
    });

    await page.goto('/login');

    const usernameInput = page.getByTestId('login-username-input');
    const passwordInput = page.getByTestId('login-password-input');
    const submitButton = page.getByTestId('login-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(TEST_USERS.user1.username);

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(TEST_USERS.user1.password);

    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await page.waitForURL('/timeline');

    await expect(page.locator('text=Post by user2 that user1 cannot delete')).toBeVisible();

    const actionsMenu = page.getByTestId('post-actions-menu-trigger');
    if (await actionsMenu.isVisible()) {
      await actionsMenu.click();
      await expect(page.getByTestId('post-delete-button')).not.toBeVisible();
    }
  });

  test('user should see validation error for empty post', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    const createPostTrigger = page.getByTestId('create-post-trigger');
    await createPostTrigger.waitFor({ state: 'visible' });
    await createPostTrigger.click();

    const submitButton = page.getByTestId('create-post-submit-button');
    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await expect(page.getByTestId('create-post-error')).toBeVisible();
    await expect(page.locator('text=/.*cannot be empty.*/i')).toBeVisible();
  });

  test('user should be able to cancel post creation', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    const createPostTrigger = page.getByTestId('create-post-trigger');
    await createPostTrigger.waitFor({ state: 'visible' });
    await createPostTrigger.click();

    const contentInput = page.getByTestId('create-post-content-input');
    await contentInput.waitFor({ state: 'visible' });
    await contentInput.fill('This post will be cancelled');

    const cancelButton = page.getByTestId('create-post-cancel-button');
    await cancelButton.waitFor({ state: 'visible' });
    await cancelButton.click();

    await expect(page.getByTestId('create-post-dialog')).not.toBeVisible();
    await expect(page.locator('text=This post will be cancelled')).not.toBeVisible();
  });

  test('user should be able to cancel post edit', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    const originalContent = 'Original post that will not be edited';
    await createTestPost({
      content: originalContent,
      authorId: user.id,
    });

    await page.goto('/login');

    const usernameInput = page.getByTestId('login-username-input');
    const passwordInput = page.getByTestId('login-password-input');
    const submitButton = page.getByTestId('login-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(TEST_USERS.user1.username);

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(TEST_USERS.user1.password);

    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await page.waitForURL('/timeline');

    const actionsMenuTrigger = page.getByTestId('post-actions-menu-trigger').first();
    await actionsMenuTrigger.waitFor({ state: 'visible' });
    await actionsMenuTrigger.click();

    const editButton = page.getByTestId('post-edit-button');
    await editButton.waitFor({ state: 'visible' });
    await editButton.click();

    const contentInput = page.getByTestId('edit-post-content-input');
    await contentInput.waitFor({ state: 'visible' });
    await contentInput.fill('This edit will be cancelled');

    const cancelButton = page.getByTestId('edit-post-cancel-button');
    await cancelButton.waitFor({ state: 'visible' });
    await cancelButton.click();

    await expect(page.getByTestId('edit-post-dialog')).not.toBeVisible();
    await expect(page.locator(`text=${originalContent}`)).toBeVisible();
    await expect(page.locator('text=This edit will be cancelled')).not.toBeVisible();
  });

  test('user should be able to cancel post deletion', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    const postContent = 'Post that will not be deleted';
    await createTestPost({
      content: postContent,
      authorId: user.id,
    });

    await page.goto('/login');

    const usernameInput = page.getByTestId('login-username-input');
    const passwordInput = page.getByTestId('login-password-input');
    const submitButton = page.getByTestId('login-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(TEST_USERS.user1.username);

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(TEST_USERS.user1.password);

    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await page.waitForURL('/timeline');

    const actionsMenuTrigger = page.getByTestId('post-actions-menu-trigger').first();
    await actionsMenuTrigger.waitFor({ state: 'visible' });
    await actionsMenuTrigger.click();

    const deleteButton = page.getByTestId('post-delete-button');
    await deleteButton.waitFor({ state: 'visible' });
    await deleteButton.click();

    const deleteDialog = page.getByTestId('delete-post-dialog');
    await deleteDialog.waitFor({ state: 'visible' });
    await expect(deleteDialog).toBeVisible();

    const cancelButton = page.getByTestId('delete-post-cancel-button');
    await cancelButton.waitFor({ state: 'visible' });
    await cancelButton.click();

    await expect(page.getByTestId('delete-post-dialog')).not.toBeVisible();
    await expect(page.locator(`text=${postContent}`)).toBeVisible();
  });
});
