import { BoardState, PlayerColor, Move } from "shared";
import Board from "./board";

interface GameProps {
  boardState: BoardState;
  color: PlayerColor;
  onPlayerMove: (move: Move) => void;
  onPlayerResign: () => void;
}

export default function Game({
  boardState,
  color,
  onPlayerMove,
  onPlayerResign,
}: GameProps) {
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Game in progress</h2>
      <Board boardState={boardState} onPlayerMove={onPlayerMove}></Board>
      <p>You are playing as {color}</p>
      <button
        onClick={onPlayerResign}
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
