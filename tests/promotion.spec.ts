import { test, expect, Page } from "@playwright/test";
import { registerAndLogin } from "./utils";

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

test("promotion requires explicit selection and uses chosen piece", async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const contexts = await Promise.all([
    browser.newContext(),
    browser.newContext(),
  ]);
  const [page1, page2] = await Promise.all(
    contexts.map((ctx) => ctx.newPage()),
  );

  try {
    await registerAndLogin(page1);
    await registerAndLogin(page2);

    await Promise.all([page1.goto("/game"), page2.goto("/game")]);

    await Promise.all(
      [page1, page2].map((page) =>
        page
          .getByRole("button", { name: /find chess match \(10 minutes\)/i })
          .click(),
      ),
    );
    await Promise.all([
      expect(page1.getByTestId("player-card-self")).toBeVisible(),
      expect(page2.getByTestId("player-card-self")).toBeVisible(),
    ]);
    const { whitePage, blackPage } = await resolvePlayerPages(page1, page2);

    // Force a fast cooperative line into promotion:
    // 1. a2-a4, ...h7-h6
    // 2. a4-a5, ...h6-h5
    // 3. a5-a6, ...g7-g6
    // 4. a6xb7, ...g6-g5
    // 5. b7xa8=?
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

    // Ensure no automatic fallback (e.g. auto-queen) happens without user choice.
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
    await Promise.all(contexts.map((ctx) => ctx.close().catch(() => {})));
  }
});
