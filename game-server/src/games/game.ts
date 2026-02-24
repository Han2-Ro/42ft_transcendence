import { BoardState, Color, Move, GameStatus } from "../shared/index.js";

//export type GameType = "chess" | "TimedChess";

export abstract class Game {
  abstract playMove(move: Move, played_by: Color): boolean;
  abstract playResign(played_by: Color): void;
  abstract GetBoardState(): BoardState;
  abstract GetTurn(): Color;
  abstract GetGameStatus(): GameStatus;
}
