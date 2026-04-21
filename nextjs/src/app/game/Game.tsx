import { BoardState, PlayerColor, Move, Games } from "shared";
import TwoPlayerBoard from "./TwoPlayerBoard";
import FourPlayerBoard from "./FourPlayerBoard";

interface GameProps {
  boardState: BoardState;
  gameType: Games;
  color: PlayerColor;
  times: number[];
  onPlayerMove: (move: Move) => void;
  isInGame: boolean;
}

export default function Game({
  boardState,
  gameType,
  color,
  onPlayerMove,
  times,
  isInGame,
}: GameProps) {
  return (
    <div className="text-center flex flex-col justify-center">
      {gameType === "chess" || gameType === "timedChess" ? (
        <TwoPlayerBoard
          boardState={boardState}
          onPlayerMove={onPlayerMove}
          playerColor={color}
          times={times}
          isInGame={isInGame}
        />
      ) : (
        <FourPlayerBoard
          boardState={boardState}
          onPlayerMove={onPlayerMove}
          playerColor={color}
          times={times}
        />
      )}
    </div>
  );
}
