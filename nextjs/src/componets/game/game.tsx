import Board from "./board";

export default function Game({
  boardState,
  color,
  onPlayerMove,
  onPlayerResign,
}) {
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
