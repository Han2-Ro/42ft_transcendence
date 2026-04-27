import { useEffect, useState } from "react";

import {
  fourPlayer,
  Move,
  PlayerColor,
  PromotablePieceType,
  BoardStateChess,
  MoveChess,
} from "shared";
import Image from "next/image";
import { PromotionDialog } from "./PromotionDialog";
import { PlayerCard } from "./PlayerCard";
import { useGameClock } from "./useGameClock";

const boardRotation: Record<string, string> = {
  red: "",
  yellow: "rotate-180",
  blue: "-rotate-90",
  green: "rotate-90",
};

const pieceRotation: Record<string, string> = {
  red: "",
  yellow: "rotate-180",
  blue: "rotate-90",
  green: "-rotate-90",
};

const cornerAssignments: Record<
  "red" | "blue" | "yellow" | "green",
  {
    topLeft: PlayerColor;
    topRight: PlayerColor;
    bottomLeft: PlayerColor;
    bottomRight: PlayerColor;
  }
> = {
  red: {
    topLeft: "yellow",
    topRight: "green",
    bottomLeft: "blue",
    bottomRight: "red",
  },
  blue: {
    topLeft: "green",
    topRight: "red",
    bottomLeft: "yellow",
    bottomRight: "blue",
  },
  yellow: {
    topLeft: "red",
    topRight: "blue",
    bottomLeft: "green",
    bottomRight: "yellow",
  },
  green: {
    topLeft: "blue",
    topRight: "yellow",
    bottomLeft: "red",
    bottomRight: "green",
  },
};

