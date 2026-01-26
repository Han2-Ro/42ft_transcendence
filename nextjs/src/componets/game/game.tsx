import { useState } from "react";

export default function Game({ gameData, onPlayerMove, onPlayerResign}) {
  const [selectedSquare, setSelectedSquare] = useState(null);

  const handleSquareClick = (square) => {
    if (!selectedSquare) {
      setSelectedSquare(square);
      return;
    }

    const move = {
	  gameId: gameData.id,
      from: selectedSquare,
      to: square,
    };

    setSelectedSquare(null);
    onPlayerMove(move);
  };

  const squares = ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"]; // sketch

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Game in progress</h2>
      <p>You are playing as {gameData.color}</p>

      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        {squares.map((sq) => (
          <button
            key={sq}
            onClick={() => handleSquareClick(sq)}
            style={{
              width: 50,
              height: 50,
              background: selectedSquare === sq ? "#ccc" : "#eee",
            }}
          >
            {sq}
          </button>
        ))}
      </div>
	    <button
        onClick={onPlayerResign(gameData.id)}
        style={{
          padding: "10px 20px",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        Resign
      </button>
    </div>
  );
}