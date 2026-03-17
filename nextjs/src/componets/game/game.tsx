import { BoardState, PlayerColor, Move } from "shared";
import Board from "./board";

interface GameProps {
  boardState: BoardState;
  color: PlayerColor;
  onPlayerMove: (move: Move) => void;
}

export default function Game({ boardState, color, onPlayerMove }: GameProps) {
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Game in progress</h2>
      <Board boardState={boardState} onPlayerMove={onPlayerMove}></Board>
      <p>You are playing as {color}</p>
    </div>
  );
}
