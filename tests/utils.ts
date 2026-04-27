import { expect } from "@playwright/test";

export type Credentials = {
  email: string;
  username: string;
  password: string;
};

export function createCredentials(
  emailPrefix = "fe-user",
  usernamePrefix = "feuser",
): Credentials {
  const id = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  return {
    email: `${emailPrefix}-${id}@example.com`,
    username: `${usernamePrefix}${id}`,
    password: "SecurePass123!",
  };
}

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
  await page.getByRole("button", { name: /^confirm$/i }).click();
}

export async function clickMenuAction(
  page: import("@playwright/test").Page,
  actionName: RegExp,
) {
  await (await getVisibleMenuAction(page, actionName)).click();
}

export async function registerAndLogin(
  page: import("@playwright/test").Page,
  credentials?: Credentials,
) {
  const userCredentials = credentials ?? createCredentials();

  await openRegisterModal(page);
  await expect(page.getByText("Guest")).toBeVisible();
  const heading = page.getByRole("heading", { name: /register/i });
  await expect(heading).toBeVisible();

  await page.fill("#email", userCredentials.email);
  await page.fill("#username", userCredentials.username);
  await page.fill("#password", userCredentials.password);
  await page.fill("#confirmPassword", userCredentials.password);
  await page.getByRole("button", { name: /^submit$/i }).click();

  await Promise.race([
    expect(heading).not.toBeVisible(),
    expect(page.getByText(userCredentials.username).first()).toBeVisible(),
  ]);

  return userCredentials;
}
