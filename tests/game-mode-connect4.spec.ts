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

async function startConnect4Match(pages: Page[]) {
  await Promise.all(
    pages.map((page) =>
      page.getByRole("button", { name: /🟡🔴\s*connect\s*4/i }).click(),
    ),
  );
}

async function startTimedConnect4Match(pages: Page[]) {
  await Promise.all(
    pages.map((page) =>
      page.getByRole("button", { name: /⏳\s*connect\s*4\s*\(10 min\)/i }).click(),
    ),
  );
}

async function expectConnect4BoardVisible(pages: Page[]) {
  await Promise.all(
    pages.map(async (page) => {
      await expect(page.getByTestId("player-card-self")).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByTestId("player-card-opponent")).toBeVisible();
      await expect(
        page.getByRole("button", { name: /drop chip in column 1/i }).first(),
      ).toBeVisible();
    }),
  );
}

async function resolvePlayerPages(page1: Page, page2: Page) {
  const page1Color = await page1
    .getByTestId("player-card-self")
    .getAttribute("data-player-color");
  const page2Color = await page2
    .getByTestId("player-card-self")
    .getAttribute("data-player-color");

  const page1IsYellow = page1Color === "yellow";
  const page2IsYellow = page2Color === "yellow";

  expect(page1IsYellow || page2IsYellow).toBeTruthy();
  expect(page1IsYellow && page2IsYellow).toBeFalsy();

  return page1IsYellow
    ? { yellowPage: page1, redPage: page2 }
    : { yellowPage: page2, redPage: page1 };
}

async function expectSelfTurn(page: Page, expected: boolean) {
  await expect(page.getByTestId("player-card-self")).toHaveAttribute(
    "data-is-turn",
    expected ? "true" : "false",
  );
}

async function dropChip(page: Page, column: number) {
  await page
    .getByRole("button", { name: new RegExp(`drop chip in column ${column}`, "i") })
    .first()
    .click();
}

function chipLocator(page: Page, color: "yellow" | "red") {
  return page.locator(color === "yellow" ? "div.bg-yellow-400" : "div.bg-red-600");
}

async function expectChipCountOnBoth(
  pages: Page[],
  color: "yellow" | "red",
  expectedCount: number,
) {
  await Promise.all(
    pages.map((page) => expect(chipLocator(page, color)).toHaveCount(expectedCount)),
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

test.describe.serial("connect4 game mode", () => {
  test("I1 — connect4 matchmaking starts game for both players", async ({
    browser,
  }) => {
    const { contexts, pages } = await createPlayers(browser, 2);

    try {
      await startConnect4Match(pages);
      await expectConnect4BoardVisible(pages);
    } finally {
      await closeAll(contexts);
    }
  });

  test("I2 — connect4 turn enforcement and move synchronization", async ({
    browser,
  }) => {
    const { contexts, pages } = await createPlayers(browser, 2);
    const [page1, page2] = pages;

    try {
      await startConnect4Match(pages);
      await expectConnect4BoardVisible(pages);

      const { yellowPage, redPage } = await resolvePlayerPages(page1, page2);

      await expectSelfTurn(yellowPage, true);
      await expectSelfTurn(redPage, false);

      await dropChip(yellowPage, 1);

      await expectChipCountOnBoth(pages, "yellow", 1);
      await expectChipCountOnBoth(pages, "red", 0);
      await expectSelfTurn(yellowPage, false);
      await expectSelfTurn(redPage, true);

      await dropChip(yellowPage, 2);
      await expectChipCountOnBoth(pages, "yellow", 1);
      await expectChipCountOnBoth(pages, "red", 0);

      await dropChip(redPage, 2);
      await expectChipCountOnBoth(pages, "yellow", 1);
      await expectChipCountOnBoth(pages, "red", 1);
      await expectSelfTurn(yellowPage, true);
      await expectSelfTurn(redPage, false);
    } finally {
      await closeAll(contexts);
    }
  });

  test("I3 — connect4 normal win lifecycle", async ({ browser }) => {
    const { contexts, pages } = await createPlayers(browser, 2);
    const [page1, page2] = pages;

    try {
      await startConnect4Match(pages);
      await expectConnect4BoardVisible(pages);

      const { yellowPage, redPage } = await resolvePlayerPages(page1, page2);

      await dropChip(yellowPage, 1);
      await dropChip(redPage, 2);
      await dropChip(yellowPage, 1);
      await dropChip(redPage, 2);
      await dropChip(yellowPage, 1);
      await dropChip(redPage, 2);
      await dropChip(yellowPage, 1);

      await Promise.all([
        expect(yellowPage.getByText(/result:\s*win/i)).toBeVisible(),
        expect(yellowPage.getByText(/reason:\s*connect 4/i)).toBeVisible(),
        expect(redPage.getByText(/result:\s*lose/i)).toBeVisible(),
        expect(redPage.getByText(/reason:\s*connect 4/i)).toBeVisible(),
      ]);

      await expectChipCountOnBoth(pages, "yellow", 4);
      await expectChipCountOnBoth(pages, "red", 3);

      await dropChip(redPage, 3);
      await expectChipCountOnBoth(pages, "yellow", 4);
      await expectChipCountOnBoth(pages, "red", 3);
    } finally {
      await closeAll(contexts);
    }
  });

  test("I4 — timed connect4 ends by timeout", async ({ browser }) => {
    test.setTimeout(120_000);
    const { contexts, pages } = await createPlayers(browser, 2);
    const [page1, page2] = pages;

    try {
      await startTimedConnect4Match(pages);
      await expectConnect4BoardVisible(pages);

      const initialSeconds = await readFirstClockSeconds(page1);
      test.skip(
        initialSeconds > 30,
        `Timed mode too long for E2E run (${initialSeconds}s). Set GAME_TIMED_MODE_SECONDS <= 30.`,
      );

      await expectTimeoutEnd(pages);

      const { yellowPage, redPage } = await resolvePlayerPages(page1, page2);
      await Promise.all([
        expect(yellowPage.getByText(/result:\s*lose/i)).toBeVisible(),
        expect(redPage.getByText(/result:\s*win/i)).toBeVisible(),
      ]);
    } finally {
      await closeAll(contexts);
    }
  });
});
