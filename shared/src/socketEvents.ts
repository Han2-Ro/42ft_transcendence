import { BoardState, PlayerColor, Move, Games } from "./gameTypes";

export type GameStartData = {
  gameId: string;
  color: PlayerColor;
  board: BoardState;
};

export type Result = "win" | "lose" | "draw";

export type Reason = "checkmate" | "resignation" | "timeout";

// shared/socketEvents.ts
export interface CToSEvents {
  findMatchToggle: (type: Games) => void;

  move: (data: { gameId: string; move: Move }) => void;

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
    playerIDs: number[];
  }) => void;

  setSearching: (type: Games[]) => void;

  moveMade: (data: { boardState: BoardState; times: number[] }) => void;

  gameOver: (data: { result: Result; reason: string }) => void;
}
