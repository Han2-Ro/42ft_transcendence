export default function Lobby({ onFindMatchPressed }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "50px",
      }}
    >
      <h1>Chess Lobby</h1>

      <button
        onClick={() => onFindMatchPressed("chess")}
        style={{
          padding: "10px 20px",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        Find chess Match
      </button>
      <button
        onClick={() => onFindMatchPressed("4pChess")}
        style={{
          padding: "10px 20px",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        Find 4 player Chess Match
      </button>
    </div>
  );
}