export default function FourPlayerBoard({
  boardState,
  onPlayerMove,
  playerColor,
  times,
  isInGame = true,
  usernames,
}: {
  boardState: BoardStateChess;
  onPlayerMove: (move: MoveChess) => void;
  playerColor: PlayerColor;
  times: Record<PlayerColor, number> | null;
  isInGame?: boolean;
  usernames?: Partial<Record<PlayerColor, string>>;
}) {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [movesFromSquareInt, setMovesFromSquareInt] = useState<number[] | null>(
    null,
  );
  const [movesFromSquare, setMovesFromSquare] = useState<MoveChess[] | null>(
    null,
  );
  const [pendingPromotionMove, setPendingPromotionMove] =
    useState<MoveChess | null>(null);

  const handleSquareClick = (square: number) => {
    if (pendingPromotionMove) return;

    // Check if there is a move to make (the player clicked on a square in movesFromSqaureInt)
    if (movesFromSquare && movesFromSquareInt) {
      const index = movesFromSquareInt.indexOf(square);
      if (index >= 0) {
        const move: Move = { ...movesFromSquare[index] };
        setSelectedSquare(null);
        setMovesFromSquareInt(null);
        setMovesFromSquare(null);
        if (move.special === "promotion") {
          setPendingPromotionMove({ ...move, special: "promotion" });
          return;
        }
        onPlayerMove(move);
        return;
      }
    }

    // If selectedSquare is clicked again, unselect it
    if (square == selectedSquare) {
      setSelectedSquare(null);
      setMovesFromSquareInt(null);
      setMovesFromSquare(null);
      return;
    }

    // Otherwise select new square
    setSelectedSquare(square);
    const moves = fourPlayer.generateMoves(boardState.board, square);
    const movesNumbers = moves.map((move) => move.to);
    setMovesFromSquare(moves);
    setMovesFromSquareInt(movesNumbers);
    return;
  };

  const handlePromotionSelect = (promotion: PromotablePieceType) => {
    if (!pendingPromotionMove) return;
    onPlayerMove({ ...pendingPromotionMove, promotion });
    setPendingPromotionMove(null);
  };

  const handlePromotionClose = () => {
    setPendingPromotionMove(null);
  };

  useEffect(() => {}, [movesFromSquareInt]);

  //const activePlayerIndex = colorToIndex[ boardState.turn as keyof typeof colorToIndex] ?? 0;
  const { getDisplayTime } = useGameClock(times, boardState.turn, isInGame);

  return (
    <div className="flex flex-col justify-center items-center h-full gap-4">
      <div className="relative">
        <div
          className={`w-[min(100vw,50vh)] h-[min(100vw,50vh)] md:w-[min(50vw,70vh)] md:h-[min(50vw,70vh)] grid grid-rows-14 grid-cols-14 ${boardRotation[playerColor]}`}
        >
          {Array.from({ length: 196 }).map((_, visualIndex) => {
            const row = Math.floor(visualIndex / 14);
            const col = visualIndex % 14;
            const isTop = row < 3;
            const isBottom = row > 10;
            const isLeft = col < 3;
            const isRight = col > 10;
            const isInvalid =
              (isTop && isLeft) ||
              (isTop && isRight) ||
              (isBottom && isLeft) ||
              (isBottom && isRight);
            if (isInvalid) {
              return <div key={visualIndex + 200} />;
            }
            let index = -1;
            if (row < 3) {
              index = row * 8 + (col - 3);
            } else if (row < 11) {
              index = 3 * 8 + (row - 3) * 14 + col;
            } else {
              index = 3 * 8 + 8 * 14 + (row - 11) * 8 + (col - 3);
            }
            const sq = boardState.board[index];
            return (
              <button
                key={index}
                onClick={() => handleSquareClick(index)}
                disabled={pendingPromotionMove !== null}
                className="relative"
                style={{
                  background:
                    (row + col) % 2 === 1
                      ? selectedSquare === index
                        ? "#4b4b4bff"
                        : "#202020ff"
                      : selectedSquare === index
                        ? "#aaaaaaff"
                        : "#eee",
                }}
              >
                {sq && (
                  <Image
                    width="45"
                    height="45"
                    src={`/chess/${sq.color}/${sq.type}.svg`}
                    alt={sq.color + sq.type}
                    className={`w-full h-full ${pieceRotation[playerColor]}`}
                  />
                )}
                {movesFromSquareInt &&
                  movesFromSquareInt.length > 0 &&
                  movesFromSquareInt.includes(index) && (
                    <Image
                      width="45"
                      height="45"
                      src={`/chess/circle.svg`}
                      alt={"Position that the selected Piece can move to."}
                      className="w-full h-full absolute top-0 left-0"
                    />
                  )}
              </button>
            );
          })}
        </div>
        <div className="absolute inset-0 pointer-events-none">
          {(() => {
            const assignments =
              cornerAssignments[
                playerColor as "red" | "blue" | "yellow" | "green"
              ];
            const margin = "0.35rem";
            const size = "calc(100% * 3 / 14 - 0.7rem)";
            return (
              <>
                <div
                  className="absolute flex items-center justify-center pointer-events-auto"
                  style={{
                    top: margin,
                    left: margin,
                    width: size,
                    height: size,
                  }}
                >
                  <PlayerCard
                    name={
                      usernames?.[assignments.topLeft] ??
                      `${assignments.topLeft} Player`
                    }
                    color={assignments.topLeft}
                    isTurn={boardState.turn === assignments.topLeft}
                    time={getDisplayTime(assignments.topLeft) ?? undefined}
                    isTimed={times !== null}
                  />
                </div>
                <div
                  className="absolute flex items-center justify-center pointer-events-auto"
                  style={{
                    top: margin,
                    right: margin,
                    width: size,
                    height: size,
                  }}
                >
                  <PlayerCard
                    name={
                      usernames?.[assignments.topRight] ??
                      `${assignments.topRight} Player`
                    }
                    color={assignments.topRight}
                    isTurn={boardState.turn === assignments.topRight}
                    time={getDisplayTime(assignments.topRight) ?? undefined}
                    isTimed={times !== null}
                  />
                </div>
                <div
                  className="absolute flex items-center justify-center pointer-events-auto"
                  style={{
                    bottom: margin,
                    left: margin,
                    width: size,
                    height: size,
                  }}
                >
                  <PlayerCard
                    name={
                      usernames?.[assignments.bottomLeft] ??
                      `${assignments.bottomLeft} Player`
                    }
                    color={assignments.bottomLeft}
                    isTurn={boardState.turn === assignments.bottomLeft}
                    time={getDisplayTime(assignments.bottomLeft) ?? undefined}
                    isTimed={times !== null}
                  />
                </div>
                <div
                  className="absolute flex items-center justify-center pointer-events-auto"
                  style={{
                    bottom: margin,
                    right: margin,
                    width: size,
                    height: size,
                  }}
                >
                  <PlayerCard
                    name={
                      usernames?.[assignments.bottomRight] ??
                      `${assignments.bottomRight} Player`
                    }
                    color={assignments.bottomRight}
                    isTurn={boardState.turn === assignments.bottomRight}
                    isYou={true}
                    time={getDisplayTime(assignments.bottomRight) ?? undefined}
                    isTimed={times !== null}
                  />
                </div>
              </>
            );
          })()}
        </div>
      </div>
      <PromotionDialog
        open={pendingPromotionMove !== null}
        onClose={handlePromotionClose}
        onSelect={handlePromotionSelect}
      />
    </div>
  );
}
