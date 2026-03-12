import {
  Board,
  BoardState,
  PlayerColor,
  GameStatus,
  Move,
  PieceOrNull,
  PieceType,
  Pos2,
} from "../../gameTypes.js";

export function validateMove(
  move: Move,
  boardState: BoardState,
  played_by: PlayerColor,
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
    boardState.turn == played_by && //turn this off if you want to be able to play moves from every browser (for testing)
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
  switch (boardState.turn) {
    case "red":
      boardState.turn = "blue";
      break;
    case "blue":
      boardState.turn = "yellow";
      break;
    case "yellow":
      boardState.turn = "green";
      break;
    case "green":
      boardState.turn = "red";
      break;
  }
}

function updateBoard(board: Board, move: Move, turn: PlayerColor) {
  const piece = board[move.from];
  if (piece) piece.hasMoved = true;
  board[move.to] = board[move.from];
  board[move.from] = null;
  if (move.special !== null) {
    //long castle
    if (move.special == "0-0-0") {
      if (turn == "red") {
        board[152] = null;
        board[155] = { type: "rook", hasMoved: true, color: "red" };
      }
      if (turn == "yellow") {
        board[7] = null;
        board[4] = { type: "rook", hasMoved: true, color: "yellow" };
      }
      if (turn == "green") {
        board[37] = null;
        board[79] = { type: "rook", hasMoved: true, color: "green" };
      }
      if (turn == "blue") {
        board[122] = null;
        board[80] = { type: "rook", hasMoved: true, color: "blue" };
      }
    }
    //short castle
    if (move.special == "0-0") {
      if (turn == "red") {
        board[159] = null;
        board[157] = { type: "rook", hasMoved: true, color: "red" };
      }
      if (turn == "yellow") {
        board[0] = null;
        board[2] = { type: "rook", hasMoved: true, color: "yellow" };
      }
      if (turn == "green") {
        board[135] = null;
        board[107] = { type: "rook", hasMoved: true, color: "green" };
      }
      if (turn == "blue") {
        board[24] = null;
        board[52] = { type: "rook", hasMoved: true, color: "blue" };
      }
    }
    //promotion
    if (move.special == "promotion") {
      const piece = board[move.to];
      if (move.promotion && piece) piece.type = move.promotion;
    }
  }
}

export function checkMates(board: Board, turn: PlayerColor): GameStatus {
  const moves = generateAllMoves(board, turn);
  if (moves.length == 0) {
    if (checkKingInCheck(board, turn)) {
      let winners: PlayerColor[];
      if (turn == "red" || turn == "yellow") winners = ["blue", "green"];
      else winners = ["red", "yellow"];
      return { isOver: true, winners: winners, reason: "checkmate" };
    } else return { isOver: true, winners: null, reason: "stalemate" };
  }
  return { isOver: false, winners: null, reason: "" };
}

