import { BoardState, PlayerColor, Move, Games } from "shared";
import TwoPlayerBoard from "./twoPlayerBoard";
import FourPlayerBoard from "./fourPlayerBoard";

interface GameProps {
  boardState: BoardState;
  gameType: Games;
  color: PlayerColor;
  onPlayerMove: (move: Move) => void;
}

export default function Game({
  boardState,
  gameType,
  color,
  onPlayerMove,
}: GameProps) {
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Game in progress</h2>
      {gameType === "chess" || gameType === "timedChess" ? (
        <TwoPlayerBoard boardState={boardState} onPlayerMove={onPlayerMove} playerColor={color}/>
      ) : (
        <FourPlayerBoard boardState={boardState} onPlayerMove={onPlayerMove} playerColor={color}/>
      )}
      <p>You are playing as {color}</p>
    </div>
  );
}
