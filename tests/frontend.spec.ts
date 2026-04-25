import { test } from "./base-test";
import { expect } from "@playwright/test";
import { clickMenuAction, registerAndLogin } from "./utils";

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
  test.fixme(
    true,
    "Would fail because we expect no console error and 404 produces one. \
    TODO: either expect 404 error or change 404 page to redirect to home",
  );
  const response = await page.goto("/unknown-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByText(/not found/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /go back home/i })).toBeVisible();
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
      await registerAndLogin(page);
      await page.goto("/game");
      await page.getByRole("button", { name: /\bchess\b$/i }).click();
    }),
  );

  await Promise.all([
    expect(page1.getByText(/WHITE/i).first()).toBeVisible({ timeout: 15000 }),
    expect(page1.getByText(/BLACK/i).first()).toBeVisible({ timeout: 15000 }),
    expect(page2.getByText(/WHITE/i).first()).toBeVisible({ timeout: 15000 }),
    expect(page2.getByText(/BLACK/i).first()).toBeVisible({ timeout: 15000 }),
  ]);

  await clickMenuAction(page1, /resign/i);
  await Promise.all([
    expect(page1.getByText(/Result: lose/i)).toBeVisible(),
    expect(page1.getByText(/Reason: Resignation/i)).toBeVisible(),
    expect(page2.getByText(/Result: win/i)).toBeVisible(),
    expect(page2.getByText(/Reason: Resignation/i)).toBeVisible(),
  ]);

  await Promise.all(contexts.map((ctx) => ctx.close()));
});
