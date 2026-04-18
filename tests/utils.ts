import { expect } from "@playwright/test";

export async function openRegisterModal(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: /log in/i }).click();
  await page.getByRole("button", { name: /register here/i }).click();
  await expect(page.getByRole("heading", { name: /register/i })).toBeVisible();
}

export async function openLoginModal(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: /log in/i }).click();
  await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
}

export async function registerAndLogin(page: import("@playwright/test").Page) {
  const ts = Date.now();
  const credentials = {
    email: `fe-user-${ts}@example.com`,
    username: `feuser${ts}`,
    password: "SecurePass123!",
  };

  await openRegisterModal(page);
  await expect(page.getByText("Guest")).toBeVisible();
  const heading = page.getByRole("heading", { name: /register/i });
  await expect(heading).toBeVisible();

  await page.fill("#email", credentials.email);
  await page.fill("#username", credentials.username);
  await page.fill("#password", credentials.password);
  await page.fill("#confirmPassword", credentials.password);
  await page.getByRole("button", { name: /^submit$/i }).click();

  await expect(heading).not.toBeVisible();
  await expect(page.getByText(credentials.username)).toBeVisible();
}
