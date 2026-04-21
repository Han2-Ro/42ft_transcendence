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

export default function TwoPlayerBoard({
  boardState,
  onPlayerMove,
  playerColor,
  times,
  isInGame = true,
}: {
  boardState: BoardStateChess;
  onPlayerMove: (move: Move) => void;
  playerColor: PlayerColor;
  times: number[];
  isInGame?: boolean;
}) {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [movesFromSquareInt, setMovesFromSquareInt] = useState<number[] | null>(
    null,
  );
  const [movesFromSquare, setMovesFromSquare] = useState<MoveChess[] | null>(null);
  const [pendingPromotionMove, setPendingPromotionMove] = useState<MoveChess | null>(
    null,
  );

  const isPawnPromotionTarget = (move: MoveChess): boolean => {
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
      const moves = twoPlayer.generateMoves(
        boardState.board,
        square,
        boardState.enPassantSquare,
      );
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
    <div className="flex items-center justify-center gap-4">
      <div className={`${playerColor === "black" ? "rotate-180" : ""}`}>
        <div className="w-[min(100vw,50vh)] h-[min(100vw,50vh)] md:w-[min(50vw,70vh)] md:h-[min(50vw,70vh)] grid grid-rows-8 grid-cols-8">
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
        <div className="flex flex-col gap-4">
          <PlayerCard
            name={playerColor === "white" ? "Black Player" : "White Player"}
            color={playerColor === "white" ? "black" : "white"}
            isTurn={
              boardState.turn === (playerColor === "white" ? "black" : "white")
            }
            time={times[playerColor === "white" ? 1 : 0]}
            isTimed={times[playerColor === "white" ? 1 : 0] !== -1}
          />
          <PlayerCard
            name={playerColor === "white" ? "White Player" : "Black Player"}
            color={playerColor}
            isTurn={boardState.turn === playerColor}
            time={times[playerColor === "white" ? 0 : 1]}
            isTimed={times[playerColor === "white" ? 0 : 1] !== -1}
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
