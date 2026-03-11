export type PlayerColor = "white" | "black" | "red" | "green" | "yellow" | "blue";

export type Games = "chess" | "timedChess" | "4pChess" | "4pTimedChess";
export type PieceType =
  | "pawn"
  | "rook"
  | "knight"
  | "bishop"
  | "queen"
  | "king";

type Piece = {
  color: PlayerColor;
  type: PieceType;
  hasMoved: boolean;
};

export type Pos2 = {
  x: number;
  y: number;
};

export type GameStatus = {
  isOver: boolean;
  winners: PlayerColor[] | null;
  reason: string;
};

export type PieceOrNull = Piece | null;

export type Board = PieceOrNull[];

export type BoardState = {
  board: Board;
  turn: PlayerColor;
  movesPlayed: number;
};

export type Move = {
  from: number;
  to: number;
  special: "0-0-0" | "0-0" | "promotion" | null;
  promotion?: PieceType;
};
