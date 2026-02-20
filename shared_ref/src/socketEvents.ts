import { BoardState, Color, Move } from "./gameTypes";

export type GameStartData = {
  gameId: string;
  color: Color;
  board: BoardState;
};

export type result = "win" | "lose" | "draw";

// shared/socketEvents.ts
export interface CToSEvents {
  find_match: () => void;

  move: (data: { gameId: string; move: Move }) => void;

  resign: (gameId: string) => void;
}

export interface SToCEvents {
  game_start: (data: {
    gameId: string;
    color: Color;
    board: BoardState;
  }) => void;

  move_made: (data: { board: BoardState }) => void;

  game_over: (data: { result: result; reason: string }) => void;
}
