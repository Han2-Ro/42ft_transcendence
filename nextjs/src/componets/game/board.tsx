import { useState } from "react";
import { Move } from "../../../../shared/gameTypes";
import { GameStartData } from "../../../../shared/socketEvents";

export default function Board({board, onPlayerMove}) {
const [selectedSquare, setSelectedSquare] = useState(null);

const handleSquareClick = (square) => {
    if (!selectedSquare) {
      setSelectedSquare(square);
      return;
    }

    const move : Move = {
      from: selectedSquare,
      to: square,
    };

    setSelectedSquare(null);
    onPlayerMove(move);
  };

  return (
	<div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
		<div style={{ display: "grid", gridTemplateColumns: "repeat(8, 100px)"}}>
			{board.board.map((sq, index) => (
		<button
		key={index}
		onClick={() => handleSquareClick(index)}
		style={{
		  width: 100,
		  height: 100, 
			  background: (index + Math.floor(index / 8)) % 2 === 1 ? selectedSquare === index ? "#4b4b4bff" : "#202020ff" : selectedSquare === index ? "#aaaaaaff" : "#eee", 
			}}
		>
			{sq && <img src={`/chess/${sq.color}/${sq.type}.svg`} alt={sq.color + sq.type} style={{ width: "100%", height: "100%" }} />}
		</button>
	  ))}
		</div>
	</div>
  );

}