export function generateAllMoves(
  board: Board,
  PlayerColor: PlayerColor,
): Array<Move> {
  const moves: Move[] = [];
  for (let sq = 0; sq < 160; sq++) {
    const piece = board[sq];
    if (!piece || piece.color !== PlayerColor) continue;
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

function isPromotingSqare(sq: number, PlayerColor: PlayerColor): boolean {
  if (PlayerColor == "red") {
    if (sq > 23 && sq < 38) return true;
  }
  if (PlayerColor == "yellow") {
    if (sq > 121 && sq < 136) return true;
  }
  if (PlayerColor == "green") {
    const green_sqares = [
      0, 8, 16, 27, 41, 55, 69, 83, 97, 111, 125, 136, 144, 152,
    ];
    if (green_sqares.includes(sq)) return true;
  }
  if (PlayerColor == "blue") {
    const blue_sqares = [
      7, 15, 23, 34, 48, 62, 76, 90, 104, 118, 132, 143, 151, 159,
    ];
    if (blue_sqares.includes(sq)) return true;
  }
  return false;
}

//Piece Move Generation
function generatePawnMoves(
  board: Board,
  sq: number,
  PlayerColor: PlayerColor,
  hasMoved: boolean,
): Array<Move> {
  const moves: Move[] = [];
  let dirx = 0;
  let diry = 0;
  if (PlayerColor == "red") dirx = -1;
  if (PlayerColor == "yellow") dirx = 1;
  if (PlayerColor == "green") diry = -1;
  if (PlayerColor == "blue") diry = 1;
  //2 Move
  let newPos = generateOffset(sq, { x: 2 * dirx, y: 2 * diry });
  const newPos2 = generateOffset(sq, { x: dirx, y: diry });
  if (hasMoved == false)
    if (
      newPos != null &&
      newPos2 != null &&
      checkSqareEmpty(board, newPos) &&
      checkSqareEmpty(board, newPos2)
    )
      moves.push({ from: sq, to: newPos, special: null });
  //Move
  newPos = generateOffset(sq, { x: dirx, y: diry });
  if (newPos != null && checkSqareEmpty(board, newPos)) {
    if (isPromotingSqare(newPos, PlayerColor))
      moves.push({ from: sq, to: newPos, special: "promotion" });
    else moves.push({ from: sq, to: newPos, special: null });
  }
  //Attacks
  //right
  if (dirx === 0) newPos = generateOffset(sq, { x: 1, y: diry });
  else newPos = generateOffset(sq, { x: dirx, y: 1 });
  if (
    newPos != null &&
    checkSqare(board, newPos, PlayerColor) &&
    !checkSqareEmpty(board, newPos)
  ) {
    if (isPromotingSqare(newPos, PlayerColor))
      moves.push({ from: sq, to: newPos, special: "promotion" });
    else moves.push({ from: sq, to: newPos, special: null });
  }
  //left
  if (dirx === 0) newPos = generateOffset(sq, { x: -1, y: diry });
  else newPos = generateOffset(sq, { x: dirx, y: -1 });
  if (
    newPos != null &&
    checkSqare(board, newPos, PlayerColor) &&
    !checkSqareEmpty(board, newPos)
  ) {
    if (isPromotingSqare(newPos, PlayerColor))
      moves.push({ from: sq, to: newPos, special: "promotion" });
    else moves.push({ from: sq, to: newPos, special: null });
  }
  return moves;
}

function generateKnightMoves(
  board: Board,
  sq: number,
  PlayerColor: PlayerColor,
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
    if (checkSqare(board, newPos, PlayerColor))
      moves.push({ from: sq, to: newPos, special: null });
  }
  return moves;
}

function generateBishopMoves(
  board: Board,
  sq: number,
  PlayerColor: PlayerColor,
): Array<Move> {
  const moves: Move[] = [];
  moves.push(...generateOffsetLine(board, sq, PlayerColor, { x: 1, y: 1 }));
  moves.push(...generateOffsetLine(board, sq, PlayerColor, { x: 1, y: -1 }));
  moves.push(...generateOffsetLine(board, sq, PlayerColor, { x: -1, y: 1 }));
  moves.push(...generateOffsetLine(board, sq, PlayerColor, { x: -1, y: -1 }));
  return moves;
}

function generateRookMoves(
  board: Board,
  sq: number,
  PlayerColor: PlayerColor,
): Array<Move> {
  const moves: Move[] = [];
  moves.push(...generateOffsetLine(board, sq, PlayerColor, { x: 1, y: 0 }));
  moves.push(...generateOffsetLine(board, sq, PlayerColor, { x: -1, y: 0 }));
  moves.push(...generateOffsetLine(board, sq, PlayerColor, { x: 0, y: 1 }));
  moves.push(...generateOffsetLine(board, sq, PlayerColor, { x: 0, y: -1 }));
  return moves;
}

function generateQueenMoves(
  board: Board,
  sq: number,
  PlayerColor: PlayerColor,
): Array<Move> {
  const moves: Move[] = [];
  moves.push(...generateBishopMoves(board, sq, PlayerColor));
  moves.push(...generateRookMoves(board, sq, PlayerColor));
  return moves;
}

function generateKingMoves(
  board: Board,
  sq: number,
  PlayerColor: PlayerColor,
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
    if (checkSqare(board, newPos, PlayerColor))
      moves.push({ from: sq, to: newPos, special: null });
  }
  const piece = board[sq];
  if (piece && piece.hasMoved == false) {
    //red
    if (piece.color == "red") {
      //short
      const short_rook = board[159];
      const short_king_movements: Array<number> = [158, 157];
      if (
        short_rook != null &&
        short_rook.type == "rook" &&
        short_rook.hasMoved == false &&
        !CheckIsAttacked(board, sq, piece.color) &&
        checkSqaresEmptyAndNotAttacked(board, short_king_movements, piece.color)
      ) {
        moves.push({ from: sq, to: 158, special: "0-0" });
      }
      //long
      const long_rook = board[152];
      const long_king_movements: Array<number> = [154, 155];
      if (
        long_rook != null &&
        long_rook.type == "rook" &&
        long_rook.hasMoved == false &&
        !CheckIsAttacked(board, sq, piece.color) &&
        checkSqaresEmptyAndNotAttacked(board, long_king_movements, piece.color)
      ) {
        moves.push({ from: sq, to: 154, special: "0-0-0" });
      }
    }
    //yellow
    if (piece.color == "yellow") {
      //short
      const short_rook = board[0];
      const short_king_movements: Array<number> = [1, 2];
      if (
        short_rook != null &&
        short_rook.type == "rook" &&
        short_rook.hasMoved == false &&
        !CheckIsAttacked(board, sq, piece.color) &&
        checkSqaresEmptyAndNotAttacked(board, short_king_movements, piece.color)
      ) {
        moves.push({ from: sq, to: 1, special: "0-0" });
      }
      //long
      const long_rook = board[7];
      const long_king_movements: Array<number> = [5, 4];
      if (
        long_rook != null &&
        long_rook.type == "rook" &&
        long_rook.hasMoved == false &&
        !CheckIsAttacked(board, sq, piece.color) &&
        checkSqaresEmptyAndNotAttacked(board, long_king_movements, piece.color)
      ) {
        moves.push({ from: sq, to: 5, special: "0-0-0" });
      }
    }
    //blue
    if (piece.color == "blue") {
      //short
      const short_rook = board[24];
      const short_king_movements: Array<number> = [38, 52];
      if (
        short_rook != null &&
        short_rook.type == "rook" &&
        short_rook.hasMoved == false &&
        !CheckIsAttacked(board, sq, piece.color) &&
        checkSqaresEmptyAndNotAttacked(board, short_king_movements, piece.color)
      ) {
        moves.push({ from: sq, to: 38, special: "0-0" });
      }
      //long
      const long_rook = board[122];
      const long_king_movements: Array<number> = [94, 80];
      if (
        long_rook != null &&
        long_rook.type == "rook" &&
        long_rook.hasMoved == false &&
        !CheckIsAttacked(board, sq, piece.color) &&
        checkSqaresEmptyAndNotAttacked(board, long_king_movements, piece.color)
      ) {
        moves.push({ from: sq, to: 94, special: "0-0-0" });
      }
    }
    //green
    if (piece.color == "green") {
      //short
      const short_rook = board[135];
      const short_king_movements: Array<number> = [121, 107];
      if (
        short_rook != null &&
        short_rook.type == "rook" &&
        short_rook.hasMoved == false &&
        !CheckIsAttacked(board, sq, piece.color) &&
        checkSqaresEmptyAndNotAttacked(board, short_king_movements, piece.color)
      ) {
        moves.push({ from: sq, to: 121, special: "0-0" });
      }
      //long
      const long_rook = board[37];
      const long_king_movements: Array<number> = [65, 79];
      if (
        long_rook != null &&
        long_rook.type == "rook" &&
        long_rook.hasMoved == false &&
        !CheckIsAttacked(board, sq, piece.color) &&
        checkSqaresEmptyAndNotAttacked(board, long_king_movements, piece.color)
      ) {
        moves.push({ from: sq, to: 65, special: "0-0-0" });
      }
    }
  }
  return moves;
}

