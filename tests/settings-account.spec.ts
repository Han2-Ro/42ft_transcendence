import { test, expect, Page } from "@playwright/test";
import { openLoginModal, openRegisterModal, logout } from "./utils";

type Credentials = {
  email: string;
  username: string;
  password: string;
};

function createCredentials(): Credentials {
  const id = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  return {
    email: `settings-user-${id}@example.com`,
    username: `settingsuser${id}`,
    password: "SecurePass123!",
  };
}

async function registerAndLoginWithCredentials(page: Page, creds: Credentials) {
  await openRegisterModal(page);

  await page.fill("#email", creds.email);
  await page.fill("#username", creds.username);
  await page.fill("#password", creds.password);
  await page.fill("#confirmPassword", creds.password);
  await page.getByRole("button", { name: /^submit$/i }).click();

  await expect(page.getByText(creds.username).first()).toBeVisible();
}

async function openSettings(page: Page) {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: /^settings$/i })).toBeVisible();
}

async function clickUsernameChange(page: Page) {
  await page
    .getByText(/^Username:/)
    .locator("xpath=..")
    .getByRole("button", { name: /^change$/i })
    .click();
  await expect(
    page.getByRole("heading", { name: /change username/i }),
  ).toBeVisible();
}

async function clickPasswordChange(page: Page) {
  await page
    .getByText(/^Password:/)
    .locator("xpath=..")
    .getByRole("button", { name: /^change$/i })
    .click();
  await expect(
    page.getByRole("heading", { name: /change password/i }),
  ).toBeVisible();
}

