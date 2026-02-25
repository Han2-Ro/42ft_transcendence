import {
  Board,
  BoardState,
  Color,
  GameStatus,
  Move,
  PieceOrNull,
  PieceType,
  Pos2,
} from "../../gameTypes.js";

export function validateMove(
  move: Move,
  boardState: BoardState,
  played_by: Color,
): boolean {
  const piece = boardState.board[move.from];
  const moves = generateMoves(boardState.board, move.from);
  const moveExists = moves.some(
    (m) =>
      m.from === move.from && m.to === move.to && m.special === move.special,
  );
  if (
    checkBounds(move.from) &&
    checkBounds(move.to) &&
    piece !== null &&
    piece.color == boardState.turn &&
    boardState.turn == played_by &&
    moveExists
  ) {
    if (move.special == "promotion") {
      if (
        move.promotion &&
        move.promotion != "pawn" &&
        move.promotion != "king"
      )
        return true;
      else return false;
    }
    return true;
  }
  return false;
}

export function updateBoardState(boardState: BoardState, move: Move) {
  updateBoard(boardState.board, move, boardState.turn);
  if (boardState.turn == "white") boardState.turn = "black";
  else boardState.turn = "white";
}

function updateBoard(board: Board, move: Move, turn: Color) {
  const piece = board[move.from];
  if (piece) piece.hasMoved = true;
  board[move.to] = board[move.from];
  board[move.from] = null;
  if (move.special !== null) {
    if (move.special == "0-0-0") {
      if (turn == "black") {
        board[0] = null;
        board[3] = { type: "rook", hasMoved: true, color: "black" };
      } else {
        board[56] = null;
        board[59] = { type: "rook", hasMoved: true, color: "white" };
      }
    }
    if (move.special == "0-0") {
      if (turn == "black") {
        board[7] = null;
        board[5] = { type: "rook", hasMoved: true, color: "black" };
      } else {
        board[63] = null;
        board[61] = { type: "rook", hasMoved: true, color: "white" };
      }
    }
    if (move.special == "promotion") {
      const piece = board[move.to];
      if (move.promotion && piece) piece.type = move.promotion;
    }
  }
}

export function checkMates(board: Board, turn: Color): GameStatus {
  const moves = generateAllMoves(board, turn);
  if (moves.length == 0) {
    if (checkKingInCheck(board, turn)) {
      let winner: Color;
      if (turn == "white") winner = "black";
      else winner = "white";
      return { isOver: true, winner: winner, reason: "Checkmate" };
    } else return { isOver: true, winner: null, reason: "Stalemate" };
  }
  return { isOver: false, winner: null, reason: "" };
}

export function generateAllMoves(board: Board, color: Color): Array<Move> {
  const moves: Move[] = [];
  for (let sq = 0; sq < 64; sq++) {
    const piece = board[sq];
    if (!piece || piece.color !== color) continue;
    const pieceMoves = generateMoves(board, sq);
    moves.push(...pieceMoves);
  }
  return moves;
}

export function generateMoves(board: Board, sq: number): Array<Move> {
  let moves: Move[] = [];

  const piece: PieceOrNull = board[sq];
  if (!piece) return moves;
  const pieceMoves =
    piece.type === "pawn"
      ? generatePawnMoves(board, sq, piece.color, piece.hasMoved)
      : piece.type === "knight"
        ? generateKnightMoves(board, sq, piece.color)
        : piece.type === "bishop"
          ? generateBishopMoves(board, sq, piece.color)
          : piece.type === "rook"
            ? generateRookMoves(board, sq, piece.color)
            : piece.type === "queen"
              ? generateQueenMoves(board, sq, piece.color)
              : piece.type === "king"
                ? generateKingMoves(board, sq, piece.color)
                : [];
  moves.push(...pieceMoves);
  moves = moves.filter(
    (move) => !checkKingInCheckAfterMove(board, move, piece.color),
  );
  return moves;
}

