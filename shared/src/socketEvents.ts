import { BoardState, PlayerColor, Move, Games } from "./gameTypes";

export type GameStartData = {
  gameId: string;
  color: PlayerColor;
  board: BoardState;
};

export type Result = "win" | "lose" | "draw";

// shared/socketEvents.ts
export interface CToSEvents {
  findMatch: (type: Games) => void;

  move: (data: { gameId: string; move: Move }) => void;

  resign: (gameId: string) => void;
}

export interface SToCEvents {
  gameStart: (data: {
    gameId: string;
    color: PlayerColor;
    type: Games;
    boardState: BoardState;
  }) => void;

  moveMade: (data: { boardState: BoardState }) => void;

  gameOver: (data: { result: Result; reason: string }) => void;
}
