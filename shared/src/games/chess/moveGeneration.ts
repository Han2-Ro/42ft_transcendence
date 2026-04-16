import {
  Board,
  BoardState,
  PlayerColor,
  GameStatus,
  Move,
  PieceOrNull,
  PieceType,
  Pos2,
} from "../../gameTypes";

export function validateMove(
  move: Move,
  boardState: BoardState,
  played_by: PlayerColor,
): boolean {
  const piece = boardState.board[move.from];
  const moves = generateMoves(
    boardState.board,
    move.from,
    boardState.enPassantSquare,
  );
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
      if (move.promotion) return true;
      else return false;
    }
    return true;
  }
  return false;
}

export function updateBoardState(boardState: BoardState, move: Move) {
  boardState.enPassantSquare = updateBoard(
    boardState.board,
    move,
    boardState.turn,
  );

  if (boardState.turn == "white") boardState.turn = "black";
  else boardState.turn = "white";
}

function updateBoard(
  board: Board,
  move: Move,
  turn: PlayerColor,
): number | null {
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
    if (move.special == "double_move") {
      return getEnPassantableSquare(move);
    }
    if (move.special == "en_passant") {
      if (turn == "black") {
        board[move.to - 8] = null;
      } else {
        board[move.to + 8] = null;
      }
    }
  }
  return null;
}

function getEnPassantableSquare(move: Move): number {
  const from2d: Pos2 = { x: -1, y: -1 };
  from2d.x = (move.from % 8) + 1;
  from2d.y = Math.floor(move.from / 8) + 1;

  const to2d: Pos2 = { x: -1, y: -1 };
  to2d.x = (move.to % 8) + 1;
  to2d.y = Math.floor(move.to / 8) + 1;

  const sq2d: Pos2 = { x: (from2d.x + to2d.x) / 2, y: (from2d.y + to2d.y) / 2 };
  return (sq2d.y - 1) * 8 + (sq2d.x - 1);
}

export function checkMates(
  board: Board,
  turn: PlayerColor,
  enPassantSquare: number | null,
): GameStatus {
  const moves = generateAllMoves(board, turn, enPassantSquare);
  if (moves.length == 0) {
    if (checkKingInCheck(board, turn)) {
      let winner: PlayerColor[];
      if (turn == "white") winner = ["black"];
      else winner = ["white"];
      return { isOver: true, winners: winner, reason: "checkmate" };
    } else return { isOver: true, winners: null, reason: "stalemate" };
  }
  return { isOver: false, winners: null, reason: "" };
}

export function generateAllMoves(
  board: Board,
  color: PlayerColor,
  enPassantSquare: number | null,
): Array<Move> {
  const moves: Move[] = [];
  for (let sq = 0; sq < 64; sq++) {
    const piece = board[sq];
    if (!piece || piece.color !== color) continue;
    const pieceMoves = generateMoves(board, sq, enPassantSquare);
    moves.push(...pieceMoves);
  }
  return moves;
}

export function generateMoves(
  board: Board,
  sq: number,
  enPassantSquare: number | null,
): Array<Move> {
  let moves: Move[] = [];

  const piece: PieceOrNull = board[sq];
  if (!piece) return moves;
  const pieceMoves =
    piece.type === "pawn"
      ? generatePawnMoves(
          board,
          sq,
          piece.color,
          piece.hasMoved,
          enPassantSquare,
        )
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
  color: PlayerColor,
  hasMoved: boolean,
  enPassantSquare: number | null,
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
      checkSquareEmpty(board, newPos) &&
      checkSquareEmpty(board, newPos2)
    )
      moves.push({ from: sq, to: newPos, special: "double_move" });
  //Move
  newPos = generateOffset(sq, { x: 0, y: dir });
  if (newPos != null && checkSquareEmpty(board, newPos)) {
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
    ((checkSquare(board, newPos, color) && !checkSquareEmpty(board, newPos)) ||
      newPos === enPassantSquare)
  ) {
    if (
      (color == "white" && newPos > -1 && newPos < 8) ||
      (color == "black" && newPos > 55 && newPos < 64)
    )
      moves.push({ from: sq, to: newPos, special: "promotion" });
    else if (newPos === enPassantSquare)
      moves.push({ from: sq, to: newPos, special: "en_passant" });
    else moves.push({ from: sq, to: newPos, special: null });
  }
  newPos = generateOffset(sq, { x: -1, y: dir });
  if (
    newPos != null &&
    ((checkSquare(board, newPos, color) && !checkSquareEmpty(board, newPos)) ||
      newPos === enPassantSquare)
  ) {
    if (
      (color == "white" && newPos > -1 && newPos < 8) ||
      (color == "black" && newPos > 55 && newPos < 64)
    )
      moves.push({ from: sq, to: newPos, special: "promotion" });
    else if (newPos === enPassantSquare)
      moves.push({ from: sq, to: newPos, special: "en_passant" });
    else moves.push({ from: sq, to: newPos, special: null });
  }
  return moves;
}