//Generic Generators
function generateOffsetLine(
  board: Board,
  sq: number,
  PlayerColor: PlayerColor,
  offset: Pos2,
): Array<Move> {
  const moves: Move[] = [];
  let newPos = generateOffset(sq, offset);
  while (newPos != null && checkSqareEmpty(board, newPos)) {
    moves.push({ from: sq, to: newPos, special: null });
    newPos = generateOffset(newPos, offset);
  }
  if (newPos != null && checkSqare(board, newPos, PlayerColor)) {
    moves.push({ from: sq, to: newPos, special: null });
  }
  return moves;
}

function indexToRowCol(index: number): Pos2 | null {
  if (index >= 0 && index < 24) {
    const row = Math.floor(index / 8);
    const col = (index % 8) + 3;
    return { x: row, y: col };
  }
  if (index >= 24 && index < 136) {
    const offset = index - 24;
    const row = Math.floor(offset / 14) + 3;
    const col = offset % 14;
    return { x: row, y: col };
  }
  if (index >= 136 && index < 160) {
    const offset = index - 136;
    const row = Math.floor(offset / 8) + 11;
    const col = (offset % 8) + 3;
    return { x: row, y: col };
  }
  return null;
}

function RowColToIndex(row: number, col: number): number | null {
  if (row < 0 || row > 13 || col < 0 || col > 13) {
    return null;
  }
  if (row <= 2) {
    if (col < 3 || col > 10) {
      return null;
    }
    return row * 8 + (col - 3);
  }
  if (row <= 10) {
    return 24 + (row - 3) * 14 + col;
  }
  if (col < 3 || col > 10) {
    return null;
  }
  return 136 + (row - 11) * 8 + (col - 3);
}

