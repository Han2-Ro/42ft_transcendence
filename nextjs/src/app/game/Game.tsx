import { BoardState, PlayerColor, Move, Games } from "shared";
import TwoPlayerBoard from "./TwoPlayerBoard";
import FourPlayerBoard from "./FourPlayerBoard";

interface GameProps {
  boardState: BoardState;
  gameType: Games;
  color: PlayerColor;
  times: number[];
  onPlayerMove: (move: Move) => void;
}

export default function Game({
  boardState,
  gameType,
  color,
  onPlayerMove,
  times,
}: GameProps) {
  return (
    <div className="text-center flex flex-col justify-center">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Game in progress</h2>
      </div>
      {gameType === "chess" || gameType === "timedChess" ? (
        <TwoPlayerBoard
          boardState={boardState}
          onPlayerMove={onPlayerMove}
          playerColor={color}
          times={times}
        />
      ) : (
        <FourPlayerBoard
          boardState={boardState}
          onPlayerMove={onPlayerMove}
          playerColor={color}
          times={times}
        />
      )}
      <p className="mt-4">You are playing as {color}</p>
    </div>
  );
}
