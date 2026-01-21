import { test, expect } from '@playwright/test';

test.describe('Authentication Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('login page loads', async ({ page }) => {
    // Verify Sign In heading is visible
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

    // Verify email input is visible (by label)
    await expect(page.getByLabel(/email/i)).toBeVisible();

    // Verify password input is visible (by type)
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Verify sign in button exists
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('signup link works', async ({ page }) => {
    // Click "Sign Up" link (it's a span, not a link element)
    await page.getByText('Sign Up', { exact: true }).click();

    // Should show "Create Account" heading
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();

    // Should show confirm password field
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();

    // Should show Sign Up button
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
  });

  test('forgot password link works', async ({ page }) => {
    // Click "Forgot Password?" link
    await page.getByText('Forgot Password?').click();

    // Should show "Reset Password" heading
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();

    // Should show "Send Reset Code" button
    await expect(page.getByRole('button', { name: /send reset code/i })).toBeVisible();

    // Should show informational text
    await expect(page.getByText(/enter your email address/i)).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword123');

    // Click sign in button
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show error message (Cognito returns specific error messages)
    await expect(
      page.locator('.bg-red-50').or(page.getByText(/incorrect|invalid|error|not.*found|failed|user.*does.*not.*exist/i))
    ).toBeVisible({ timeout: 10000 });
  });

  test('cognito is configured properly', async ({ page }) => {
    // Verify no "UserPool not configured" or similar error appears
    await expect(page.getByText(/userpool.*not.*configured/i)).not.toBeVisible();
    await expect(page.getByText(/configuration.*error/i)).not.toBeVisible();

    // The auth form should be functional (Cognito working)
    await expect(page.getByLabel(/email/i)).toBeEnabled();
    await expect(page.locator('input[type="password"]')).toBeEnabled();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeEnabled();
  });

  test('can navigate between auth states', async ({ page }) => {
    // Start at Sign In
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

    // Go to Sign Up
    await page.getByText('Sign Up', { exact: true }).click();
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();

    // Go back to Sign In
    await page.getByText('Sign In', { exact: true }).click();
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

    // Go to Forgot Password
    await page.getByText('Forgot Password?').click();
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();

    // Go back to Sign In
    await page.getByText('Back to Sign In').click();
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('signup form validates password match', async ({ page }) => {
    // Navigate to sign up
    await page.getByText('Sign Up', { exact: true }).click();

    // Fill in form with mismatched passwords
    await page.getByLabel('Email').fill('test@example.com');
    await page.locator('input[type="password"]').first().fill('Password123!');
    await page.getByLabel(/confirm password/i).fill('DifferentPassword123!');

    // Submit form
    await page.getByRole('button', { name: /sign up/i }).click();

    // Should show password mismatch error
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('app title and description are visible', async ({ page }) => {
    // Verify app branding
    await expect(page.getByRole('heading', { name: /language tutor/i })).toBeVisible();
    await expect(page.getByText(/practice languages with ai conversations/i)).toBeVisible();
  });
});
