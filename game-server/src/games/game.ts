import { GameStartData } from "shared/dist/src/socketEvents.js";
import { BoardState, Color, Move } from "shared/dist/src/gameTypes.js";

export type GameType = "chess" | "TimedChess"

export abstract class Game {
  abstract playMove(move: Move, color : Color): boolean;
  abstract GetBoardState() : BoardState
  abstract GetTurn() : Color
}