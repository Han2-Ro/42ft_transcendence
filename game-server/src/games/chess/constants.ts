import { Board, BoardState } from "../../shared/index.js";

export const startingBoard: Board = [
  { color: "black", type: "rook", hasMoved: false },
  { color: "black", type: "knight", hasMoved: false },
  { color: "black", type: "bishop", hasMoved: false },
  { color: "black", type: "queen", hasMoved: false },
  { color: "black", type: "king", hasMoved: false },
  { color: "black", type: "bishop", hasMoved: false },
  { color: "black", type: "knight", hasMoved: false },
  { color: "black", type: "rook", hasMoved: false },
  ...Array.from({ length: 8 }, () => ({
    color: "black",
    type: "pawn",
    hasMoved: false,
  })),
  ...Array(32).fill(null),
  ...Array.from({ length: 8 }, () => ({
    color: "white",
    type: "pawn",
    hasMoved: false,
  })),
  { color: "white", type: "rook", hasMoved: false },
  { color: "white", type: "knight", hasMoved: false },
  { color: "white", type: "bishop", hasMoved: false },
  { color: "white", type: "queen", hasMoved: false },
  { color: "white", type: "king", hasMoved: false },
  { color: "white", type: "bishop", hasMoved: false },
  { color: "white", type: "knight", hasMoved: false },
  { color: "white", type: "rook", hasMoved: false },
];

export const startingBoardState: BoardState = {
  board: startingBoard,
  turn: "white",
  movesPlayed: 0,
};
