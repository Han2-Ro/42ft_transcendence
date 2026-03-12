import { BoardState, PlayerColor, Move, GameStatus } from "shared";

export type GameType = "chess" | "TimedChess";

export abstract class Game {
  abstract boardState: BoardState;
  abstract gameStatus: GameStatus;

  abstract playMove(move: Move, played_by: PlayerColor): boolean;
  abstract playResign(played_by: PlayerColor): void;
  abstract timeout(player: PlayerColor): void;
}
