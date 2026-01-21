import { test, expect, Page } from '@playwright/test';

// Helper function to perform login
async function loginUser(page: Page): Promise<boolean> {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    return false;
  }

  await page.goto('/');

  // Fill login form using the Auth component selectors
  await page.getByLabel(/email/i).fill(email);
  await page.locator('input[type="password"]').first().fill(password);

  // Click sign in
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for login to complete - should see Language Tutor heading in DifficultySelector
  await page.waitForSelector('text=Language Tutor', { timeout: 15000 });

  return true;
}

test.describe('App - Unauthenticated', () => {
  test('app title contains Language Tutor', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Language Tutor/i);
  });

  test('unauthenticated shows login screen', async ({ page }) => {
    await page.goto('/');
    // Should show login/auth screen with Sign In heading
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('login form elements are enabled', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel(/email/i)).toBeEnabled();
    await expect(page.locator('input[type="password"]')).toBeEnabled();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeEnabled();
  });
});

test.describe('App - Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginUser(page);
    if (!loggedIn) {
      test.skip();
    }
  });

  test('difficulty selector loads after login', async ({ page }) => {
    // After login, should see the Language Tutor heading from DifficultySelector
    await expect(page.getByRole('heading', { name: /language tutor/i })).toBeVisible({ timeout: 10000 });

    // Should see difficulty level buttons (A1, A2, B1, B2, C1, C2)
    await expect(page.getByText('A1')).toBeVisible();
    await expect(page.getByText('A2')).toBeVisible();
    await expect(page.getByText('B1')).toBeVisible();
  });

  test('difficulty levels are selectable', async ({ page }) => {
    // Click on B1 level
    await page.getByText('B1').click();

    // B1 should be selected (has blue border styling)
    const b1Button = page.locator('button').filter({ hasText: 'B1' }).first();
    await expect(b1Button).toHaveClass(/border-blue-500/);
  });

  test('language selector displays languages', async ({ page }) => {
    // Wait for languages to load from API
    await page.waitForSelector('text=What language are you learning?', { timeout: 15000 });

    // Should show the language selection heading
    await expect(page.getByText('What language are you learning?')).toBeVisible();
  });

  test('generate scenario button is visible', async ({ page }) => {
    // Should see Generate Scenario button
    await expect(page.getByRole('button', { name: /generate scenario/i })).toBeVisible();
  });

  test('can click generate scenario', async ({ page }) => {
    // Click generate scenario button
    await page.getByRole('button', { name: /generate scenario/i }).click();

    // Should show loading state or scenario content
    // Wait for either loading text or scenario card to appear
    await expect(
      page.getByText(/generating scenario/i)
        .or(page.getByText(/your scenario/i))
        .or(page.getByText(/setting/i))
    ).toBeVisible({ timeout: 30000 });
  });

  test('scenario proposal card displays after generation', async ({ page }) => {
    // Generate a scenario
    await page.getByRole('button', { name: /generate scenario/i }).click();

    // Wait for scenario card - look for "Your Scenario" heading
    await expect(page.getByText('Your Scenario')).toBeVisible({ timeout: 30000 });

    // Should show scenario elements
    await expect(page.getByText(/setting/i).first()).toBeVisible();
    await expect(page.getByText(/character/i).first()).toBeVisible();
    await expect(page.getByText(/objective/i).first()).toBeVisible();
    await expect(page.getByText(/opening line/i).first()).toBeVisible();
  });

  test('scenario card has accept and modify buttons', async ({ page }) => {
    // Generate a scenario
    await page.getByRole('button', { name: /generate scenario/i }).click();

    // Wait for scenario card
    await expect(page.getByText('Your Scenario')).toBeVisible({ timeout: 30000 });

    // Should have Accept & Begin button
    await expect(page.getByRole('button', { name: /accept.*begin/i })).toBeVisible();

    // Should have Modify button
    await expect(page.getByRole('button', { name: /modify/i })).toBeVisible();

    // Should have New Scenario button
    await expect(page.getByRole('button', { name: /new scenario/i })).toBeVisible();
  });

  test('can accept scenario and enter chat', async ({ page }) => {
    // Generate a scenario
    await page.getByRole('button', { name: /generate scenario/i }).click();

    // Wait for scenario card
    await expect(page.getByText('Your Scenario')).toBeVisible({ timeout: 30000 });

    // Accept the scenario
    await page.getByRole('button', { name: /accept.*begin/i }).click();

    // Should enter chat view - look for chat input
    await expect(page.locator('input[placeholder*="response"]')).toBeVisible({ timeout: 15000 });

    // Should have Send button
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible();
  });

  test('chat shows opening line from character', async ({ page }) => {
    // Generate and accept scenario
    await page.getByRole('button', { name: /generate scenario/i }).click();
    await expect(page.getByText('Your Scenario')).toBeVisible({ timeout: 30000 });
    await page.getByRole('button', { name: /accept.*begin/i }).click();

    // Wait for chat to load
    await expect(page.locator('input[placeholder*="response"]')).toBeVisible({ timeout: 15000 });

    // Should show at least one message (the opening line)
    await expect(page.locator('.rounded-2xl').first()).toBeVisible();
  });

  test('theme input field accepts text', async ({ page }) => {
    // Find theme input
    const themeInput = page.locator('#theme-input');
    await expect(themeInput).toBeVisible();

    // Type a theme
    await themeInput.fill('coffee shop');

    // Verify the value
    await expect(themeInput).toHaveValue('coffee shop');
  });
});

