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

  uid: (uid: string) => void; //Todo: This should send whatever key is necessary to validate this user exists in our database
  resign: (gameId: string) => void;

  dropCheck: () => void;
}

export interface SToCEvents {
  gameStart: (data: {
    gameId: string;
    color: PlayerColor;
    type: Games;
    boardState: BoardState;
    times: number[];
  }) => void;

  moveMade: (data: { boardState: BoardState; times: number[] }) => void;

  gameOver: (data: { result: Result; reason: string }) => void;

  dropCheck: () => void;
}
