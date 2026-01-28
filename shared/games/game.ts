import { GameStartData } from "../socketEvents.js";
import { BoardState, Color, Move } from "./chess/types.js";

export type GameType = "chess" | "TimedChess"

export abstract class Game {
  abstract playMove(move: Move, color : Color): boolean;
  abstract GetBoardState() : BoardState
  abstract GetTurn() : Color
}