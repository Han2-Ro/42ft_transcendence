import {
  BoardCon4,
  BoardStateCon4,
  PlayerColor,
  GameStatus,
  MoveCon4,
  PlayerColorCon4,
  Pos2,
} from "../../gameTypes";

export function validateMove(
  move: MoveCon4,
  boardState: BoardStateCon4,
  played_by: PlayerColorCon4,
): boolean {
  if (boardState.turn !== played_by) return false;
  const moves = generateMoves(boardState.board);
  return moves.includes(move);
}

export function generateMoves(board: BoardCon4): Array<number> {
  let moves: number[] = [];
  for (let i = 0; i < 7; i++) {
    if (board[i] === "empty") {
      moves.push(i);
    }
  }
  return moves;
}

function generateOffset(pos: number, offset: Pos2): number | null {
  const pos2: Pos2 = { x: 0, y: 0 };
  pos2.x = (pos % 7) + 1;
  pos2.y = Math.floor(pos / 7) + 1;
  const newPos: Pos2 = { x: pos2.x + offset.x, y: pos2.y + offset.y };
  if (newPos.x > 0 && newPos.x <= 7 && newPos.y > 0 && newPos.y <= 6)
    return (newPos.y - 1) * 7 + (newPos.x - 1);
  return null;
}

function generateOffsetLine(
  board: BoardCon4,
  sq: number,
  offset: Pos2,
): Array<Number> {
  const line: Number[] = [];
  //let newPos = sq + offset
  let newPos = generateOffset(sq, offset);
  while (newPos != null && board[newPos] === board[sq]) {
    line.push(newPos);
    newPos = generateOffset(newPos, offset);
  }
  return line;
}

function generateOffsetLineEmpty(
  board: BoardCon4,
  sq: number,
  offset: Pos2,
): Array<number> {
  const line: number[] = [];
  let newPos: number | null = sq;
  while (newPos != null && board[newPos] === "empty") {
    line.push(newPos);
    newPos = generateOffset(newPos, offset);
  }
  return line;
}

export function updateBoardState(
  boardState: BoardStateCon4,
  move: MoveCon4,
): GameStatus {
  let status: GameStatus = { isOver: false, winners: null, reason: "" };
  let down = [];
  down.push(...generateOffsetLineEmpty(boardState.board, move, { x: 0, y: 1 }));
  const maxDown = down.length !== 0 ? Math.max(...down.map(Number)) : null;
  if (maxDown !== null) {
    boardState.board[maxDown] = boardState.turn;
    status = checkConnections(boardState.board, maxDown);
  }
  const moves = generateMoves(boardState.board);
  if (moves.length === 0 && status.isOver == false)
	status = { isOver: true, winners: null, reason: "No squares left"}
  if (boardState.turn == "red") boardState.turn = "yellow";
  else boardState.turn = "red";
  return status;
}

function checkConnections(board: BoardCon4, sq: number): GameStatus {
  let diagonalDe = [];
  diagonalDe.push(...generateOffsetLine(board, sq, { x: 1, y: -1 }));
  diagonalDe.push(...generateOffsetLine(board, sq, { x: -1, y: 1 }));
  let diagonalAs = [];
  diagonalAs.push(...generateOffsetLine(board, sq, { x: -1, y: -1 }));
  diagonalAs.push(...generateOffsetLine(board, sq, { x: 1, y: 1 }));
  let horizontal = [];
  horizontal.push(...generateOffsetLine(board, sq, { x: 0, y: -1 }));
  horizontal.push(...generateOffsetLine(board, sq, { x: 0, y: 1 }));
  let vertival = [];
  vertival.push(...generateOffsetLine(board, sq, { x: -1, y: 0 }));
  vertival.push(...generateOffsetLine(board, sq, { x: 1, y: 0 }));
  if (
    diagonalDe.length >= 3 ||
    diagonalAs.length >= 3 ||
    horizontal.length >= 3 ||
    vertival.length >= 3
  ) {
    let winner: PlayerColor[];
    if (board[sq] == "red") winner = ["red"];
    else winner = ["yellow"];
    return { isOver: true, winners: winner, reason: "Connect 4" };
  }
  return { isOver: false, winners: null, reason: "" };
}
