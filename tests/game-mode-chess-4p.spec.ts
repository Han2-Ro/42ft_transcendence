import { expect, BrowserContext, Page } from "@playwright/test";
import { test } from "./base-test";
import { registerAndLogin } from "./utils";

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
    }),
  );

  return { contexts, pages };
}

async function closeAll(contexts: BrowserContext[]) {
  await Promise.all(contexts.map((ctx) => ctx.close().catch(() => {})));
}

async function startMatch(pages: Page[], buttonName: RegExp) {
  await Promise.all(
    pages.map((page) => page.getByRole("button", { name: buttonName }).click()),
  );
}

async function expect4pBoardVisible(pages: Page[]) {
  await Promise.all(
    pages.map(async (page) => {
      await expect(page.getByText(/RED/i).first()).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByText(/BLUE/i).first()).toBeVisible();
      await expect(page.getByText(/YELLOW/i).first()).toBeVisible();
      await expect(page.getByText(/GREEN/i).first()).toBeVisible();
    }),
  );
}

async function readFirstClockSeconds(page: Page): Promise<number> {
  const clock = page.getByText(/^\d{2}:\d{2}$/).first();
  await expect(clock).toBeVisible();
  const raw = (await clock.textContent())?.trim() ?? "00:00";
  const [mm, ss] = raw.split(":").map((v) => Number(v));
  if (!Number.isFinite(mm) || !Number.isFinite(ss)) return 0;
  return mm * 60 + ss;
}

async function expectTimeoutEnd(pages: Page[], timeout = 30_000) {
  await Promise.all(
    pages.map((page) =>
      expect(page.getByText(/reason:\s*timeout/i)).toBeVisible({ timeout }),
    ),
  );
}

test.describe.serial("chess 4-player modes", () => {
  test("D1 — 4-player chess matchmaking starts game for all players", async ({
    browser,
  }) => {
    const { contexts, pages } = await createPlayers(browser, 4);

    try {
      await startMatch(pages, /^♟️\s*chess:\s*4 players$/i);
      await expect4pBoardVisible(pages);
    } finally {
      await closeAll(contexts);
    }
  });

  test("D5 — timed 4-player chess ends by timeout", async ({ browser }) => {
    test.setTimeout(150_000);
    const { contexts, pages } = await createPlayers(browser, 4);

    try {
      await startMatch(pages, /\bchess:\s*4 players \(10 min\)/i);
      await expect4pBoardVisible(pages);

      const initialSeconds = await readFirstClockSeconds(pages[0]);
      test.skip(
        initialSeconds > 30,
        `Timed mode too long for E2E run (${initialSeconds}s). Set GAME_TIMED_MODE_SECONDS <= 30.`,
      );

      await expectTimeoutEnd(pages, 45_000);
    } finally {
      await closeAll(contexts);
    }
  });

  test("D6 — active game ends correctly when a client disconnects", async ({
    browser,
  }) => {
    test.setTimeout(120_000);
    const { contexts, pages } = await createPlayers(browser, 4);

    try {
      await startMatch(pages, /^♟️\s*chess:\s*4 players$/i);
      await expect4pBoardVisible(pages);

      await contexts[0].close();

      await Promise.all(
        pages.slice(1).map((page) =>
          expect(page.getByText(/reason:\s*disconnect/i)).toBeVisible({
            timeout: 30_000,
          }),
        ),
      );
    } finally {
      await closeAll(contexts.slice(1));
    }
  });
});
