import { expect, BrowserContext, Page } from "@playwright/test";
import { test } from "./base-test";
import { clickMenuAction, registerAndLogin } from "./utils";

async function createPlayers(
  browser: import("@playwright/test").Browser,
  count: number,
) {
  const contexts = await Promise.all(
    Array.from({ length: count }, () => browser.newContext()),
  );
  const pages = await Promise.all(contexts.map((ctx) => ctx.newPage()));

  await Promise.all(
    pages.map(async (page) => {
      await registerAndLogin(page);
      await page.goto("/game");
      await expect(page.getByRole("heading", { name: /chess lobby/i })).toBeVisible();
    }),
  );

  return { contexts, pages };
}

async function closeAll(contexts: BrowserContext[]) {
  await Promise.all(contexts.map((ctx) => ctx.close().catch(() => {})));
}

async function expectInGame(page: Page) {
  await expect(page.getByTestId("player-card-self")).toBeVisible({ timeout: 20_000 });
}

async function expect4pInGame(page: Page) {
  await expect(page.getByText(/RED/i).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/BLUE/i).first()).toBeVisible();
  await expect(page.getByText(/YELLOW/i).first()).toBeVisible();
  await expect(page.getByText(/GREEN/i).first()).toBeVisible();
}

async function expectLobbySearching(page: Page) {
  await expect(page.getByRole("heading", { name: /chess lobby/i })).toBeVisible();
  await expect(page.getByText(/searching game lobby/i)).toBeVisible();
}

async function closeEndScreen(page: Page) {
  await page.getByRole("button", { name: /close/i }).click();
  await expect(page.getByRole("heading", { name: /chess lobby/i })).toBeVisible();
}

test.describe.serial("matchmaking robustness", () => {
  test("F1 — queue isolation by game mode (A waits while B matches)", async ({
    browser,
  }) => {
    const { contexts, pages } = await createPlayers(browser, 3);
    const [userA, userB, userC] = pages;

    try {
      await userA.getByRole("button", { name: /\bchess\b$/i }).click();

      await Promise.all([
        userB.getByRole("button", { name: /🟡🔴\s*connect/i }).click(),
        userC.getByRole("button", { name: /🟡🔴\s*connect/i }).click(),
      ]);

      await Promise.all([expectInGame(userB), expectInGame(userC)]);

      await expectLobbySearching(userA);
      await expect(userA.getByTestId("player-card-self")).toHaveCount(0);
    } finally {
      await closeAll(contexts);
    }
  });

  test("F2 — one user can search multiple game modes at once", async ({
    browser,
  }) => {
    const { contexts, pages } = await createPlayers(browser, 4);
    const [user1, user2, user3, user4] = pages;

    try {
      await user1.getByRole("button", { name: /^♟️\s*chess:\s*4 players$/i }).click();
      await user1
        .getByRole("button", { name: /\bchess:\s*4 players \(10 min\)/i })
        .click();

      await Promise.all([
        user2
          .getByRole("button", { name: /\bchess:\s*4 players \(10 min\)/i })
          .click(),
        user3
          .getByRole("button", { name: /\bchess:\s*4 players \(10 min\)/i })
          .click(),
        user4
          .getByRole("button", { name: /\bchess:\s*4 players \(10 min\)/i })
          .click(),
      ]);

      await Promise.all([
        expect4pInGame(user1),
        expect4pInGame(user2),
        expect4pInGame(user3),
        expect4pInGame(user4),
      ]);
    } finally {
      await closeAll(contexts);
    }
  });

  test("F3 — matching one selected mode clears other queued modes", async ({
    browser,
  }) => {
    const { contexts, pages } = await createPlayers(browser, 2);
    const [user1, user2] = pages;

    try {
      await user1.getByRole("button", { name: /^♟️\s*chess:\s*4 players$/i }).click();
      await user1.getByRole("button", { name: /🟡🔴\s*connect/i }).click();
      await user2.getByRole("button", { name: /🟡🔴\s*connect/i }).click();

      await Promise.all([expectInGame(user1), expectInGame(user2)]);

      await clickMenuAction(user2, /resign/i);

      await Promise.all([
        expect(user1.getByText(/result:\s*(win|lose)/i)).toBeVisible(),
        expect(user2.getByText(/result:\s*(win|lose)/i)).toBeVisible(),
      ]);

      await Promise.all([closeEndScreen(user1), closeEndScreen(user2)]);

      await expect(user1.getByText(/ready when you are/i)).toBeVisible();
      await expect(user1.getByText(/searching game lobby/i)).toHaveCount(0);
      await expect(user1.getByRole("heading", { name: /chess lobby/i })).toBeVisible();
    } finally {
      await closeAll(contexts);
    }
  });

  test("F4 — toggling same mode cancels matchmaking", async ({ browser }) => {
    const { contexts, pages } = await createPlayers(browser, 1);
    const [page] = pages;

    try {
      const timed4pButton = page.getByRole("button", {
        name: /\bchess:\s*4 players \(10 min\)/i,
      });

      await timed4pButton.click();
      await expectLobbySearching(page);

      await page.getByRole("button", { name: /finding game/i }).first().click();

      await expect(page.getByText(/searching game lobby/i)).toHaveCount(0);
      await expect(page.getByText(/ready when you are/i)).toBeVisible();
      await expect(page.getByRole("heading", { name: /chess lobby/i })).toBeVisible();
    } finally {
      await closeAll(contexts);
    }
  });

  test("F5 — queue consumption under contention leaves extra player searching", async ({
    browser,
  }) => {
    const { contexts, pages } = await createPlayers(browser, 3);
    const [user1, user2, user3] = pages;

    try {
      await Promise.all([
        user1
          .getByRole("button", { name: /⏳\s*connect\s*4\s*\(10 min\)/i })
          .click(),
        user2
          .getByRole("button", { name: /⏳\s*connect\s*4\s*\(10 min\)/i })
          .click(),
      ]);

      await Promise.all([expectInGame(user1), expectInGame(user2)]);

      await user3
        .getByRole("button", { name: /⏳\s*connect\s*4\s*\(10 min\)/i })
        .click();

      await expectLobbySearching(user3);
      await expect(user3.getByTestId("player-card-self")).toHaveCount(0);
    } finally {
      await closeAll(contexts);
    }
  });
});
