import { BoardState, PlayerColor, Move, Games, BoardStateChess, BoardStateCon4 } from "shared";
import TwoPlayerBoard from "./TwoPlayerBoard";
import FourPlayerBoard from "./FourPlayerBoard";
import ConnectFourBoard from "./ConnectFourBoard";

interface GameProps {
  boardState: BoardState;
  gameType: Games;
  color: PlayerColor;
  times: number[];
  onPlayerMove: (move: Move) => void;
}

function isBoardChess(boardState: BoardState): boardState is BoardStateChess {
  return (boardState as BoardStateChess).movesPlayed !== undefined;
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
      {(gameType === "chess" || gameType === "timedChess") && isBoardChess(boardState) ? (
        <TwoPlayerBoard
          boardState={boardState as BoardStateChess}
          onPlayerMove={onPlayerMove}
          playerColor={color}
          times={times}
        />
      ) : (gameType === "4pChess" || gameType === "4pTimedChess") && isBoardChess(boardState) ? (
        <FourPlayerBoard
          boardState={boardState as BoardStateChess}
          onPlayerMove={onPlayerMove}
          playerColor={color}
          times={times}
        />
      ) : (
        <ConnectFourBoard
          boardState={boardState as BoardStateCon4}
          onPlayerMove={onPlayerMove}
          playerColor={color}
          times={times}
        />
      )}
      <p className="mt-4">You are playing as {color}</p>
    </div>
  );
}
