import { test, expect } from '../fixtures/base';
import { createTestUser, createTestPost } from '../helpers/database';
import { TEST_USERS, TEST_POSTS } from '../fixtures/test-data';

test.describe('Admin Post Management', () => {
  test('admin should be able to delete any user post', async ({ page, cleanDatabase }) => {
    const admin = await createTestUser(TEST_USERS.admin);
    const user = await createTestUser(TEST_USERS.user1);

    const post = await createTestPost({
      content: TEST_POSTS.post1.content,
      authorId: user.id,
    });

    await page.goto('/login');

    const usernameInput = page.getByTestId('login-username-input');
    const passwordInput = page.getByTestId('login-password-input');
    const submitButton = page.getByTestId('login-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(TEST_USERS.admin.username);

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(TEST_USERS.admin.password);

    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await page.waitForURL('/timeline');

    await expect(page.locator(`text=${TEST_POSTS.post1.content}`)).toBeVisible();

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

    await expect(page.locator(`text=${TEST_POSTS.post1.content}`)).not.toBeVisible();
  });

  test('admin should be able to see deleted posts in timeline', async ({ page, cleanDatabase }) => {
    const admin = await createTestUser(TEST_USERS.admin);
    const user = await createTestUser(TEST_USERS.user1);

    const deletedPost = await createTestPost({
      content: TEST_POSTS.deletedPost.content,
      authorId: user.id,
      isDeleted: true,
      deletedBy: admin.id,
    });

    await page.goto('/login');

    const usernameInput = page.getByTestId('login-username-input');
    const passwordInput = page.getByTestId('login-password-input');
    const submitButton = page.getByTestId('login-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(TEST_USERS.admin.username);

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(TEST_USERS.admin.password);

    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await page.waitForURL('/timeline');

    const activePost = await createTestPost({
      content: 'Active post for admin test',
      authorId: user.id,
    });

    await page.reload();

    await expect(page.locator('text=Active post for admin test')).toBeVisible();
  });

  test('admin should be able to edit posts they own', async ({ page, cleanDatabase }) => {
    const admin = await createTestUser(TEST_USERS.admin);

    const post = await createTestPost({
      content: 'Admin original post content',
      authorId: admin.id,
    });

    await page.goto('/login');

    const usernameInput = page.getByTestId('login-username-input');
    const passwordInput = page.getByTestId('login-password-input');
    const submitButton = page.getByTestId('login-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(TEST_USERS.admin.username);

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(TEST_USERS.admin.password);

    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await page.waitForURL('/timeline');

    await expect(page.locator('text=Admin original post content')).toBeVisible();

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

    const newContent = 'Admin edited post content';
    const contentInput = page.getByTestId('edit-post-content-input');
    await contentInput.waitFor({ state: 'visible' });
    await contentInput.fill(newContent);

    const saveButton = page.getByTestId('edit-post-save-button');
    await saveButton.waitFor({ state: 'visible' });
    await saveButton.click();

    await expect(page.locator(`text=${newContent}`)).toBeVisible();
    await expect(page.locator('text=Admin original post content')).not.toBeVisible();
  });

  test('admin should NOT be able to edit posts by other users', async ({ page, cleanDatabase }) => {
    const admin = await createTestUser(TEST_USERS.admin);
    const user = await createTestUser(TEST_USERS.user1);

    const post = await createTestPost({
      content: 'User post that admin cannot edit',
      authorId: user.id,
    });

    await page.goto('/login');

    const usernameInput = page.getByTestId('login-username-input');
    const passwordInput = page.getByTestId('login-password-input');
    const submitButton = page.getByTestId('login-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(TEST_USERS.admin.username);

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(TEST_USERS.admin.password);

    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await page.waitForURL('/timeline');

    await expect(page.locator('text=User post that admin cannot edit')).toBeVisible();

    const actionsMenuTrigger = page.getByTestId('post-actions-menu-trigger').first();
    await actionsMenuTrigger.waitFor({ state: 'visible' });
    await actionsMenuTrigger.click();

    await expect(page.getByTestId('post-delete-button')).toBeVisible();
    await expect(page.getByTestId('post-edit-button')).not.toBeVisible();
  });

  test('admin can delete multiple posts', async ({ page, cleanDatabase }) => {
    const admin = await createTestUser(TEST_USERS.admin);
    const user = await createTestUser(TEST_USERS.user1);

    await createTestPost({
      content: 'User post 1',
      authorId: user.id,
    });
    await createTestPost({
      content: 'User post 2',
      authorId: user.id,
    });

    await page.goto('/login');

    const usernameInput = page.getByTestId('login-username-input');
    const passwordInput = page.getByTestId('login-password-input');
    const submitButton = page.getByTestId('login-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(TEST_USERS.admin.username);

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(TEST_USERS.admin.password);

    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await page.waitForURL('/timeline');

    const firstActionsMenu = page.getByTestId('post-actions-menu-trigger').first();
    await firstActionsMenu.waitFor({ state: 'visible' });
    await firstActionsMenu.click();

    const firstDeleteButton = page.getByTestId('post-delete-button');
    await firstDeleteButton.waitFor({ state: 'visible' });
    await firstDeleteButton.click();

    const firstConfirmButton = page.getByTestId('delete-post-confirm-button');
    await firstConfirmButton.waitFor({ state: 'visible' });
    await firstConfirmButton.click();

    await expect(page.locator('text=User post 1')).not.toBeVisible();

    const secondActionsMenu = page.getByTestId('post-actions-menu-trigger').first();
    await secondActionsMenu.waitFor({ state: 'visible' });
    await secondActionsMenu.click();

    const secondDeleteButton = page.getByTestId('post-delete-button');
    await secondDeleteButton.waitFor({ state: 'visible' });
    await secondDeleteButton.click();

    const secondConfirmButton = page.getByTestId('delete-post-confirm-button');
    await secondConfirmButton.waitFor({ state: 'visible' });
    await secondConfirmButton.click();

    await expect(page.locator('text=User post 2')).not.toBeVisible();
  });
});
