import { BoardState, PlayerColor, Move, Games } from "shared";
import TwoPlayerBoard from "./twoPlayerBoard";
import FourPlayerBoard from "./fourPlayerBoard";

interface GameProps {
  boardState: BoardState;
  gameType: Games
  color: PlayerColor;
  onPlayerMove: (move: Move) => void;
  onPlayerResign: () => void;
}

export default function Game({
  boardState,
  gameType,
  color,
  onPlayerMove,
  onPlayerResign,
}: GameProps) {
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Game in progress</h2>
     {gameType === "chess" || gameType === "timedChess" ? (
        <TwoPlayerBoard boardState={boardState} onPlayerMove={onPlayerMove} />
      ) : (
        <FourPlayerBoard boardState={boardState} onPlayerMove={onPlayerMove} />
      )}
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
