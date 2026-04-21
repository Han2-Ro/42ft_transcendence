export type PlayerColor =
  | "white"
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue";

export type Games =
  | "chess"
  | "timedChess"
  | "4pChess"
  | "4pTimedChess"
  | "connect4"
  | "timedConnect4";
export type PieceType =
  | "pawn"
  | "rook"
  | "knight"
  | "bishop"
  | "queen"
  | "king";
export type PromotablePieceType = "queen" | "rook" | "bishop" | "knight";

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

export type BoardStateChess = {
  board: Board;
  turn: PlayerColor;
  movesPlayed: number;
  enPassantSquare: number | null;
};

export type PlayerColorCon4 = "red" | "yellow";

export type Square = PlayerColorCon4 | "empty";

export type BoardCon4 = Square[];

export type BoardStateCon4 = {
  board: BoardCon4;
  turn: PlayerColorCon4;
};

export type MoveChess = {
  from: number;
  to: number;
  special: "0-0-0" | "0-0" | "promotion" | "double_move" | "en_passant" | null;
  promotion?: PromotablePieceType;
};

export type MoveCon4 = number;
export type Move = MoveChess | MoveCon4;
export type BoardState = BoardStateCon4 | BoardStateChess;
