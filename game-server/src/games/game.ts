import { GameStartData } from "../../../shared/src/socketEvents.js";
import { BoardState, Color, Move } from "../../../shared/src/gameTypes.js";

export type GameType = "chess" | "TimedChess"

export abstract class Game {
  abstract playMove(move: Move, color : Color): boolean;
  abstract GetBoardState() : BoardState
  abstract GetTurn() : Color
}