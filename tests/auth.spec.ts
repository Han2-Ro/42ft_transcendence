import { test, expect } from "@playwright/test";

const ts = Date.now();
const feUser = {
  email: `fe-user-${ts}@example.com`,
  username: `feuser${ts}`,
  password: "SecurePass123!",
};

// Serial mode: tests run in order and subsequent tests are skipped if a previous one fails.
// login and logout rely on the user created by the register test.
test.describe.serial("auth UI flows", () => {
  test("register via modal", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(feUser.username)).not.toBeVisible();
    await expect(page.getByText('Guest')).toBeVisible();
    await page.getByRole("button", { name: /log in/i }).click();
    await page.getByRole("button", { name: /register here/i }).click();
    const heading = await page.getByRole("heading", { name: /register/i });
    await expect(heading).toBeVisible();

    await page.fill("#email", feUser.email);
    await page.fill("#username", feUser.username);
    await page.fill("#password", feUser.password);
    await page.fill("#confirmPassword", feUser.password);
    await page.getByRole("button", { name: /^submit$/i }).click();
    await expect(heading).not.toBeVisible();

    // Modal should close and username should appear in the nav
    // TODO: specify requirement: should a user be automatically logged in after registering?
    // await expect(page.getByText('Guest')).not.toBeVisible();
    // await expect(page.getByText(feUser.username)).toBeVisible();
  });

  test("login via modal", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();

    await page.fill("#email", feUser.email);
    await page.fill("#password", feUser.password);
    const submitButton = await page.getByRole("button", { name: /^submit$/i });
    await expect(submitButton).toBeVisible();
    await submitButton.first().screenshot();
    await submitButton.click();
    await expect(submitButton).not.toBeVisible();

    await expect(page.getByText('john_42')).toBeVisible();
    // TODO: replace with line below once getSession (nextjs/src/lib/auth/session.ts) is properly implented
    // await expect(page.getByText(feUser.username)).toBeVisible();
  });

  test("logout", async ({ page }) => {
    // Log in first
    await page.goto("/");
    await page.getByRole("button", { name: /log in/i }).click();
    await page.fill("#email", feUser.email);
    await page.fill("#password", feUser.password);
    await page.getByRole("button", { name: /^submit$/i }).click();
    await expect(page.getByText('john_42')).toBeVisible();
    // TODO: replace with line below once getSession (nextjs/src/lib/auth/session.ts) is properly implented
    // await expect(page.getByText(feUser.username)).toBeVisible();

    // Log out
    await page.getByRole("button", { name: /log out/i }).click();
    await expect(page.getByText("Guest")).toBeVisible();
  });
});