function generateKnightMoves(
  board: Board,
  sq: number,
  color: PlayerColor,
): Array<Move> {
  const moves: Move[] = [];
  const moveOffsets: Array<Pos2> = [
    { x: 1, y: 2 },
    { x: -1, y: 2 },
    { x: 1, y: -2 },
    { x: -1, y: -2 },
    { x: 2, y: 1 },
    { x: -2, y: 1 },
    { x: 2, y: -1 },
    { x: -2, y: -1 },
  ];
  const movePos = generateOffsets(sq, moveOffsets);
  for (let i = 0; i < movePos.length; i++) {
    const newPos = movePos[i];
    if (checkSquare(board, newPos, color))
      moves.push({ from: sq, to: newPos, special: null });
  }
  return moves;
}

function generateBishopMoves(
  board: Board,
  sq: number,
  color: PlayerColor,
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
  color: PlayerColor,
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
  color: PlayerColor,
): Array<Move> {
  const moves: Move[] = [];
  moves.push(...generateBishopMoves(board, sq, color));
  moves.push(...generateRookMoves(board, sq, color));
  return moves;
}

function generateKingMoves(
  board: Board,
  sq: number,
  color: PlayerColor,
): Array<Move> {
  const moves: Move[] = [];
  const moveOffsets: Array<Pos2> = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: -1 },
    { x: -1, y: 1 },
    { x: 1, y: -1 },
  ];
  const movePos = generateOffsets(sq, moveOffsets);
  for (let i = 0; i < movePos.length; i++) {
    const newPos = movePos[i];
    if (checkSquare(board, newPos, color))
      moves.push({ from: sq, to: newPos, special: null });
  }
  const piece = board[sq];
  if (piece && piece.hasMoved == false) {
    if (piece.color == "white") {
      const leftRook = board[56];
      const leftKingMovements: Array<number> = [59, 58];
      if (
        leftRook != null &&
        leftRook.type == "rook" &&
        leftRook.hasMoved == false &&
        !checkIsAttacked(board, sq, piece.color) &&
        checkSquaresEmptyAndNotAttacked(board, leftKingMovements, "white")
      ) {
        moves.push({ from: sq, to: 58, special: "0-0-0" });
      }
      const rightRook = board[63];
      const rightKingMovements: Array<number> = [61, 62];
      if (
        rightRook != null &&
        rightRook.type == "rook" &&
        rightRook.hasMoved == false &&
        !checkIsAttacked(board, sq, piece.color) &&
        checkSquaresEmptyAndNotAttacked(board, rightKingMovements, "white")
      ) {
        moves.push({ from: sq, to: 62, special: "0-0" });
      }
    } else {
      const leftRook = board[0];
      const leftKingMovements: Array<number> = [3, 2];
      if (
        leftRook != null &&
        leftRook.type == "rook" &&
        leftRook.hasMoved == false &&
        !checkIsAttacked(board, sq, piece.color) &&
        checkSquaresEmptyAndNotAttacked(board, leftKingMovements, "black")
      ) {
        moves.push({ from: sq, to: 2, special: "0-0-0" });
      }
      const rightRook = board[7];
      const rightKingMovements: Array<number> = [5, 6];
      if (
        rightRook != null &&
        rightRook.type == "rook" &&
        rightRook.hasMoved == false &&
        !checkIsAttacked(board, sq, piece.color) &&
        checkSquaresEmptyAndNotAttacked(board, rightKingMovements, "black")
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
  color: PlayerColor,
  offset: Pos2,
): Array<Move> {
  const moves: Move[] = [];
  //let newPos = sq + offset
  let newPos = generateOffset(sq, offset);
  while (newPos != null && checkSquareEmpty(board, newPos)) {
    moves.push({ from: sq, to: newPos, special: null });
    newPos = generateOffset(newPos, offset);
  }
  if (newPos != null && checkSquare(board, newPos, color)) {
    moves.push({ from: sq, to: newPos, special: null });
  }
  return moves;
}

function generateOffset(pos: number, offset: Pos2): number | null {
  const pos2: Pos2 = { x: -1, y: -1 };
  pos2.x = (pos % 8) + 1;
  pos2.y = Math.floor(pos / 8) + 1;
  const newPos: Pos2 = { x: pos2.x + offset.x, y: pos2.y + offset.y };
  if (newPos.x > 0 && newPos.x <= 8 && newPos.y > 0 && newPos.y <= 8)
    return (newPos.y - 1) * 8 + (newPos.x - 1);
  return null;
}

function generateOffsets(pos: number, offsets: Array<Pos2>): Array<number> {
  const numOffsets: number[] = [];
  for (let i = 0; i < offsets.length; i++) {
    const num = generateOffset(pos, offsets[i]);
    if (num !== null) numOffsets.push(num);
  }
  return numOffsets;
}

//Checkers
function checkSquaresEmptyAndNotAttacked(
  board: Board,
  sqs: Array<number>,
  color: PlayerColor,
): boolean {
  for (let i = 0; i < sqs.length; i++) {
    if (
      checkIsAttacked(board, sqs[i], color) ||
      !checkSquareEmpty(board, sqs[i])
    ) {
      return false;
    }
  }
  return true;
}

function checkIsAttacked(board: Board, pos: number, color: PlayerColor) {
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
  const kingOffsets: Array<Pos2> = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: -1 },
    { x: -1, y: 1 },
    { x: 1, y: -1 },
  ];
  const kingPos = generateOffsets(pos, kingOffsets);
  for (let i = 0; i < kingPos.length; i++) {
    const pos = board[kingPos[i]];
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
  const pawnOffsets: Array<Pos2> = [
    { x: 1, y: dir },
    { x: -1, y: dir },
  ];
  const pawnPos = generateOffsets(pos, pawnOffsets);
  for (let i = 0; i < pawnPos.length; i++) {
    const newPos = pawnPos[i];
    if (checkSquarePiece(board, newPos, color, "pawn")) return true;
  }
  return false;
}

function checkKingInCheckAfterMove(
  board: Board,
  move: Move,
  color: PlayerColor,
): boolean {
  const boardCopy = structuredClone(board);
  updateBoard(boardCopy, move, color);
  if (checkKingInCheck(boardCopy, color)) return true;
  return false;
}

export function checkKingInCheck(board: Board, color: PlayerColor): boolean {
  let kingPos = -1;
  for (let sq = 0; sq < 64; sq++) {
    const piece = board[sq];
    if (piece == null) continue;
    if (piece.type == "king" && piece.color == color) kingPos = sq;
  }
  if (checkIsAttacked(board, kingPos, color)) return true;
  return false;
}

function checkBounds(i: number): boolean {
  if (i >= 0 && i <= 63) return true;
  return false;
}

function checkSquare(board: Board, sq: number, color: PlayerColor): boolean {
  const newPiece = board[sq];
  if (checkBounds(sq) == false) return false;
  if (newPiece == null || (newPiece != null && newPiece.color != color)) {
    return true;
  }
  return false;
}

function checkSquarePiece(
  board: Board,
  sq: number,
  color: PlayerColor,
  type: PieceType,
): boolean {
  const newPiece = board[sq];
  if (checkBounds(sq) == false) return false;
  if (newPiece != null && newPiece.color != color && newPiece.type == type) {
    return true;
  }
  return false;
}

function checkSquareEmpty(board: Board, sq: number): boolean {
  const newPos = sq;
  const newPiece = board[newPos];
  if (checkBounds(newPos) == false) return false;
  if (newPiece == null) {
    return true;
  }
  return false;
}