//Piece Move Generation
function generatePawnMoves(
  board: Board,
  sq: number,
  color: Color,
  hasMoved: boolean,
): Array<Move> {
  const moves: Move[] = [];
  let dir = 1;
  if (color == "white") dir = -1;
  //2 Move
  let newPos = generateOffset(sq, { x: 0, y: 2 * dir });
  const newPos2 = generateOffset(sq, { x: 0, y: dir });
  if (hasMoved == false)
    if (
      newPos != null &&
      newPos2 != null &&
      checkSqareEmpty(board, newPos) &&
      checkSqareEmpty(board, newPos2)
    )
      moves.push({ from: sq, to: newPos, special: null });
  //Move
  newPos = generateOffset(sq, { x: 0, y: dir });
  if (newPos != null && checkSqareEmpty(board, newPos)) {
    if (
      (color == "white" && newPos > -1 && newPos < 8) ||
      (color == "black" && newPos > 55 && newPos < 64)
    )
      moves.push({ from: sq, to: newPos, special: "promotion" });
    else moves.push({ from: sq, to: newPos, special: null });
  }
  //Attacks
  newPos = generateOffset(sq, { x: 1, y: dir });
  if (
    newPos != null &&
    checkSqare(board, newPos, color) &&
    !checkSqareEmpty(board, newPos)
  ) {
    if (
      (color == "white" && newPos > -1 && newPos < 8) ||
      (color == "black" && newPos > 55 && newPos < 64)
    )
      moves.push({ from: sq, to: newPos, special: "promotion" });
    else moves.push({ from: sq, to: newPos, special: null });
  }
  newPos = generateOffset(sq, { x: -1, y: dir });
  if (
    newPos != null &&
    checkSqare(board, newPos, color) &&
    !checkSqareEmpty(board, newPos)
  ) {
    if (
      (color == "white" && newPos > -1 && newPos < 8) ||
      (color == "black" && newPos > 55 && newPos < 64)
    )
      moves.push({ from: sq, to: newPos, special: "promotion" });
    else moves.push({ from: sq, to: newPos, special: null });
  }
  return moves;
}

function generateKnightMoves(
  board: Board,
  sq: number,
  color: Color,
): Array<Move> {
  const moves: Move[] = [];
  const move_offsets: Array<Pos2> = [
    { x: 1, y: 2 },
    { x: -1, y: 2 },
    { x: 1, y: -2 },
    { x: -1, y: -2 },
    { x: 2, y: 1 },
    { x: -2, y: 1 },
    { x: 2, y: -1 },
    { x: -2, y: -1 },
  ];
  const move_pos = generateOffsets(sq, move_offsets);
  for (let i = 0; i < move_pos.length; i++) {
    const newPos = move_pos[i];
    if (checkSqare(board, newPos, color))
      moves.push({ from: sq, to: newPos, special: null });
  }
  return moves;
}

function generateBishopMoves(
  board: Board,
  sq: number,
  color: Color,
): Array<Move> {
  const moves: Move[] = [];
  moves.push(...generateOffsetLine(board, sq, color, { x: 1, y: 1 }));
  moves.push(...generateOffsetLine(board, sq, color, { x: 1, y: -1 }));
  moves.push(...generateOffsetLine(board, sq, color, { x: -1, y: 1 }));
  moves.push(...generateOffsetLine(board, sq, color, { x: -1, y: -1 }));
  return moves;
}

function generateRookMoves(
  board: Board,
  sq: number,
  color: Color,
): Array<Move> {
  const moves: Move[] = [];
  moves.push(...generateOffsetLine(board, sq, color, { x: 1, y: 0 }));
  moves.push(...generateOffsetLine(board, sq, color, { x: -1, y: 0 }));
  moves.push(...generateOffsetLine(board, sq, color, { x: 0, y: 1 }));
  moves.push(...generateOffsetLine(board, sq, color, { x: 0, y: -1 }));
  return moves;
}

