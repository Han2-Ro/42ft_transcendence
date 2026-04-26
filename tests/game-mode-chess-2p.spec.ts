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
    }),
  );

  return { contexts, pages };
}

async function closeAll(contexts: BrowserContext[]) {
  await Promise.all(contexts.map((ctx) => ctx.close().catch(() => {})));
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

async function board(page: Page) {
  const chessBoard = page
    .locator('div[class*="grid-rows-8"][class*="grid-cols-8"]')
    .first();
  await expect(chessBoard).toBeVisible();
  return chessBoard;
}

async function move(page: Page, from: number, to: number) {
  const chessBoard = await board(page);
  const fromSquare = chessBoard.locator("button").nth(from);
  const toSquare = chessBoard.locator("button").nth(to);
  await fromSquare.evaluate((el) => (el as HTMLElement).click());
  await expect(
    toSquare.getByAltText(/position that the selected piece can move to\./i),
  ).toBeVisible();
  await toSquare.evaluate((el) => (el as HTMLElement).click());
}

async function moveApplied(
  page: Page,
  from: number,
  to: number,
  pieceAlt: string,
  timeout = 10_000,
) {
  const chessBoard = await board(page);
  await expect(
    chessBoard.locator("button").nth(from).locator("img"),
  ).toHaveCount(0, {
    timeout,
  });
  await expect(
    chessBoard.locator("button").nth(to).locator("img"),
  ).toHaveAttribute("alt", pieceAlt, { timeout });
}

async function pieceAltAt(page: Page, square: number): Promise<string | null> {
  const chessBoard = await board(page);
  const alts = await chessBoard
    .locator("button")
    .nth(square)
    .locator("img")
    .evaluateAll((els) => els.map((el) => el.getAttribute("alt")));
  return alts[0] ?? null;
}

async function selfColorFromPlayerCardNames(page: Page) {
  const names = await page
    .locator("text=/^(White|Black) Player$/")
    .allTextContents();
  const selfName = names[1]?.toLowerCase();
  if (selfName?.includes("white")) return "white";
  if (selfName?.includes("black")) return "black";
  return null;
}

async function resolvePlayerPages(page1: Page, page2: Page) {
  const page1SelfCard = page1.getByTestId("player-card-self");
  const page2SelfCard = page2.getByTestId("player-card-self");

  const hasCardHooks =
    (await page1SelfCard.count()) > 0 && (await page2SelfCard.count()) > 0;

  if (hasCardHooks) {
    const page1Color = await page1SelfCard.getAttribute("data-player-color");
    const page2Color = await page2SelfCard.getAttribute("data-player-color");

    const page1IsWhite = page1Color === "white";
    const page2IsWhite = page2Color === "white";

    expect(page1IsWhite || page2IsWhite).toBeTruthy();
    expect(page1IsWhite && page2IsWhite).toBeFalsy();

    return page1IsWhite
      ? { whitePage: page1, blackPage: page2 }
      : { whitePage: page2, blackPage: page1 };
  }

  const page1Color = await selfColorFromPlayerCardNames(page1);
  const page2Color = await selfColorFromPlayerCardNames(page2);

  const page1IsWhite = page1Color === "white";
  const page2IsWhite = page2Color === "white";

  expect(page1IsWhite || page2IsWhite).toBeTruthy();
  expect(page1IsWhite && page2IsWhite).toBeFalsy();

  return page1IsWhite
    ? { whitePage: page1, blackPage: page2 }
    : { whitePage: page2, blackPage: page1 };
}

async function expectTurn(page: Page, expectedTurn: "white" | "black") {
  const selfCard = page.getByTestId("player-card-self");
  const opponentCard = page.getByTestId("player-card-opponent");

  const hasCardHooks =
    (await selfCard.count()) > 0 && (await opponentCard.count()) > 0;
  if (!hasCardHooks) return;

  const selfColor = await selfCard.getAttribute("data-player-color");
  expect(selfColor === "white" || selfColor === "black").toBeTruthy();

  const isSelfTurn = selfColor === expectedTurn;
  await expect(selfCard).toHaveAttribute(
    "data-is-turn",
    isSelfTurn ? "true" : "false",
  );
  await expect(opponentCard).toHaveAttribute(
    "data-is-turn",
    isSelfTurn ? "false" : "true",
  );
}

test.describe.serial("chess 2-player modes", () => {
  test("find match and resign", async ({ browser }) => {
    const { contexts, pages } = await createPlayers(browser, 2);
    const [page1, page2] = pages;

    try {
      await Promise.all(
        [page1, page2].map((page) =>
          page.getByRole("button", { name: /\bchess\b$/i }).click(),
        ),
      );

      await Promise.all([
        expect(page1.getByText(/WHITE/i).first()).toBeVisible({
          timeout: 15_000,
        }),
        expect(page1.getByText(/BLACK/i).first()).toBeVisible({
          timeout: 15_000,
        }),
        expect(page2.getByText(/WHITE/i).first()).toBeVisible({
          timeout: 15_000,
        }),
        expect(page2.getByText(/BLACK/i).first()).toBeVisible({
          timeout: 15_000,
        }),
      ]);

      await clickMenuAction(page1, /resign/i);
      await Promise.all([
        expect(page1.getByText(/Result: lose/i)).toBeVisible(),
        expect(page1.getByText(/Reason: Resignation/i)).toBeVisible(),
        expect(page2.getByText(/Result: win/i)).toBeVisible(),
        expect(page2.getByText(/Reason: Resignation/i)).toBeVisible(),
      ]);

      await Promise.all(
        [page1, page2].map(async (page) => {
          const closeButton = await page.getByRole("button", {
            name: /close/i,
          });
          await closeButton.click();
          await expect(
            page.getByRole("heading", { name: /Chess Lobby/i }),
          ).toBeVisible();
        }),
      );
    } finally {
      await closeAll(contexts);
    }
  });

  test("promotion requires explicit selection and uses chosen piece", async ({
    browser,
  }) => {
    test.setTimeout(120_000);
    const { contexts, pages } = await createPlayers(browser, 2);
    const [page1, page2] = pages;

    try {
      await Promise.all(
        [page1, page2].map((page) =>
          page.getByRole("button", { name: /\bchess \(10 min\)/i }).click(),
        ),
      );
      await Promise.all([
        expect(page1.getByTestId("player-card-self")).toBeVisible(),
        expect(page2.getByTestId("player-card-self")).toBeVisible(),
      ]);
      const { whitePage, blackPage } = await resolvePlayerPages(page1, page2);

      await expectTurn(whitePage, "white");
      await move(whitePage, 48, 32);
      await Promise.all([
        moveApplied(whitePage, 48, 32, "white pawn"),
        moveApplied(blackPage, 48, 32, "white pawn"),
      ]);
      await expectTurn(blackPage, "black");
      await move(blackPage, 15, 23);
      await Promise.all([
        moveApplied(whitePage, 15, 23, "black pawn"),
        moveApplied(blackPage, 15, 23, "black pawn"),
      ]);
      await expectTurn(whitePage, "white");
      await move(whitePage, 32, 24);
      await Promise.all([
        moveApplied(whitePage, 32, 24, "white pawn"),
        moveApplied(blackPage, 32, 24, "white pawn"),
      ]);
      await expectTurn(blackPage, "black");
      await move(blackPage, 23, 31);
      await Promise.all([
        moveApplied(whitePage, 23, 31, "black pawn"),
        moveApplied(blackPage, 23, 31, "black pawn"),
      ]);
      await expectTurn(whitePage, "white");
      await move(whitePage, 24, 16);
      await Promise.all([
        moveApplied(whitePage, 24, 16, "white pawn"),
        moveApplied(blackPage, 24, 16, "white pawn"),
      ]);
      await expectTurn(blackPage, "black");
      await move(blackPage, 14, 22);
      await Promise.all([
        moveApplied(whitePage, 14, 22, "black pawn"),
        moveApplied(blackPage, 14, 22, "black pawn"),
      ]);
      await expectTurn(whitePage, "white");
      await move(whitePage, 16, 9);
      await Promise.all([
        moveApplied(whitePage, 16, 9, "white pawn"),
        moveApplied(blackPage, 16, 9, "white pawn"),
      ]);
      await expectTurn(blackPage, "black");
      await move(blackPage, 22, 30);
      await Promise.all([
        moveApplied(whitePage, 22, 30, "black pawn"),
        moveApplied(blackPage, 22, 30, "black pawn"),
      ]);
      await expectTurn(whitePage, "white");
      const promoteToKnight = whitePage.getByRole("button", {
        name: /promote to knight/i,
      });
      await expect(await pieceAltAt(whitePage, 9)).toBe("white pawn");
      await expect(await pieceAltAt(whitePage, 0)).toBe("black rook");
      const whiteBoard = await board(whitePage);
      await whiteBoard
        .locator("button")
        .nth(9)
        .evaluate((el) => (el as HTMLElement).click());
      await whiteBoard
        .locator("button")
        .nth(0)
        .evaluate((el) => (el as HTMLElement).click());
      await expect(promoteToKnight).toBeVisible();

      await expect(
        whiteBoard.locator("button").nth(0).locator("img"),
      ).toHaveAttribute("alt", "black rook");
      await expect(
        whiteBoard.locator("button").nth(9).locator("img"),
      ).toHaveAttribute("alt", "white pawn");

      await expect(promoteToKnight).toBeVisible();

      await promoteToKnight.click();

      await expect(promoteToKnight).toBeHidden();

      await expect(
        whiteBoard.locator("button").nth(0).locator("img"),
      ).toHaveAttribute("alt", "white knight");
      await expect(
        whiteBoard.locator("button").nth(0).locator("img"),
      ).not.toHaveAttribute("alt", "white queen");
      await expect(
        whiteBoard.locator("button").nth(9).locator("img"),
      ).toHaveCount(0);

      const blackBoard = await board(blackPage);
      await expect(
        blackBoard.locator("button").nth(0).locator("img"),
      ).toHaveAttribute("alt", "white knight");
    } finally {
      await closeAll(contexts);
    }
  });

  test("D4 — timed 2-player chess ends by timeout", async ({ browser }) => {
    test.setTimeout(120_000);
    const { contexts, pages } = await createPlayers(browser, 2);

    try {
      await Promise.all(
        pages.map((page) =>
          page.getByRole("button", { name: /\bchess \(10 min\)/i }).click(),
        ),
      );
      await Promise.all(
        pages.map((page) =>
          expect(page.getByTestId("player-card-self")).toBeVisible(),
        ),
      );

      const initialSeconds = await readFirstClockSeconds(pages[0]);
      test.skip(
        initialSeconds > 30,
        `Timed mode too long for E2E run (${initialSeconds}s). Set GAME_TIMED_MODE_SECONDS <= 30.`,
      );

      await expectTimeoutEnd(pages);
    } finally {
      await closeAll(contexts);
    }
  });
});
