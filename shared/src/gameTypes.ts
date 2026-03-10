export type PlayerColor = "white" | "black";
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
  winner: PlayerColor | null;
  reason: string;
};

export type PieceOrNull = Piece | null;

type File = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
type Rank = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
export type Square = `${File}${Rank}`;

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
