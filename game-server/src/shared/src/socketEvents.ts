import { BoardState, Color, Move, Games } from "./gameTypes.js";

export type GameStartData = {
  gameId: string;
  color: Color;
  board: BoardState;
};

export type result = "win" | "lose" | "draw";

// shared/socketEvents.ts
export interface CToSEvents {
  find_match: (type: Games) => void;

  move: (data: { gameId: string; move: Move }) => void;

  resign: (gameId: string) => void;
}

export interface SToCEvents {
  game_start: (data: {
    gameId: string;
    color: Color;
    type: Games;
    boardState: BoardState;
  }) => void;

  move_made: (data: { boardState: BoardState }) => void;

  game_over: (data: { result: result; reason: string }) => void;
}