test.describe("settings critical account flows (section C)", () => {
  test("C-UN-01 — Change username (happy path)", async ({ page }) => {
    const creds = createCredentials();
    const newUsername = `${creds.username}_new`;

    await registerAndLoginWithCredentials(page, creds);
    await openSettings(page);

    await clickUsernameChange(page);
    await page.getByLabel(/new username/i).fill(newUsername);
    await page.getByRole("button", { name: /^submit$/i }).click();

    await expect(
      page.getByRole("heading", { name: /change username/i }),
    ).not.toBeVisible();
    await expect(page.getByText(`Username: ${newUsername}`)).toBeVisible();

    await page.goto("/");
    await expect(page.getByText(newUsername).first()).toBeVisible();
  });

  test.fixme(
    "C-UN-02 — Change username to existing username",
    "Postponed: username error rendering/handling to be implemented later",
    async ({ page }) => {
      const userA = createCredentials();
      const userB = createCredentials();

      await registerAndLoginWithCredentials(page, userA);
      await logout(page);
      await registerAndLoginWithCredentials(page, userB);
      await openSettings(page);

      await clickUsernameChange(page);
      await page.getByLabel(/new username/i).fill(userA.username);
      await page.getByRole("button", { name: /^submit$/i }).click();

      await expect(page.getByText(/failed to update username/i)).toBeVisible();
      await expect(page.getByText(`Username: ${userB.username}`)).toBeVisible();
    },
  );

  test.fixme(
    "C-UN-03 — Change username to invalid value",
    "Postponed: invalid username validation spec/UI to be implemented later",
    async ({ page }) => {
      const creds = createCredentials();

      await registerAndLoginWithCredentials(page, creds);
      await openSettings(page);

      await clickUsernameChange(page);
      await page.getByLabel(/new username/i).fill("   ");
      await page.getByRole("button", { name: /^submit$/i }).click();

      await expect(page.getByText(/failed to update username/i)).toBeVisible();
      await expect(page.getByText(`Username: ${creds.username}`)).toBeVisible();
    },
  );

  test("C-UN-04 — Cancel username change", async ({ page }) => {
    const creds = createCredentials();

    await registerAndLoginWithCredentials(page, creds);
    await openSettings(page);

    await clickUsernameChange(page);
    await page.getByLabel(/new username/i).fill(`${creds.username}_new`);
    await page.getByRole("button", { name: /^cancel$/i }).click();

    await expect(
      page.getByRole("heading", { name: /change username/i }),
    ).not.toBeVisible();
    await expect(page.getByText(`Username: ${creds.username}`)).toBeVisible();
  });

  test("C-PW-01 — Change password (happy path)", async ({ page }) => {
    const creds = createCredentials();
    const newPassword = "BetterPass456!";

    await registerAndLoginWithCredentials(page, creds);
    await openSettings(page);

    await clickPasswordChange(page);
    await page.getByLabel(/current password/i).fill(creds.password);
    await page.getByLabel(/^new password$/i).fill(newPassword);
    await page.getByLabel(/confirm new password/i).fill(newPassword);
    await page.getByRole("button", { name: /^submit$/i }).click();

    await expect(
      page.getByRole("heading", { name: /change password/i }),
    ).not.toBeVisible();

    await logout(page);

    await openLoginModal(page);
    await page.fill("#username", creds.email);
    await page.fill("#password", newPassword);
    await page.getByRole("button", { name: /^submit$/i }).click();
    await expect(page.getByText(creds.username).first()).toBeVisible();

    await logout(page);

    await openLoginModal(page);
    await page.fill("#username", creds.email);
    await page.fill("#password", creds.password);
    await page.getByRole("button", { name: /^submit$/i }).click();
    await expect(page.getByText(/invalid username or password/i)).toBeVisible();
  });

  test("C-PW-02 — Wrong current password", async ({ page }) => {
    const creds = createCredentials();

    await registerAndLoginWithCredentials(page, creds);
    await openSettings(page);

    await clickPasswordChange(page);
    await page.getByLabel(/current password/i).fill("WrongPassword99!");
    await page.getByLabel(/^new password$/i).fill("BetterPass456!");
    await page.getByLabel(/confirm new password/i).fill("BetterPass456!");
    await page.getByRole("button", { name: /^submit$/i }).click();

    await expect(page.getByText(/invalid password/i)).toBeVisible();
  });

  test("C-PW-03 — New passwords mismatch", async ({ page }) => {
    const creds = createCredentials();

    await registerAndLoginWithCredentials(page, creds);
    await openSettings(page);

    await clickPasswordChange(page);
    await page.getByLabel(/current password/i).fill(creds.password);
    await page.getByLabel(/^new password$/i).fill("BetterPass456!");
    await page
      .getByLabel(/confirm new password/i)
      .fill("DifferentPass789!");
    await page.getByRole("button", { name: /^submit$/i }).click();

    await expect(page.getByText(/new passwords do not match/i)).toBeVisible();
  });

  test("C-PW-04 — New password too weak", async ({ page }) => {
    const creds = createCredentials();

    await registerAndLoginWithCredentials(page, creds);
    await openSettings(page);

    await clickPasswordChange(page);
    await page.getByLabel(/current password/i).fill(creds.password);
    await page.getByLabel(/^new password$/i).fill("short");
    await page.getByLabel(/confirm new password/i).fill("short");
    await page.getByRole("button", { name: /^submit$/i }).click();

    await expect(page.getByText(/weak password/i)).toBeVisible();
  });

  test("C-PW-05 — New password equals old password", async ({ page }) => {
    const creds = createCredentials();

    await registerAndLoginWithCredentials(page, creds);
    await openSettings(page);

    await clickPasswordChange(page);
    await page.getByLabel(/current password/i).fill(creds.password);
    await page.getByLabel(/^new password$/i).fill(creds.password);
    await page.getByLabel(/confirm new password/i).fill(creds.password);
    await page.getByRole("button", { name: /^submit$/i }).click();

    await expect(page.getByText(/same as old/i)).toBeVisible();
  });

  test("C-PW-06 — Cancel password change", async ({ page }) => {
    const creds = createCredentials();

    await registerAndLoginWithCredentials(page, creds);
    await openSettings(page);

    await clickPasswordChange(page);
    await page.getByLabel(/current password/i).fill(creds.password);
    await page.getByLabel(/^new password$/i).fill("BetterPass456!");
    await page.getByLabel(/confirm new password/i).fill("BetterPass456!");
    await page.getByRole("button", { name: /^cancel$/i }).click();

    await expect(
      page.getByRole("heading", { name: /change password/i }),
    ).not.toBeVisible();

    await logout(page);
    await openLoginModal(page);
    await page.fill("#username", creds.email);
    await page.fill("#password", creds.password);
    await page.getByRole("button", { name: /^submit$/i }).click();
    await expect(page.getByText(creds.username).first()).toBeVisible();
  });
});
