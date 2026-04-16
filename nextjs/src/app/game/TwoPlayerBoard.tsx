import { useState } from "react";
import {
  twoPlayer,
  Move,
  PieceOrNull,
  BoardState,
  PlayerColor,
  PromotablePieceType,
} from "shared";
import Image from "next/image";
import { PromotionDialog } from "./PromotionDialog";

export default function TwoPlayerBoard({
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
  const [movesFromSqareInt, setMovesFromSqareInt] = useState<number[] | null>(
    null,
  );
  const [movesFromSqare, setMovesFromSqare] = useState<Move[] | null>(null);
  const [pendingPromotionMove, setPendingPromotionMove] = useState<Move | null>(
    null,
  );

  const isPawnPromotionTarget = (move: Move): boolean => {
    const piece = boardState.board[move.from];
    if (!piece || piece.type !== "pawn") return false;
    const targetRank = Math.floor(move.to / 8);
    return (
      (piece.color === "white" && targetRank === 0) ||
      (piece.color === "black" && targetRank === 7)
    );
  };

  const handleSquareClick = (square: number) => {
    if (pendingPromotionMove) return;
    if (selectedSquare === null) {
      setSelectedSquare(square);
      const moves = twoPlayer.generateMoves(boardState.board, square, boardState.enPassantSqare);
      const movesNumbers = moves.map((move) => move.to);
      setMovesFromSqare(moves);
      setMovesFromSqareInt(movesNumbers);
      return;
    }

    if (!movesFromSqareInt || !movesFromSqare) return;
    const index = movesFromSqareInt.indexOf(square);
    if (index == -1) {
      setSelectedSquare(null);
      setMovesFromSqareInt(null);
      setMovesFromSqare(null);
      return;
    }
    const move: Move = { ...movesFromSqare[index] };
    setSelectedSquare(null);
    setMovesFromSqareInt(null);
    setMovesFromSqare(null);
    if (move.special === "promotion" || isPawnPromotionTarget(move)) {
      setPendingPromotionMove({ ...move, special: "promotion" });
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
            Times: white: {formatTime(times[0])}, black: {formatTime(times[1])}
          </div>
        </div>
      )}
      <div
        className={`w-[min(100vw,50vh)] h-[min(100vw,50vh)] md:w-[min(50vw,70vh)] md:h-[min(50vw,70vh)] grid grid-rows-8 grid-cols-8 ${playerColor === "black" ? "rotate-180" : ""}`}
      >
        {boardState.board.map((sq: PieceOrNull, index: number) => (
          <button
            key={index}
            onClick={() => handleSquareClick(index)}
            disabled={pendingPromotionMove !== null}
            className="relative"
            style={{
              background:
                (index + Math.floor(index / 8)) % 2 === 1
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
                className={`w-full h-full ${playerColor === "black" ? "rotate-180" : ""}`}
              />
            )}
            {movesFromSqareInt &&
              movesFromSqareInt.length > 0 &&
              movesFromSqareInt.includes(index) && (
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
      <PromotionDialog
        open={pendingPromotionMove !== null}
        onClose={handlePromotionClose}
        onSelect={handlePromotionSelect}
      />
    </div>
  );
}
