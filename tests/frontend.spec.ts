import { test, expect } from "@playwright/test";

async function openRegisterModal(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: /log in/i }).click();
  await page.getByRole("button", { name: /register here/i }).click();
  await expect(page.getByRole("heading", { name: /register/i })).toBeVisible();
}

async function openLoginModal(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: /log in/i }).click();
  await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
}

async function registerAndLogin(page: import("@playwright/test").Page) {
  const ts = Date.now();
  const credentials = {
    email: `fe-user-${ts}@example.com`,
    username: `feuser${ts}`,
    password: "SecurePass123!",
  };

  // Register
  await openRegisterModal(page);
  await page.fill("#email", credentials.email);
  await page.fill("#username", credentials.username);
  await page.fill("#password", credentials.password);
  await page.fill("#confirmPassword", credentials.password);
  await page.getByRole("button", { name: /^submit$/i }).click();

  // Login
  await openLoginModal(page);
  await page.fill("#email", credentials.email);
  await page.fill("#password", credentials.password);
  await page.getByRole("button", { name: /^submit$/i }).click();

  await expect(page.getByText(credentials.username)).toBeVisible();
}

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
      await page.getByRole("button", { name: /find chess match/i }).click();
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
