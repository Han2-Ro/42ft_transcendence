import TwoPlayerBoard from "./TwoPlayerBoard";
import FourPlayerBoard from "./FourPlayerBoard";
import { Games } from "../../shared";

export default function Game({
  boardState,
  gameType,
  color,
  onPlayerMove,
  onPlayerResign,
}) {
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
