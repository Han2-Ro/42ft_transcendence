import { BoardCon4, BoardStateCon4 } from "shared";

export const startingBoard: BoardCon4 = Array.from(
  { length: 42 },
  () => "empty",
) as BoardCon4;

export const startingBoardState: BoardStateCon4 = {
  board: startingBoard,
  turn: "red",
};
