import { Board, BoardState } from "shared";

export const startingBoard: Board = [
  //row 1
  { color: "yellow", type: "rook", hasMoved: false },
  { color: "yellow", type: "knight", hasMoved: false },
  { color: "yellow", type: "bishop", hasMoved: false },
  { color: "yellow", type: "king", hasMoved: false },
  { color: "yellow", type: "queen", hasMoved: false },
  { color: "yellow", type: "bishop", hasMoved: false },
  { color: "yellow", type: "knight", hasMoved: false },
  { color: "yellow", type: "rook", hasMoved: false },
  //row 2
  ...Array.from({ length: 8 }, () => ({
    color: "yellow",
    type: "pawn",
    hasMoved: false,
  })),
  //row 3
  ...Array(8).fill(null),
  //row 4
  { color: "blue", type: "rook", hasMoved: false },
  { color: "blue", type: "pawn", hasMoved: false },
  ...Array(10).fill(null),
  { color: "green", type: "pawn", hasMoved: false },
  { color: "green", type: "rook", hasMoved: false },
  //row 5
  { color: "blue", type: "knight", hasMoved: false },
  { color: "blue", type: "pawn", hasMoved: false },
  ...Array(10).fill(null),
  { color: "green", type: "pawn", hasMoved: false },
  { color: "green", type: "knight", hasMoved: false },
  //row 6
  { color: "blue", type: "bishop", hasMoved: false },
  { color: "blue", type: "pawn", hasMoved: false },
  ...Array(10).fill(null),
  { color: "green", type: "pawn", hasMoved: false },
  { color: "green", type: "bishop", hasMoved: false },
  //row 7
  { color: "blue", type: "king", hasMoved: false },
  { color: "blue", type: "pawn", hasMoved: false },
  ...Array(10).fill(null),
  { color: "green", type: "pawn", hasMoved: false },
  { color: "green", type: "queen", hasMoved: false },
  //row 8
  { color: "blue", type: "queen", hasMoved: false },
  { color: "blue", type: "pawn", hasMoved: false },
  ...Array(10).fill(null),
  { color: "green", type: "pawn", hasMoved: false },
  { color: "green", type: "king", hasMoved: false },
  //row 9
  { color: "blue", type: "bishop", hasMoved: false },
  { color: "blue", type: "pawn", hasMoved: false },
  ...Array(10).fill(null),
  { color: "green", type: "pawn", hasMoved: false },
  { color: "green", type: "bishop", hasMoved: false },
  //row 10
  { color: "blue", type: "knight", hasMoved: false },
  { color: "blue", type: "pawn", hasMoved: false },
  ...Array(10).fill(null),
  { color: "green", type: "pawn", hasMoved: false },
  { color: "green", type: "knight", hasMoved: false },
  //row 11
  { color: "blue", type: "rook", hasMoved: false },
  { color: "blue", type: "pawn", hasMoved: false },
  ...Array(10).fill(null),
  { color: "green", type: "pawn", hasMoved: false },
  { color: "green", type: "rook", hasMoved: false },
  //row 12
  ...Array(8).fill(null),
  //row 13
  ...Array.from({ length: 8 }, () => ({
    color: "red",
    type: "pawn",
    hasMoved: false,
  })),
  //row 14
  { color: "red", type: "rook", hasMoved: false },
  { color: "red", type: "knight", hasMoved: false },
  { color: "red", type: "bishop", hasMoved: false },
  { color: "red", type: "queen", hasMoved: false },
  { color: "red", type: "king", hasMoved: false },
  { color: "red", type: "bishop", hasMoved: false },
  { color: "red", type: "knight", hasMoved: false },
  { color: "red", type: "rook", hasMoved: false },
];

export const startingBoardState: BoardState = {
  board: startingBoard,
  turn: "red",
  movesPlayed: 0,
};
