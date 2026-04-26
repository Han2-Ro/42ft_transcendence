import { useState } from "react";
import {
  twoPlayer,
  Move,
  PieceOrNull,
  BoardState,
  PlayerColor,
  PromotablePieceType,
  BoardStateChess,
  MoveChess,
} from "shared";

import Image from "next/image";
import { PromotionDialog } from "./PromotionDialog";
import { PlayerCard } from "./PlayerCard";
import { useGameClock } from "./useGameClock";

export default function TwoPlayerBoard({
  boardState,
  onPlayerMove,
  playerColor,
  times,
  isInGame = true,
  usernames,
}: {
  boardState: BoardStateChess;
  onPlayerMove: (move: Move) => void;
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
    const moves = twoPlayer.generateMoves(
      boardState.board,
      square,
      boardState.enPassantSquare,
    );
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

  const { getDisplayTime } = useGameClock(times, boardState.turn, isInGame);

  return (
    <div className="flex items-center flex-col md:flex-row justify-center gap-4">
      <div className={`${playerColor === "black" ? "rotate-180" : ""}`}>
        <div className="w-[min(100vw,50vh)] h-[min(100vw,50vh)] md:w-[min(50vw,70vh)] md:h-[min(50vw,70vh)] grid grid-rows-8 grid-cols-8">
          {boardState.board.map((sq: PieceOrNull, index: number) => (
            <button
              key={index}
              onClick={() => handleSquareClick(index)}
              disabled={pendingPromotionMove !== null}
              className={`relative ${index === selectedSquare ? "inset-ring-4 inset-ring-accent-primary" : ""}`}
              style={{
                background:
                  (index + Math.floor(index / 8)) % 2 === 1 ? "#656" : "#fff",
              }}
            >
              {sq && (
                <Image
                  width="45"
                  height="45"
                  src={`/chess/${sq.color}/${sq.type}.svg`}
                  alt={sq.color + " " + sq.type}
                  className={`size-full ${playerColor === "black" ? "rotate-180" : ""} ${index === selectedSquare ? "scale-110" : ""}`}
                />
              )}
              {movesFromSquareInt &&
                movesFromSquareInt.length > 0 &&
                movesFromSquareInt.includes(index) && (
                  <Image
                    width="100"
                    height="100"
                    src={`/chess/circle.svg`}
                    alt={"Position that the selected Piece can move to."}
                    className="w-full h-full absolute top-0 left-0"
                  />
                )}
            </button>
          ))}
        </div>
      </div>
      {isInGame && (
        <div className="flex md:w-auto w-full p-4 flex-row md:flex-col gap-4">
          <PlayerCard
            testId="player-card-opponent"
            name={
              usernames?.[playerColor === "white" ? "black" : "white"] ??
              (playerColor === "white" ? "Black Player" : "White Player")
            }
            color={playerColor === "white" ? "black" : "white"}
            isTurn={boardState.turn != playerColor}
            time={
              getDisplayTime(playerColor === "white" ? "black" : "white") ??
              undefined
            }
            isTimed={times !== null}
          />
          <PlayerCard
            testId="player-card-self"
            name={
              usernames?.[playerColor] ??
              (playerColor === "white" ? "White Player" : "Black Player")
            }
            color={playerColor}
            isTurn={boardState.turn === playerColor}
            time={getDisplayTime(playerColor) ?? undefined}
            isTimed={times !== null}
          />
        </div>
      )}
      <PromotionDialog
        open={pendingPromotionMove !== null}
        onClose={handlePromotionClose}
        onSelect={handlePromotionSelect}
      />
    </div>
  );
}