function generateQueenMoves(
  board: Board,
  sq: number,
  color: Color,
): Array<Move> {
  const moves: Move[] = [];
  moves.push(...generateBishopMoves(board, sq, color));
  moves.push(...generateRookMoves(board, sq, color));
  return moves;
}

function generateKingMoves(
  board: Board,
  sq: number,
  color: Color,
): Array<Move> {
  const moves: Move[] = [];
  const move_offsets: Array<Pos2> = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: -1 },
    { x: -1, y: 1 },
    { x: 1, y: -1 },
  ];
  const move_pos = generateOffsets(sq, move_offsets);
  for (let i = 0; i < move_pos.length; i++) {
    const newPos = move_pos[i];
    if (checkSqare(board, newPos, color))
      moves.push({ from: sq, to: newPos, special: null });
  }
  const piece = board[sq];
  if (piece && piece.hasMoved == false) {
    if (piece.color == "white") {
      const left_rook = board[56];
      const left_king_movements: Array<number> = [59, 58];
      if (
        left_rook != null &&
        left_rook.type == "rook" &&
        left_rook.hasMoved == false &&
        !CheckIsAttacked(board, sq, piece.color) &&
        checkSqaresEmptyAndNotAttacked(board, left_king_movements, "white")
      ) {
        moves.push({ from: sq, to: 58, special: "0-0-0" });
      }
      const right_rook = board[63];
      const right_king_movements: Array<number> = [61, 62];
      if (
        right_rook != null &&
        right_rook.type == "rook" &&
        right_rook.hasMoved == false &&
        !CheckIsAttacked(board, sq, piece.color) &&
        checkSqaresEmptyAndNotAttacked(board, right_king_movements, "white")
      ) {
        moves.push({ from: sq, to: 62, special: "0-0" });
      }
    } else {
      const left_rook = board[0];
      const left_king_movements: Array<number> = [3, 2];
      if (
        left_rook != null &&
        left_rook.type == "rook" &&
        left_rook.hasMoved == false &&
        !CheckIsAttacked(board, sq, piece.color) &&
        checkSqaresEmptyAndNotAttacked(board, left_king_movements, "black")
      ) {
        moves.push({ from: sq, to: 2, special: "0-0-0" });
      }
      const right_rook = board[7];
      const right_king_movements: Array<number> = [5, 6];
      if (
        right_rook != null &&
        right_rook.type == "rook" &&
        right_rook.hasMoved == false &&
        !CheckIsAttacked(board, sq, piece.color) &&
        checkSqaresEmptyAndNotAttacked(board, right_king_movements, "black")
      ) {
        moves.push({ from: sq, to: 6, special: "0-0" });
      }
    }
  }
  return moves;
}

//Generic Generators
function generateOffsetLine(
  board: Board,
  sq: number,
  color: Color,
  offset: Pos2,
): Array<Move> {
  const moves: Move[] = [];
  //let newPos = sq + offset
  let newPos = generateOffset(sq, offset);
  while (newPos != null && checkSqareEmpty(board, newPos)) {
    moves.push({ from: sq, to: newPos, special: null });
    newPos = generateOffset(newPos, offset);
  }
  if (newPos != null && checkSqare(board, newPos, color)) {
    moves.push({ from: sq, to: newPos, special: null });
  }
  return moves;
}

function generateOffset(pos: number, offset: Pos2): number | null {
  const pos2: Pos2 = { x: -1, y: -1 };
  pos2.x = (pos % 8) + 1;
  pos2.y = Math.floor(pos / 8) + 1;
  const new_pos: Pos2 = { x: pos2.x + offset.x, y: pos2.y + offset.y };
  if (new_pos.x > 0 && new_pos.x <= 8 && new_pos.y > 0 && new_pos.y <= 8)
    return (new_pos.y - 1) * 8 + (new_pos.x - 1);
  return null;
}

