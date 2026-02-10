import { useEffect, useState } from "react";
import { Move, PieceOrNull } from "shared";
import {generateMovesNumber} from "shared";

export default function Board({board, onPlayerMove}) {
const [selectedSquare, setSelectedSquare] = useState(null);
const [movesFromSqare, setMovesFromSqare] = useState(null);

const handleSquareClick = (square : number) => {
	
	if (selectedSquare === null) {
	  setSelectedSquare(square);
	  let moves = generateMovesNumber(board.board, square)
	  setMovesFromSqare(moves)
	  return;
	}

    const move : Move = {
      from: selectedSquare,
      to: square,
    };

    setSelectedSquare(null)
	setMovesFromSqare(null)
    onPlayerMove(move);
  };

  useEffect(() => {
  console.log("State updated:", movesFromSqare);
}, [movesFromSqare]);

  return (
	<div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
		<div style={{ display: "grid", gridTemplateColumns: "repeat(8, 100px)"}}>
			{board.board.map((sq : PieceOrNull, index : number) => (
		<button
		key={index}
		onClick={() => handleSquareClick(index)}
		style={{
		  width: 100,
		  height: 100, 
		  background: (index + Math.floor(index / 8)) % 2 === 1 ? selectedSquare === index ? "#4b4b4bff" : "#202020ff" : selectedSquare === index ? "#aaaaaaff" : "#eee",
		  position: "relative",
			}}
		>
			{sq && <img src={`/chess/${sq.color}/${sq.type}.svg`} alt={sq.color + sq.type} style={{ width: "100%", height: "100%" }} />}
			{movesFromSqare && movesFromSqare.length > 0 && movesFromSqare.includes(index) && <img src={`/chess/circle.svg`} alt={"Position that the selected Piece can move to."} style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }} />}
		</button>
	  ))}
		</div>
	</div>
  );

}