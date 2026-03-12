import { useEffect, useState } from "react";

import { fourPlayer, Move, BoardState } from "shared";
import Image from "next/image";

export default function FourPlayerBoard({
  boardState,
  onPlayerMove,
}: {
  boardState: BoardState;
  onPlayerMove: (move: Move) => void;
}) {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [movesFromSqareInt, setMovesFromSqareInt] = useState<number[] | null>(
    null,
  );
  const [movesFromSqare, setMovesFromSqare] = useState<Move[] | null>(null);

  const handleSquareClick = (square: number) => {
    if (selectedSquare === null) {
      setSelectedSquare(square);
      const moves = fourPlayer.generateMoves(boardState.board, square);
      const moves_numbers = moves.map((move) => move.to);
      setMovesFromSqare(moves);
      setMovesFromSqareInt(moves_numbers);
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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(14, 50px)" }}>
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
            return <div key={visualIndex + 200} />; // empty placeholder
          }

          let index = -1;
          if (row < 3) {
            // top section
            index = row * 8 + (col - 3);
          } else if (row < 11) {
            // middle section
            index = 3 * 8 + (row - 3) * 14 + col;
          } else {
            // bottom section
            index = 3 * 8 + 8 * 14 + (row - 11) * 8 + (col - 3);
          }
          const sq = boardState.board[index];

          return (
            <button
              key={index}
              onClick={() => handleSquareClick(index)}
              style={{
                width: 50,
                height: 50,
                background:
                  (row + col) % 2 === 1
                    ? selectedSquare === index
                      ? "#4b4b4bff"
                      : "#202020ff"
                    : selectedSquare === index
                      ? "#aaaaaaff"
                      : "#eee",
                position: "relative",
              }}
            >
              {sq && (
                <Image
                  width="45"
                  height="45"
                  src={`/chess/${sq.color}/${sq.type}.svg`}
                  alt={sq.color + sq.type}
                  style={{ width: "100%", height: "100%" }}
                />
              )}
              {movesFromSqareInt &&
                movesFromSqareInt.length > 0 &&
                movesFromSqareInt.includes(index) && (
                  <Image
                    width="45"
                    height="45"
                    src={`/chess/circle.svg`}
                    alt={"Position that the selected Piece can move to."}
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  />
                )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