// Tests that explicitly require auth credentials
test.describe('App - Full User Journey', () => {
  test.skip(
    () => !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
    'Skipping: TEST_USER_EMAIL and TEST_USER_PASSWORD required'
  );

  test('complete flow: login, generate, accept, chat', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!);
    await page.locator('input[type="password"]').first().fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for main app
    await expect(page.getByRole('heading', { name: /language tutor/i })).toBeVisible({ timeout: 15000 });

    // Generate scenario
    await page.getByRole('button', { name: /generate scenario/i }).click();

    // Wait for and verify scenario card
    await expect(page.getByText('Your Scenario')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/setting/i).first()).toBeVisible();

    // Accept scenario
    await page.getByRole('button', { name: /accept.*begin/i }).click();

    // Verify chat interface loaded
    await expect(page.locator('input[placeholder*="response"]')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible();
  });

  test('chat interaction: send message and receive response', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!);
    await page.locator('input[type="password"]').first().fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for main app and generate scenario
    await expect(page.getByRole('heading', { name: /language tutor/i })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /generate scenario/i }).click();

    // Accept scenario
    await expect(page.getByText('Your Scenario')).toBeVisible({ timeout: 30000 });
    await page.getByRole('button', { name: /accept.*begin/i }).click();

    // Wait for chat input
    const chatInput = page.locator('input[placeholder*="response"]');
    await expect(chatInput).toBeVisible({ timeout: 15000 });

    // Send a message
    await chatInput.fill('Bonjour!');
    await page.getByRole('button', { name: /send/i }).click();

    // Wait for response - there should be multiple messages now (opening + user + response)
    await page.waitForTimeout(5000); // Give time for API response
    const messages = page.locator('.rounded-2xl');
    await expect(messages).toHaveCount(3, { timeout: 30000 }); // opening, user msg, character response
  });

  test('tutor sidebar shows tips after chat', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!);
    await page.locator('input[type="password"]').first().fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Generate and accept scenario
    await expect(page.getByRole('heading', { name: /language tutor/i })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /generate scenario/i }).click();
    await expect(page.getByText('Your Scenario')).toBeVisible({ timeout: 30000 });
    await page.getByRole('button', { name: /accept.*begin/i }).click();

    // Send a message to trigger tutor tips
    const chatInput = page.locator('input[placeholder*="response"]');
    await expect(chatInput).toBeVisible({ timeout: 15000 });
    await chatInput.fill('Bonjour, comment allez-vous?');
    await page.getByRole('button', { name: /send/i }).click();

    // Wait for response and check for tutor sidebar content
    await page.waitForTimeout(5000);

    // Tutor sidebar should be visible with section headings
    await expect(
      page.getByText(/tutor|corrections|vocabulary|cultural/i).first()
    ).toBeVisible({ timeout: 10000 });
  });
});

// Scenario modification tests
test.describe('App - Scenario Modification', () => {
  test.skip(
    () => !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
    'Skipping: TEST_USER_EMAIL and TEST_USER_PASSWORD required'
  );

  test('can request new scenario', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!);
    await page.locator('input[type="password"]').first().fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Generate scenario
    await expect(page.getByRole('heading', { name: /language tutor/i })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /generate scenario/i }).click();
    await expect(page.getByText('Your Scenario')).toBeVisible({ timeout: 30000 });

    // Click New Scenario
    await page.getByRole('button', { name: /new scenario/i }).click();

    // Should show loading or new scenario
    await expect(
      page.getByText(/generating/i)
        .or(page.getByText('Your Scenario'))
    ).toBeVisible({ timeout: 30000 });
  });

  test('modify button shows input field', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!);
    await page.locator('input[type="password"]').first().fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Generate scenario
    await expect(page.getByRole('heading', { name: /language tutor/i })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /generate scenario/i }).click();
    await expect(page.getByText('Your Scenario')).toBeVisible({ timeout: 30000 });

    // Click Modify
    await page.getByRole('button', { name: /modify/i }).click();

    // Should show textarea for modification input
    await expect(page.locator('textarea[placeholder*="change"]')).toBeVisible();

    // Should show Submit Modification button
    await expect(page.getByRole('button', { name: /submit modification/i })).toBeVisible();

    // Should show Cancel button
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
  });
});
