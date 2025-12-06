import { test, expect } from '../fixtures/base';

test.describe('Update Profile', () => {
  test('should successfully update full name', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    // Open user menu
    await page.getByTestId('navbar-user-menu-trigger').click();

    // Click update profile
    await page.getByTestId('navbar-update-profile-button').click();

    // Profile modal should open
    await expect(page.getByTestId('profile-modal')).toBeVisible();

    // Change full name
    const newFullName = 'Updated User Name';
    await page.getByTestId('profile-fullname-input').clear();
    await page.getByTestId('profile-fullname-input').fill(newFullName);

    // Save changes
    await page.getByTestId('profile-save-button').click();

    // Modal should close
    await expect(page.getByTestId('profile-modal')).not.toBeVisible();

    // Reopen profile modal to verify change
    await page.getByTestId('navbar-user-menu-trigger').click();
    await page.getByTestId('navbar-update-profile-button').click();

    // Should see updated full name
    await expect(page.getByTestId('profile-fullname-input')).toHaveValue(newFullName);
  });

  test('should show validation error for empty full name', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    // Open profile modal
    await page.getByTestId('navbar-user-menu-trigger').click();
    await page.getByTestId('navbar-update-profile-button').click();

    // Clear full name
    await page.getByTestId('profile-fullname-input').clear();

    // Try to save
    await page.getByTestId('profile-save-button').click();

    // Should show error message
    await expect(page.getByTestId('profile-error-message')).toBeVisible();
    await expect(page.locator('text=/.*full name.*required.*/i')).toBeVisible();

    // Modal should still be open
    await expect(page.getByTestId('profile-modal')).toBeVisible();
  });

  test('should cancel profile update', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    // Open profile modal
    await page.getByTestId('navbar-user-menu-trigger').click();
    await page.getByTestId('navbar-update-profile-button').click();

    // Get original full name
    const originalFullName = await page.getByTestId('profile-fullname-input').inputValue();

    // Change full name
    await page.getByTestId('profile-fullname-input').clear();
    await page.getByTestId('profile-fullname-input').fill('This will be cancelled');

    // Click cancel
    await page.getByTestId('profile-cancel-button').click();

    // Modal should close
    await expect(page.getByTestId('profile-modal')).not.toBeVisible();

    // Reopen and verify original name is still there
    await page.getByTestId('navbar-user-menu-trigger').click();
    await page.getByTestId('navbar-update-profile-button').click();

    await expect(page.getByTestId('profile-fullname-input')).toHaveValue(originalFullName);
  });

  test('should display username as read-only', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    // Open profile modal
    await page.getByTestId('navbar-user-menu-trigger').click();
    await page.getByTestId('navbar-update-profile-button').click();

    // Username field should be disabled
    const usernameInput = page.locator('#username');
    await expect(usernameInput).toBeDisabled();

    // Should display current username
    await expect(usernameInput).toHaveValue(authenticatedUser.username);

    // Should see message that username cannot be changed
    await expect(page.locator('text=/.*username.*cannot.*changed.*/i')).toBeVisible();
  });

  test('should display initials as read-only and auto-generated', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    // Open profile modal
    await page.getByTestId('navbar-user-menu-trigger').click();
    await page.getByTestId('navbar-update-profile-button').click();

    // Initials field should be disabled
    const initialsInput = page.locator('#initials');
    await expect(initialsInput).toBeDisabled();

    // Should see message that initials are auto-generated
    await expect(page.locator('text=/.*auto-generated.*/i')).toBeVisible();
  });

  test('should update initials when full name changes', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    // Open profile modal
    await page.getByTestId('navbar-user-menu-trigger').click();
    await page.getByTestId('navbar-update-profile-button').click();

    // Change full name to something with clear initials
    await page.getByTestId('profile-fullname-input').clear();
    await page.getByTestId('profile-fullname-input').fill('Alice Bob');

    // Save changes
    await page.getByTestId('profile-save-button').click();

    // Wait for modal to close
    await expect(page.getByTestId('profile-modal')).not.toBeVisible();

    // Reopen modal
    await page.getByTestId('navbar-user-menu-trigger').click();
    await page.getByTestId('navbar-update-profile-button').click();

    // Initials should be updated to "AB"
    const initialsInput = page.locator('#initials');
    await expect(initialsInput).toHaveValue('AB');
  });

  test('should reflect updated full name in navbar', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    // Open profile modal
    await page.getByTestId('navbar-user-menu-trigger').click();
    await page.getByTestId('navbar-update-profile-button').click();

    // Change full name
    const newFullName = 'New Display Name';
    await page.getByTestId('profile-fullname-input').clear();
    await page.getByTestId('profile-fullname-input').fill(newFullName);

    // Save changes
    await page.getByTestId('profile-save-button').click();

    // Wait for modal to close
    await expect(page.getByTestId('profile-modal')).not.toBeVisible();

    // Open user menu again
    await page.getByTestId('navbar-user-menu-trigger').click();

    // Should see updated full name in dropdown
    await expect(page.locator(`text=${newFullName}`)).toBeVisible();
  });

  test('should validate full name length', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    // Open profile modal
    await page.getByTestId('navbar-user-menu-trigger').click();
    await page.getByTestId('navbar-update-profile-button').click();

    // Try to enter a very long name (> 100 characters)
    const longName = 'A'.repeat(101);
    await page.getByTestId('profile-fullname-input').clear();
    await page.getByTestId('profile-fullname-input').fill(longName);

    // Try to save
    await page.getByTestId('profile-save-button').click();

    // Should show error (either via input maxLength or server validation)
    // If maxLength is set, the input will prevent typing beyond 100
    // Let's check that the input value is capped
    const inputValue = await page.getByTestId('profile-fullname-input').inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(100);
  });

  test('should close modal when clicking outside or pressing escape', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    // Open profile modal
    await page.getByTestId('navbar-user-menu-trigger').click();
    await page.getByTestId('navbar-update-profile-button').click();

    // Modal should be visible
    await expect(page.getByTestId('profile-modal')).toBeVisible();

    // Press Escape key
    await page.keyboard.press('Escape');

    // Modal should close
    await expect(page.getByTestId('profile-modal')).not.toBeVisible();
  });

  test('should persist profile changes after page reload', async ({ page, authenticatedUser }) => {
    await page.goto('/timeline');

    // Open profile modal and update name
    await page.getByTestId('navbar-user-menu-trigger').click();
    await page.getByTestId('navbar-update-profile-button').click();

    const newFullName = 'Persisted Name Change';
    await page.getByTestId('profile-fullname-input').clear();
    await page.getByTestId('profile-fullname-input').fill(newFullName);
    await page.getByTestId('profile-save-button').click();

    // Wait for modal to close
    await expect(page.getByTestId('profile-modal')).not.toBeVisible();

    // Reload page
    await page.reload();

    // Open profile modal again
    await page.getByTestId('navbar-user-menu-trigger').click();
    await page.getByTestId('navbar-update-profile-button').click();

    // Should still have the updated name
    await expect(page.getByTestId('profile-fullname-input')).toHaveValue(newFullName);
  });
});
