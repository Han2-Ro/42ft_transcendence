export type Color = "white" | "black" | "red" | "green" | "yellow" | "blue";

export type Games =  "chess" | "timedChess" | "4pChess" | "4pTimedChess"

export type PieceType =
  | "pawn"
  | "rook"
  | "knight"
  | "bishop"
  | "queen"
  | "king";

type Piece = {
  color: Color;
  type: PieceType;
  hasMoved: boolean;
};

export type Pos2 = {
  x: number;
  y: number;
};

export type GameStatus = {
  isOver: boolean;
  winner: Color | null;
  reason: string;
};

export type PieceOrNull = Piece | null;

export type Board = PieceOrNull[];

export type BoardState = {
  board: Board;
  turn: Color;
  movesPlayed: number;
};

export type Move = {
  from: number;
  to: number;
  special: "0-0-0" | "0-0" | "promotion" | null;
  promotion?: PieceType;
};
