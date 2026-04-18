import { test, expect } from "@playwright/test";

const ts = Date.now();
const testUser = {
  email: `session-test-${ts}@example.com`,
  username: `sessuser${ts}`,
  password: "SecurePass123!",
};

test.describe("getSession()", () => {
  test("no token shows Guest", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Guest")).toBeVisible();
  });

  test("invalid token shows Guest", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "token",
        value: "invalid.jwt.token",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/");
    await expect(page.getByText("Guest")).toBeVisible();
  });

  test("login returns correct username from session", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /log in/i }).click();
    await page.getByRole("button", { name: /register here/i }).click();

    await page.fill("#email", testUser.email);
    await page.fill("#username", testUser.username);
    await page.fill("#password", testUser.password);
    await page.fill("#confirmPassword", testUser.password);
    await page.getByRole("button", { name: /^submit$/i }).click();

    await expect(
      page.getByRole("heading", { name: /register/i }),
    ).not.toBeVisible({ timeout: 30000 });

    await expect(page.getByText(testUser.username)).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("john_42")).not.toBeVisible();
  });
});
