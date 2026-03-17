import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Chess 42|ft_transcendence/i);
  await expect(page.getByRole("heading", { name: /Chess 42/i })).toBeVisible();
});

test("game page is reachable", async ({ page }) => {
  const response = await page.goto("/game");
  expect(response?.status()).toBeLessThan(500);
});

test("unknown page returns 404", async ({ page }) => {
  const response = await page.goto("/unknown-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByText(/not found/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /go back home/i })).toBeVisible();
});

test("sidebar swaps menu actions during active match", async ({ browser }) => {
  const contexts = await Promise.all([
    browser.newContext(),
    browser.newContext(),
  ]);
  const [page1, page2] = await Promise.all(
    contexts.map((ctx) => ctx.newPage()),
  );

  await Promise.all([page1.goto("/game"), page2.goto("/game")]);

  await expect(page1.getByRole("link", { name: /play/i })).toBeVisible();

  await Promise.all(
    [page1, page2].map((page) =>
      page.getByRole("button", { name: /find match/i }).click(),
    ),
  );

  await Promise.all([
    expect(
      page1.getByRole("heading", { name: /game in progress/i }),
    ).toBeVisible(),
    expect(
      page2.getByRole("heading", { name: /game in progress/i }),
    ).toBeVisible(),
  ]);

  await expect(page1.getByRole("link", { name: /play/i })).toHaveCount(0);
  await expect(page1.getByRole("button", { name: /resign/i })).toBeVisible();

  await page1.getByRole("button", { name: /resign/i }).click();

  await Promise.all([
    expect(page1.getByText(/Result: lose/i)).toBeVisible(),
    expect(page2.getByText(/Result: win/i)).toBeVisible(),
    expect(page1.getByRole("link", { name: /play/i })).toBeVisible(),
  ]);

  await Promise.all(contexts.map((ctx) => ctx.close()));
});

// Use `browser` fixture to create independent sessions for each user
test("find match and resign", async ({ browser }) => {
  const contexts = await Promise.all([
    browser.newContext(),
    browser.newContext(),
  ]);
  const [page1, page2] = await Promise.all(
    contexts.map((ctx) => ctx.newPage()),
  );

  await Promise.all(
    [page1, page2].map(async (page) => {
      await page.goto("/game");
      await page.getByRole("button", { name: /find match/i }).click();
    }),
  );

  await Promise.all([
    expect(
      page1.getByRole("heading", { name: /game in progress/i }),
    ).toBeVisible(),
    expect(
      page2.getByRole("heading", { name: /game in progress/i }),
    ).toBeVisible(),
  ]);

  await page1.getByRole("button", { name: /resign/i }).click();
  await Promise.all([
    expect(page1.getByText(/Result: lose/i)).toBeVisible(),
    expect(page1.getByText(/Reason: Resignation/i)).toBeVisible(),
    expect(page2.getByText(/Result: win/i)).toBeVisible(),
    expect(page2.getByText(/Reason: Resignation/i)).toBeVisible(),
  ]);

  await Promise.all(contexts.map((ctx) => ctx.close()));
});

test("MoreModal closes when clicking internal link", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /more\.\.\./i }).click();
  await expect(page.getByRole("heading", { name: /more/i })).toBeVisible();

  await page.getByRole("link", { name: /privacy policy/i }).click();
  await expect(page).toHaveURL(/privacy-policy/);
  await expect(page.getByRole("heading", { name: /more/i })).not.toBeVisible();
});

test("MoreModal navigates to external link", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /more\.\.\./i }).click();
  await expect(page.getByRole("heading", { name: /more/i })).toBeVisible();

  await Promise.all([
    page.waitForURL(/github\.com.*42ft_transcendence/),
    page.getByRole("link", { name: /source code/i }).click(),
  ]);

  await expect(page).toHaveURL(/github\.com.*42ft_transcendence/);
});
