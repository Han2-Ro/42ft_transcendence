import { useEffect, useState } from "react";
import { twoPlayer, Move, PieceOrNull, BoardState, PlayerColor } from "shared";
import Image from "next/image";

export default function TwoPlayerBoard({
  boardState,
  onPlayerMove,
  playerColor,
}: {
  boardState: BoardState;
  onPlayerMove: (move: Move) => void;
  playerColor: PlayerColor;
}) {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [movesFromSqareInt, setMovesFromSqareInt] = useState<number[] | null>(
    null,
  );
  const [movesFromSqare, setMovesFromSqare] = useState<Move[] | null>(null);

  const handleSquareClick = (square: number) => {
    if (selectedSquare === null) {
      setSelectedSquare(square);
      const moves = twoPlayer.generateMoves(boardState.board, square);
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
    //todo: make some kind of ui element, that makes player choose which piece to promote to
    if (move.special == "promotion") move.promotion = "queen";
    setSelectedSquare(null);
    setMovesFromSqareInt(null);
    setMovesFromSqare(null);
    onPlayerMove(move);
  };

  useEffect(() => {}, [movesFromSqareInt]);

  return (
    <div className="flex justify-center items-center h-full">
      <div
        className={`w-[min(100vw,50vh)] h-[min(100vw,50vh)] md:w-[min(50vw,70vh)] md:h-[min(50vw,70vh)] grid grid-rows-8 grid-cols-8 ${playerColor === 'black' ? "rotate-180" : ""}`}
      >
        {boardState.board.map((sq: PieceOrNull, index: number) => (
          <button
            key={index}
            onClick={() => handleSquareClick(index)}
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
    </div>
  );
}
