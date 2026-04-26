import {
  BoardState,
  PlayerColor,
  Move,
  Games,
  BoardStateChess,
  BoardStateCon4,
} from "shared";
import TwoPlayerBoard from "./TwoPlayerBoard";
import FourPlayerBoard from "./FourPlayerBoard";
import ConnectFourBoard from "./ConnectFourBoard";

interface GameProps {
  boardState: BoardState;
  gameType: Games;
  color: PlayerColor;
  times: Record<PlayerColor, number> | null;
  onPlayerMove: (move: Move) => void;
  isInGame: boolean;
  usernames?: Partial<Record<PlayerColor, string>>;
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
  isInGame,
  usernames,
}: GameProps) {
  return (
    <div className="text-center flex flex-col justify-center">
      {(gameType === "chess" || gameType === "timedChess") &&
      isBoardChess(boardState) ? (
        <TwoPlayerBoard
          boardState={boardState as BoardStateChess}
          onPlayerMove={onPlayerMove}
          playerColor={color}
          times={times}
          isInGame={isInGame}
          usernames={usernames}
        />
      ) : (gameType === "4pChess" || gameType === "4pTimedChess") &&
        isBoardChess(boardState) ? (
        <FourPlayerBoard
          boardState={boardState as BoardStateChess}
          onPlayerMove={onPlayerMove}
          playerColor={color}
          times={times}
          isInGame={isInGame}
          usernames={usernames}
        />
      ) : (
        <ConnectFourBoard
          boardState={boardState as BoardStateCon4}
          onPlayerMove={onPlayerMove}
          playerColor={color}
          times={times}
          isInGame={isInGame}
          usernames={usernames}
        />
      )}
    </div>
  );
}