function generateOffset(pos: number, offset: Pos2): number | null {
  const pos2 = indexToRowCol(pos);
  if (pos2 !== null) {
    const new_pos2: Pos2 = { x: pos2.x + offset.x, y: pos2.y + offset.y };
    const new_pos = RowColToIndex(new_pos2.x, new_pos2.y);
    if (new_pos !== null) return new_pos;
  }
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
  PlayerColor: PlayerColor,
): boolean {
  for (let i = 0; i < sqs.length; i++) {
    if (
      CheckIsAttacked(board, sqs[i], PlayerColor) ||
      !checkSqareEmpty(board, sqs[i])
    ) {
      return false;
    }
  }
  return true;
}

function AreOpposingPlayerColors(
  first: PlayerColor,
  second: PlayerColor,
): boolean {
  if (first === "green" || first === "blue") {
    if (second === "red" || second === "yellow") return true;
  }
  if (first === "red" || first === "yellow") {
    if (second === "green" || second === "blue") return true;
  }
  return false;
}

function CheckIsAttacked(board: Board, pos: number, PlayerColor: PlayerColor) {
  //check for bishops (and half of queens)
  let moves = generateBishopMoves(board, pos, PlayerColor);
  for (let i = 0; i < moves.length; i++) {
    const pos = board[moves[i].to];
    if (
      pos &&
      AreOpposingPlayerColors(pos.color, PlayerColor) &&
      (pos.type == "bishop" || pos.type == "queen")
    )
      return true;
  }
  //check for rooks (and other half of queens)
  moves = generateRookMoves(board, pos, PlayerColor);
  for (let i = 0; i < moves.length; i++) {
    const pos = board[moves[i].to];
    if (
      pos &&
      AreOpposingPlayerColors(pos.color, PlayerColor) &&
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
    if (
      pos &&
      AreOpposingPlayerColors(pos.color, PlayerColor) &&
      pos.type == "king"
    )
      return true;
  }
  //check for knights
  moves = generateKnightMoves(board, pos, PlayerColor);
  for (let i = 0; i < moves.length; i++) {
    const pos = board[moves[i].to];
    if (
      pos &&
      AreOpposingPlayerColors(pos.color, PlayerColor) &&
      pos.type == "knight"
    )
      return true;
  }
  //check for Pawns
  if (PlayerColor == "blue" || PlayerColor == "green") {
    const red_pawn_offsets: Pos2[] = [
	  { x: 1, y: 1 },
      { x: 1, y: -1 },
    ];
    const red_moves = generateOffsets(pos, red_pawn_offsets);
    for (let i = 0; i < red_moves.length; i++) {
      const pos = board[red_moves[i]];
      if (pos && pos.color == "red" && pos.type == "pawn") return true;
    }
    const yellow_pawn_offsets: Pos2[] = [
      { x: -1, y: 1 },
      { x: -1, y: -1 },
    ];
    const yellow_moves = generateOffsets(pos, yellow_pawn_offsets);
    for (let i = 0; i < yellow_moves.length; i++) {
      const pos = board[yellow_moves[i]];
      if (pos && pos.color == "yellow" && pos.type == "pawn") return true;
    }
  } else {
    const blue_pawn_offsets: Pos2[] = [
	  { x: 1, y: -1 },
      { x: -1, y: -1 },
    ];
    const blue_moves = generateOffsets(pos, blue_pawn_offsets);
    for (let i = 0; i < blue_moves.length; i++) {
      const pos = board[blue_moves[i]];
      if (pos && pos.color == "blue" && pos.type == "pawn") return true;
    }
    const green_pawn_offsets: Pos2[] = [
      { x: -1, y: 1 },
      { x: 1, y: 1 },
    ];
    const green_moves = generateOffsets(pos, green_pawn_offsets);
    for (let i = 0; i < green_moves.length; i++) {
      const pos = board[green_moves[i]];
      if (pos && pos.color == "green" && pos.type == "pawn") return true;
    }
  }
  return false;
}

function checkKingInCheckAfterMove(
  board: Board,
  move: Move,
  PlayerColor: PlayerColor,
): boolean {
  const board_copy = JSON.parse(JSON.stringify(board));
  updateBoard(board_copy, move, PlayerColor);
  if (checkKingInCheck(board_copy, PlayerColor)) return true;
  return false;
}

export function checkKingInCheck(
  board: Board,
  PlayerColor: PlayerColor,
): boolean {
  let king_pos = -1;
  for (let sq = 0; sq < 160; sq++) {
    const piece = board[sq];
    if (piece == null) continue;
    if (piece.type == "king" && piece.color == PlayerColor) king_pos = sq;
  }
  if (CheckIsAttacked(board, king_pos, PlayerColor)) return true;
  return false;
}

function checkBounds(i: number): boolean {
  if (i >= 0 && i < 160) return true;
  return false;
}

function checkSqare(
  board: Board,
  sq: number,
  PlayerColor: PlayerColor,
): boolean {
  const new_piece = board[sq];
  if (checkBounds(sq) == false) return false;
  if (
    new_piece == null ||
    (new_piece != null && AreOpposingPlayerColors(new_piece.color, PlayerColor))
  ) {
    return true;
  }
  return false;
}

function checkSqarePiece(
  board: Board,
  sq: number,
  PlayerColor: PlayerColor,
  type: PieceType,
): boolean {
  const new_piece = board[sq];
  if (checkBounds(sq) == false) return false;
  if (
    new_piece != null &&
    AreOpposingPlayerColors(new_piece.color, PlayerColor)
  ) {
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
