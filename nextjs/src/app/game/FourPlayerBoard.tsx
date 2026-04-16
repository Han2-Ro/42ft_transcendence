import { useEffect, useState } from "react";

import {
  fourPlayer,
  Move,
  BoardState,
  PlayerColor,
  PromotablePieceType,
} from "shared";
import Image from "next/image";
import { PromotionDialog } from "./PromotionDialog";

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

export default function FourPlayerBoard({
  boardState,
  onPlayerMove,
  playerColor,
  times,
}: {
  boardState: BoardState;
  onPlayerMove: (move: Move) => void;
  playerColor: PlayerColor;
  times: number[];
}) {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [movesFromSquareInt, setMovesFromSquareInt] = useState<number[] | null>(
    null,
  );
  const [movesFromSquare, setMovesFromSquare] = useState<Move[] | null>(null);
  const [pendingPromotionMove, setPendingPromotionMove] = useState<Move | null>(
    null,
  );

  const handleSquareClick = (square: number) => {
    if (pendingPromotionMove) return;
    if (selectedSquare === null) {
      setSelectedSquare(square);
      const moves = fourPlayer.generateMoves(boardState.board, square);
      const movesNumbers = moves.map((move) => move.to);
      setMovesFromSquare(moves);
      setMovesFromSquareInt(movesNumbers);
      return;
    }

    if (!movesFromSquareInt || !movesFromSquare) return;
    const index = movesFromSquareInt.indexOf(square);
    if (index == -1) {
      setSelectedSquare(null);
      setMovesFromSquareInt(null);
      setMovesFromSquare(null);
      return;
    }
    const move: Move = { ...movesFromSquare[index] };
    setSelectedSquare(null);
    setMovesFromSquareInt(null);
    setMovesFromSquare(null);
    if (move.special === "promotion") {
      setPendingPromotionMove(move);
      return;
    }
    onPlayerMove(move);
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

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.round(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col justify-center items-center h-full gap-4">
      {times[0] !== -1 && (
        <div className="text-lg font-semibold">
          <div>
            Times: red: {formatTime(times[0])}, blue: {formatTime(times[1])},
            yellow: {formatTime(times[2])}, green: {formatTime(times[3])}
          </div>
        </div>
      )}
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
      <PromotionDialog
        open={pendingPromotionMove !== null}
        onClose={handlePromotionClose}
        onSelect={handlePromotionSelect}
      />
    </div>
  );
}
