import { expect } from "@playwright/test";

export async function getVisibleMenuAction(
  page: import("@playwright/test").Page,
  actionName: RegExp,
) {
  const actionButton = page.getByRole("button", { name: actionName });
  if (await actionButton.isVisible()) return actionButton;

  const mobileMenuToggle = page.locator("button.lg\\:hidden").first();
  if (
    (await mobileMenuToggle.count()) > 0 &&
    (await mobileMenuToggle.isVisible())
  ) {
    await mobileMenuToggle.click();
  }

  await expect(actionButton).toBeVisible();
  return actionButton;
}

export async function openRegisterModal(page: import("@playwright/test").Page) {
  await page.goto("/");
  await (await getVisibleMenuAction(page, /log in/i)).click();
  await page.getByRole("button", { name: /register here/i }).click();
  await expect(page.getByRole("heading", { name: /register/i })).toBeVisible();
}

export async function openLoginModal(page: import("@playwright/test").Page) {
  await page.goto("/");
  await (await getVisibleMenuAction(page, /log in/i)).click();
  await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
}

export async function logout(page: import("@playwright/test").Page) {
  await (await getVisibleMenuAction(page, /log out/i)).click();
}

export async function clickMenuAction(
  page: import("@playwright/test").Page,
  actionName: RegExp,
) {
  await (await getVisibleMenuAction(page, actionName)).click();
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

  // Wait for either the heading to disappear OR the username to appear
  await Promise.race([
    expect(heading).not.toBeVisible(),
    expect(page.getByText(credentials.username).first()).toBeVisible(),
  ]);

  await expect(page.getByText(credentials.username).first()).toBeVisible();
}
