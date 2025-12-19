const { test, expect } = require('@playwright/test');

test.describe('BlockGuardian Basic E2E Tests', () => {
    test('homepage loads correctly', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/BlockGuardian/);
        await expect(page.locator('h1')).toContainText('BlockGuardian');
    });

    test('navigation works', async ({ page }) => {
        await page.goto('/');

        // Click on Portfolio link
        await page.click('text=Explore Portfolio');
        await expect(page).toHaveURL(/.*portfolio/);

        // Go back home
        await page.click('text=BlockGuardian');
        await expect(page).toHaveURL('/');
    });

    test('dark mode toggle works', async ({ page }) => {
        await page.goto('/');

        // Get initial state
        const html = page.locator('html');
        const initialHasDark = await html.evaluate((el) => el.classList.contains('dark'));

        // Click dark mode toggle
        await page.click('button:has-text("🌙"), button:has-text("☀️")');

        // Wait for state change
        await page.waitForTimeout(500);

        // Check state changed
        const finalHasDark = await html.evaluate((el) => el.classList.contains('dark'));
        expect(finalHasDark).not.toBe(initialHasDark);
    });

    test('login page loads', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('h2')).toContainText(/Sign in|Login|Log in/i);
    });
});

test.describe('BlockGuardian with Mock Backend', () => {
    test.beforeEach(async ({ page }) => {
        // Mock API responses
        await page.route('**/api/health', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                }),
            });
        });
    });

    test('health check works with mock backend', async ({ page }) => {
        await page.goto('/');
        // Add logic to trigger health check if needed
        // This is a placeholder for integration testing
    });
});
