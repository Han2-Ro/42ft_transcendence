import { useEffect, useState } from "react";
import { generateMoves, Move, PieceOrNull } from "../../shared";
import Image from "next/image";

export default function TwoPlayerBoard({ boardState, onPlayerMove }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [movesFromSqareInt, setMovesFromSqareInt] = useState(null);
  const [movesFromSqare, setMovesFromSqare] = useState(null);

  const handleSquareClick = (square: number) => {
    if (selectedSquare === null) {
      setSelectedSquare(square);
      const moves = generateMoves(boardState.board, square);
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 100px)" }}>
        {boardState.board.map((sq: PieceOrNull, index: number) => (
          <button
            key={index}
            onClick={() => handleSquareClick(index)}
            style={{
              width: 100,
              height: 100,
              background:
                (index + Math.floor(index / 8)) % 2 === 1
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
                src={`/chess/${sq.color}/${sq.type}.svg`}
                alt={sq.color + sq.type}
                style={{ width: "100%", height: "100%" }}
              />
            )}
            {movesFromSqareInt &&
              movesFromSqareInt.length > 0 &&
              movesFromSqareInt.includes(index) && (
                <Image
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
        ))}
      </div>
    </div>
  );
}
