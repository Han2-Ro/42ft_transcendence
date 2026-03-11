import { BoardState, PlayerColor, Move, Games } from "./gameTypes";

export type GameStartData = {
  gameId: string;
  color: PlayerColor;
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
    color: PlayerColor;
    type: Games;
    boardState: BoardState;
  }) => void;

  move_made: (data: { boardState: BoardState }) => void;

  game_over: (data: { result: result; reason: string }) => void;
}