function generateOffsets(pos: number, offsets: Array<Pos2>): Array<number> {
  const num_offsets: number[] = [];
  for (let i = 0; i < offsets.length; i++) {
    const num = generateOffset(pos, offsets[i]);
    if (num !== null) num_offsets.push(num);
  }
  return num_offsets;
}

//Checkers
function checkSqaresEmptyAndNotAttacked(
  board: Board,
  sqs: Array<number>,
  color: Color,
): boolean {
  for (let i = 0; i < sqs.length; i++) {
    if (
      CheckIsAttacked(board, sqs[i], color) ||
      !checkSqareEmpty(board, sqs[i])
    ) {
      return false;
    }
  }
  return true;
}

function CheckIsAttacked(board: Board, pos: number, color: Color) {
  //check for bishops (and half of queens)
  let moves = generateBishopMoves(board, pos, color);
  for (let i = 0; i < moves.length; i++) {
    const pos = board[moves[i].to];
    if (
      pos &&
      pos.color != color &&
      (pos.type == "bishop" || pos.type == "queen")
    )
      return true;
  }
  //check for rooks (and other half of queens)
  moves = generateRookMoves(board, pos, color);
  for (let i = 0; i < moves.length; i++) {
    const pos = board[moves[i].to];
    if (
      pos &&
      pos.color != color &&
      (pos.type == "rook" || pos.type == "queen")
    )
      return true;
  }
  //check for kings
  const king_offsets: Array<Pos2> = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: -1 },
    { x: -1, y: 1 },
    { x: 1, y: -1 },
  ];
  const king_pos = generateOffsets(pos, king_offsets);
  for (let i = 0; i < king_pos.length; i++) {
    const pos = board[king_pos[i]];
    if (pos && pos.color != color && pos.type == "king") return true;
  }
  //check for knights
  moves = generateKnightMoves(board, pos, color);
  for (let i = 0; i < moves.length; i++) {
    const pos = board[moves[i].to];
    if (pos && pos.color != color && pos.type == "knight") return true;
  }
  //check for Pawns
  let dir = -1;
  if (color == "black") dir = 1;
  const pawn_offsets: Array<Pos2> = [
    { x: 1, y: dir },
    { x: -1, y: dir },
  ];
  const pawn_pos = generateOffsets(pos, pawn_offsets);
  for (let i = 0; i < pawn_pos.length; i++) {
    const newPos = pawn_pos[i];
    if (checkSqarePiece(board, newPos, color, "pawn")) return true;
  }
  return false;
}

function checkKingInCheckAfterMove(
  board: Board,
  move: Move,
  color: Color,
): boolean {
  const board_copy = [...board];
  updateBoard(board_copy, move, color);
  if (checkKingInCheck(board_copy, color)) return true;
  return false;
}

export function checkKingInCheck(board: Board, color: Color): boolean {
  let king_pos = -1;
  for (let sq = 0; sq < 64; sq++) {
    const piece = board[sq];
    if (piece == null) continue;
    if (piece.type == "king" && piece.color == color) king_pos = sq;
  }
  if (CheckIsAttacked(board, king_pos, color)) return true;
  return false;
}

function checkBounds(i: number): boolean {
  if (i >= 0 && i <= 63) return true;
  return false;
}

function checkSqare(board: Board, sq: number, color: Color): boolean {
  const new_piece = board[sq];
  if (checkBounds(sq) == false) return false;
  if (new_piece == null || (new_piece != null && new_piece.color != color)) {
    return true;
  }
  return false;
}

function checkSqarePiece(
  board: Board,
  sq: number,
  color: Color,
  type: PieceType,
): boolean {
  const new_piece = board[sq];
  if (checkBounds(sq) == false) return false;
  if (new_piece != null && new_piece.color != color && new_piece.type == type) {
    return true;
  }
  return false;
}

function checkSqareEmpty(board: Board, sq: number): boolean {
  const newPos = sq;
  const new_piece = board[newPos];
  if (checkBounds(newPos) == false) return false;
  if (new_piece == null) {
    return true;
  }
  return false;
}
