const { test, expect } = require("@playwright/test");

test.describe("BlockGuardian E2E", () => {
  test("home page loads and displays hero heading", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/BlockGuardian/i);
    await expect(page.locator("h1")).toBeVisible();
    const h1Text = await page.locator("h1").textContent();
    expect(h1Text).toMatch(/Guard Your/i);
  });

  test("home page has CTA links that navigate correctly", async ({ page }) => {
    await page.goto("/");
    const exploreLink = page.getByRole("link", { name: /Explore Portfolio/i });
    await expect(exploreLink).toBeVisible();
    await exploreLink.click();
    await expect(page).toHaveURL(/\/portfolio/);
  });

  test("navbar brand logo links to home", async ({ page }) => {
    await page.goto("/portfolio");
    await page.getByText("BlockGuardian").first().click();
    await expect(page).toHaveURL("/");
  });

  test("login page renders form", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: /Welcome back/i }),
    ).toBeVisible();
    await expect(page.getByPlaceholder(/you@example.com/i)).toBeVisible();
    await expect(page.getByLabel(/^Password$/i)).toBeVisible();
  });

  test("login form shows validation error for empty submit", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /Sign in/i }).click();
    await expect(
      page.getByText(/Please fill in all required fields/i),
    ).toBeVisible();
  });

  test("login switches to signup mode", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /Sign up for free/i }).click();
    await expect(
      page.getByRole("heading", { name: /Create an account/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/Full Name/i)).toBeVisible();
    await expect(page.getByLabel(/Confirm Password/i)).toBeVisible();
  });

  test("portfolio page loads", async ({ page }) => {
    await page.goto("/portfolio");
    await expect(
      page.getByRole("heading", { name: /Portfolio Dashboard/i }),
    ).toBeVisible();
  });

  test("dashboard page loads", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: /Dashboard/i }),
    ).toBeVisible();
  });

  test("dashboard tabs are clickable", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /activity/i }).click();
    await expect(page.getByText(/Activity History/i)).toBeVisible();

    await page.getByRole("button", { name: /settings/i }).click();
    await expect(page.getByText(/Account Settings/i)).toBeVisible();
  });

  test("market analysis page loads", async ({ page }) => {
    await page.goto("/market-analysis");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("AI recommendations page loads", async ({ page }) => {
    await page.goto("/ai-recommendations");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("blockchain explorer page loads", async ({ page }) => {
    await page.goto("/blockchain-explorer");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("dark mode toggle works on login page", async ({ page }) => {
    await page.goto("/login");
    const toggleBtn = page.getByRole("button", { name: /Toggle dark mode/i });
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();
  });

  test("navbar mobile menu opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const menuBtn = page.getByRole("button", { name: /Open main menu/i });
    await menuBtn.click();
    await expect(
      page.getByRole("link", { name: /Portfolio/i }).first(),
    ).toBeVisible();
    await menuBtn.click();
  });

  test("footer renders with platform links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });
});
