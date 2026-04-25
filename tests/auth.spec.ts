import { test } from "./base-test";
import { expect } from "@playwright/test";
import { openRegisterModal, openLoginModal, logout } from "./utils";

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
    await openRegisterModal(page);
    await expect(page.getByText(feUser.username)).not.toBeVisible();
    await expect(page.getByText("Guest")).toBeVisible();
    const heading = page.getByRole("heading", { name: /register/i });
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
    await openLoginModal(page);

    await page.fill("#username", feUser.email);
    await page.fill("#password", feUser.password);
    const submitButton = await page.getByRole("button", { name: /^submit$/i });
    await expect(submitButton).toBeVisible();
    await submitButton.click();
    await expect(submitButton).not.toBeVisible();

    await expect(page.getByText(feUser.username).first()).toBeVisible();
  });

  test("logout", async ({ page }) => {
    // Log in first
    await openLoginModal(page);
    await page.fill("#username", feUser.email);
    await page.fill("#password", feUser.password);
    await page.getByRole("button", { name: /^submit$/i }).click();
    await expect(page.getByText(feUser.username)).toBeVisible();

    // Log out
    await logout(page);
    await expect(page.getByText("Guest")).toBeVisible();
  });

  test("register: passwords do not match", async ({ page }) => {
    await openRegisterModal(page);
    await page.fill("#email", feUser.email);
    await page.fill("#username", feUser.username);
    await page.fill("#password", feUser.password);
    await page.fill("#confirmPassword", "different-password");
    await page.getByRole("button", { name: /^submit$/i }).click();
    await expect(page.getByText("Passwords do not match")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /register/i }),
    ).toBeVisible();
  });

  test("register: password too short", async ({ page }) => {
    await openRegisterModal(page);
    await page.fill("#email", feUser.email);
    await page.fill("#username", feUser.username);
    await page.fill("#password", "short");
    await page.fill("#confirmPassword", "short");
    await page.getByRole("button", { name: /^submit$/i }).click();
    await expect(
      page.getByText("Password must be at least 8 characters"),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /register/i }),
    ).toBeVisible();
  });

  test("register: email or username already taken", async ({ page }) => {
    // Try to register again with the same credentials
    await openRegisterModal(page);
    await page.fill("#email", feUser.email);
    await page.fill("#username", feUser.username);
    await page.fill("#password", feUser.password);
    await page.fill("#confirmPassword", feUser.password);
    await page.getByRole("button", { name: /^submit$/i }).click();
    await expect(
      page.getByText("User with this email or username already exists"),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /register/i }),
    ).toBeVisible();
  });

  test("login: wrong password", async ({ page }) => {
    await openLoginModal(page);
    await page.fill("#username", feUser.email);
    await page.fill("#password", "WrongPassword99!");
    await page.getByRole("button", { name: /^submit$/i }).click();
    await expect(page.getByText("Invalid username or password")).toBeVisible();
    await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
  });

  test("login: unknown email", async ({ page }) => {
    await openLoginModal(page);
    await page.fill("#username", "nobody@example.com");
    await page.fill("#password", feUser.password);
    await page.getByRole("button", { name: /^submit$/i }).click();
    await expect(page.getByText("Invalid username or password")).toBeVisible();
    await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
  });
});
