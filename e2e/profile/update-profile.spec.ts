import { test, expect } from '../fixtures/base';

test.describe('Update Profile', () => {
  test('should successfully update full name', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    const userMenuTrigger = page.getByTestId('navbar-user-menu-trigger');
    await userMenuTrigger.waitFor({ state: 'visible' });
    await userMenuTrigger.click();

    const updateProfileButton = page.getByTestId('navbar-update-profile-button');
    await updateProfileButton.waitFor({ state: 'visible' });
    await updateProfileButton.click();

    const profileModal = page.getByTestId('profile-modal');
    await profileModal.waitFor({ state: 'visible' });
    await expect(profileModal).toBeVisible();

    const newFullName = 'Updated User Name';
    const fullnameInput = page.getByTestId('profile-fullname-input');
    await fullnameInput.waitFor({ state: 'visible' });
    await fullnameInput.clear();
    await fullnameInput.fill(newFullName);

    const saveButton = page.getByTestId('profile-save-button');
    await saveButton.waitFor({ state: 'visible' });
    await saveButton.click();

    await expect(profileModal).not.toBeVisible();

    await userMenuTrigger.waitFor({ state: 'visible' });
    await userMenuTrigger.click();

    await updateProfileButton.waitFor({ state: 'visible' });
    await updateProfileButton.click();

    await fullnameInput.waitFor({ state: 'visible' });
    await expect(fullnameInput).toHaveValue(newFullName);
  });

  test('should show validation error for empty full name', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    const userMenuTrigger = page.getByTestId('navbar-user-menu-trigger');
    await userMenuTrigger.waitFor({ state: 'visible' });
    await userMenuTrigger.click();

    const updateProfileButton = page.getByTestId('navbar-update-profile-button');
    await updateProfileButton.waitFor({ state: 'visible' });
    await updateProfileButton.click();

    const fullnameInput = page.getByTestId('profile-fullname-input');
    await fullnameInput.waitFor({ state: 'visible' });
    await fullnameInput.clear();

    const saveButton = page.getByTestId('profile-save-button');
    await saveButton.waitFor({ state: 'visible' });
    await saveButton.click();

    await expect(page.getByTestId('profile-error-message')).toBeVisible();
    await expect(page.locator('text=/.*full name.*required.*/i')).toBeVisible();

    const profileModal = page.getByTestId('profile-modal');
    await expect(profileModal).toBeVisible();
  });

  test('should cancel profile update', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    const userMenuTrigger = page.getByTestId('navbar-user-menu-trigger');
    await userMenuTrigger.waitFor({ state: 'visible' });
    await userMenuTrigger.click();

    const updateProfileButton = page.getByTestId('navbar-update-profile-button');
    await updateProfileButton.waitFor({ state: 'visible' });
    await updateProfileButton.click();

    const fullnameInput = page.getByTestId('profile-fullname-input');
    await fullnameInput.waitFor({ state: 'visible' });
    const originalFullName = await fullnameInput.inputValue();

    await fullnameInput.clear();
    await fullnameInput.fill('This will be cancelled');

    const cancelButton = page.getByTestId('profile-cancel-button');
    await cancelButton.waitFor({ state: 'visible' });
    await cancelButton.click();

    const profileModal = page.getByTestId('profile-modal');
    await expect(profileModal).not.toBeVisible();

    await userMenuTrigger.waitFor({ state: 'visible' });
    await userMenuTrigger.click();

    await updateProfileButton.waitFor({ state: 'visible' });
    await updateProfileButton.click();

    await fullnameInput.waitFor({ state: 'visible' });
    await expect(fullnameInput).toHaveValue(originalFullName);
  });

  test('should display username as read-only', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    const userMenuTrigger = page.getByTestId('navbar-user-menu-trigger');
    await userMenuTrigger.waitFor({ state: 'visible' });
    await userMenuTrigger.click();

    const updateProfileButton = page.getByTestId('navbar-update-profile-button');
    await updateProfileButton.waitFor({ state: 'visible' });
    await updateProfileButton.click();

    const usernameInput = page.locator('#username');
    await usernameInput.waitFor({ state: 'visible' });
    await expect(usernameInput).toBeDisabled();
    await expect(usernameInput).toHaveValue(authenticatedUser.username);
    await expect(page.locator('text=/.*username.*cannot.*changed.*/i')).toBeVisible();
  });

  test('should display initials as read-only and auto-generated', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    const userMenuTrigger = page.getByTestId('navbar-user-menu-trigger');
    await userMenuTrigger.waitFor({ state: 'visible' });
    await userMenuTrigger.click();

    const updateProfileButton = page.getByTestId('navbar-update-profile-button');
    await updateProfileButton.waitFor({ state: 'visible' });
    await updateProfileButton.click();

    const initialsInput = page.locator('#initials');
    await initialsInput.waitFor({ state: 'visible' });
    await expect(initialsInput).toBeDisabled();
    await expect(page.locator('text=/.*auto-generated.*/i')).toBeVisible();
  });

  test('should update initials when full name changes', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    const userMenuTrigger = page.getByTestId('navbar-user-menu-trigger');
    await userMenuTrigger.waitFor({ state: 'visible' });
    await userMenuTrigger.click();

    const updateProfileButton = page.getByTestId('navbar-update-profile-button');
    await updateProfileButton.waitFor({ state: 'visible' });
    await updateProfileButton.click();

    const fullnameInput = page.getByTestId('profile-fullname-input');
    await fullnameInput.waitFor({ state: 'visible' });
    await fullnameInput.clear();
    await fullnameInput.fill('Alice Bob');

    const saveButton = page.getByTestId('profile-save-button');
    await saveButton.waitFor({ state: 'visible' });
    await saveButton.click();

    const profileModal = page.getByTestId('profile-modal');
    await expect(profileModal).not.toBeVisible();

    await userMenuTrigger.waitFor({ state: 'visible' });
    await userMenuTrigger.click();

    await updateProfileButton.waitFor({ state: 'visible' });
    await updateProfileButton.click();

    const initialsInput = page.locator('#initials');
    await initialsInput.waitFor({ state: 'visible' });
    await expect(initialsInput).toHaveValue('AB');
  });

  test('should reflect updated full name in navbar', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    const userMenuTrigger = page.getByTestId('navbar-user-menu-trigger');
    await userMenuTrigger.waitFor({ state: 'visible' });
    await userMenuTrigger.click();

    const updateProfileButton = page.getByTestId('navbar-update-profile-button');
    await updateProfileButton.waitFor({ state: 'visible' });
    await updateProfileButton.click();

    const newFullName = 'New Display Name';
    const fullnameInput = page.getByTestId('profile-fullname-input');
    await fullnameInput.waitFor({ state: 'visible' });
    await fullnameInput.clear();
    await fullnameInput.fill(newFullName);

    const saveButton = page.getByTestId('profile-save-button');
    await saveButton.waitFor({ state: 'visible' });
    await saveButton.click();

    const profileModal = page.getByTestId('profile-modal');
    await expect(profileModal).not.toBeVisible();

    await userMenuTrigger.waitFor({ state: 'visible' });
    await userMenuTrigger.click();

    await expect(page.locator(`text=${newFullName}`)).toBeVisible();
  });

  test('should validate full name length', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    const userMenuTrigger = page.getByTestId('navbar-user-menu-trigger');
    await userMenuTrigger.waitFor({ state: 'visible' });
    await userMenuTrigger.click();

    const updateProfileButton = page.getByTestId('navbar-update-profile-button');
    await updateProfileButton.waitFor({ state: 'visible' });
    await updateProfileButton.click();

    const longName = 'A'.repeat(101);
    const fullnameInput = page.getByTestId('profile-fullname-input');
    await fullnameInput.waitFor({ state: 'visible' });
    await fullnameInput.clear();
    await fullnameInput.fill(longName);

    const saveButton = page.getByTestId('profile-save-button');
    await saveButton.waitFor({ state: 'visible' });
    await saveButton.click();

    const inputValue = await fullnameInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(100);
  });

  test('should close modal when clicking outside or pressing escape', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    const userMenuTrigger = page.getByTestId('navbar-user-menu-trigger');
    await userMenuTrigger.waitFor({ state: 'visible' });
    await userMenuTrigger.click();

    const updateProfileButton = page.getByTestId('navbar-update-profile-button');
    await updateProfileButton.waitFor({ state: 'visible' });
    await updateProfileButton.click();

    const profileModal = page.getByTestId('profile-modal');
    await profileModal.waitFor({ state: 'visible' });
    await expect(profileModal).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(profileModal).not.toBeVisible();
  });

  test('should persist profile changes after page reload', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    const userMenuTrigger = page.getByTestId('navbar-user-menu-trigger');
    await userMenuTrigger.waitFor({ state: 'visible' });
    await userMenuTrigger.click();

    const updateProfileButton = page.getByTestId('navbar-update-profile-button');
    await updateProfileButton.waitFor({ state: 'visible' });
    await updateProfileButton.click();

    const newFullName = 'Persisted Name Change';
    const fullnameInput = page.getByTestId('profile-fullname-input');
    await fullnameInput.waitFor({ state: 'visible' });
    await fullnameInput.clear();
    await fullnameInput.fill(newFullName);

    const saveButton = page.getByTestId('profile-save-button');
    await saveButton.waitFor({ state: 'visible' });
    await saveButton.click();

    const profileModal = page.getByTestId('profile-modal');
    await expect(profileModal).not.toBeVisible();

    await page.reload();

    await userMenuTrigger.waitFor({ state: 'visible' });
    await userMenuTrigger.click();

    await updateProfileButton.waitFor({ state: 'visible' });
    await updateProfileButton.click();

    await fullnameInput.waitFor({ state: 'visible' });
    await expect(fullnameInput).toHaveValue(newFullName);
  });
});
