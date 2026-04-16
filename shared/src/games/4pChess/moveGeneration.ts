import {
  Board,
  BoardState,
  PlayerColor,
  GameStatus,
  Move,
  PieceOrNull,
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
      if (move.promotion) return true;
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

function isPromotingSquare(sq: number, PlayerColor: PlayerColor): boolean {
  if (PlayerColor == "red") {
    if (sq > 23 && sq < 38) return true;
  }
  if (PlayerColor == "yellow") {
    if (sq > 121 && sq < 136) return true;
  }
  if (PlayerColor == "green") {
    const greenSquares = [
      0, 8, 16, 27, 41, 55, 69, 83, 97, 111, 125, 136, 144, 152,
    ];
    if (greenSquares.includes(sq)) return true;
  }
  if (PlayerColor == "blue") {
    const blueSquares = [
      7, 15, 23, 34, 48, 62, 76, 90, 104, 118, 132, 143, 151, 159,
    ];
    if (blueSquares.includes(sq)) return true;
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
      checkSquareEmpty(board, newPos) &&
      checkSquareEmpty(board, newPos2)
    )
      moves.push({ from: sq, to: newPos, special: null });
  //Move
  newPos = generateOffset(sq, { x: dirx, y: diry });
  if (newPos != null && checkSquareEmpty(board, newPos)) {
    if (isPromotingSquare(newPos, PlayerColor))
      moves.push({ from: sq, to: newPos, special: "promotion" });
    else moves.push({ from: sq, to: newPos, special: null });
  }
  //Attacks
  //right
  if (dirx === 0) newPos = generateOffset(sq, { x: 1, y: diry });
  else newPos = generateOffset(sq, { x: dirx, y: 1 });
  if (
    newPos != null &&
    checkSquare(board, newPos, PlayerColor) &&
    !checkSquareEmpty(board, newPos)
  ) {
    if (isPromotingSquare(newPos, PlayerColor))
      moves.push({ from: sq, to: newPos, special: "promotion" });
    else moves.push({ from: sq, to: newPos, special: null });
  }
  //left
  if (dirx === 0) newPos = generateOffset(sq, { x: -1, y: diry });
  else newPos = generateOffset(sq, { x: dirx, y: -1 });
  if (
    newPos != null &&
    checkSquare(board, newPos, PlayerColor) &&
    !checkSquareEmpty(board, newPos)
  ) {
    if (isPromotingSquare(newPos, PlayerColor))
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
    if (checkSquare(board, newPos, PlayerColor))
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
    if (checkSquare(board, newPos, PlayerColor))
      moves.push({ from: sq, to: newPos, special: null });
  }
  const piece = board[sq];
  if (piece && piece.hasMoved == false) {
    //red
    if (piece.color == "red") {
      //short
      const shortRook = board[159];
      const shortKingMovements: Array<number> = [158, 157];
      if (
        shortRook != null &&
        shortRook.type == "rook" &&
        shortRook.hasMoved == false &&
        !checkIsAttacked(board, sq, piece.color) &&
        checkSquaresEmptyAndNotAttacked(board, shortKingMovements, piece.color)
      ) {
        moves.push({ from: sq, to: 158, special: "0-0" });
      }
      //long
      const longRook = board[152];
      const longKingMovements: Array<number> = [154, 155];
      if (
        longRook != null &&
        longRook.type == "rook" &&
        longRook.hasMoved == false &&
        !checkIsAttacked(board, sq, piece.color) &&
        checkSquaresEmptyAndNotAttacked(board, longKingMovements, piece.color)
      ) {
        moves.push({ from: sq, to: 154, special: "0-0-0" });
      }
    }
    //yellow
    if (piece.color == "yellow") {
      //short
      const shortRook = board[0];
      const shortKingMovements: Array<number> = [1, 2];
      if (
        shortRook != null &&
        shortRook.type == "rook" &&
        shortRook.hasMoved == false &&
        !checkIsAttacked(board, sq, piece.color) &&
        checkSquaresEmptyAndNotAttacked(board, shortKingMovements, piece.color)
      ) {
        moves.push({ from: sq, to: 1, special: "0-0" });
      }
      //long
      const longRook = board[7];
      const longKingMovements: Array<number> = [5, 4];
      if (
        longRook != null &&
        longRook.type == "rook" &&
        longRook.hasMoved == false &&
        !checkIsAttacked(board, sq, piece.color) &&
        checkSquaresEmptyAndNotAttacked(board, longKingMovements, piece.color)
      ) {
        moves.push({ from: sq, to: 5, special: "0-0-0" });
      }
    }
    //blue
    if (piece.color == "blue") {
      //short
      const shortRook = board[24];
      const shortKingMovements: Array<number> = [38, 52];
      if (
        shortRook != null &&
        shortRook.type == "rook" &&
        shortRook.hasMoved == false &&
        !checkIsAttacked(board, sq, piece.color) &&
        checkSquaresEmptyAndNotAttacked(board, shortKingMovements, piece.color)
      ) {
        moves.push({ from: sq, to: 38, special: "0-0" });
      }
      //long
      const longRook = board[122];
      const longKingMovements: Array<number> = [94, 80];
      if (
        longRook != null &&
        longRook.type == "rook" &&
        longRook.hasMoved == false &&
        !checkIsAttacked(board, sq, piece.color) &&
        checkSquaresEmptyAndNotAttacked(board, longKingMovements, piece.color)
      ) {
        moves.push({ from: sq, to: 94, special: "0-0-0" });
      }
    }
    //green
    if (piece.color == "green") {
      //short
      const shortRook = board[135];
      const shortKingMovements: Array<number> = [121, 107];
      if (
        shortRook != null &&
        shortRook.type == "rook" &&
        shortRook.hasMoved == false &&
        !checkIsAttacked(board, sq, piece.color) &&
        checkSquaresEmptyAndNotAttacked(board, shortKingMovements, piece.color)
      ) {
        moves.push({ from: sq, to: 121, special: "0-0" });
      }
      //long
      const longRook = board[37];
      const longKingMovements: Array<number> = [65, 79];
      if (
        longRook != null &&
        longRook.type == "rook" &&
        longRook.hasMoved == false &&
        !checkIsAttacked(board, sq, piece.color) &&
        checkSquaresEmptyAndNotAttacked(board, longKingMovements, piece.color)
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
  while (newPos != null && checkSquareEmpty(board, newPos)) {
    moves.push({ from: sq, to: newPos, special: null });
    newPos = generateOffset(newPos, offset);
  }
  if (newPos != null && checkSquare(board, newPos, PlayerColor)) {
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

function rowColToIndex(row: number, col: number): number | null {
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
    const newPos2: Pos2 = { x: pos2.x + offset.x, y: pos2.y + offset.y };
    const newPos = rowColToIndex(newPos2.x, newPos2.y);
    if (newPos !== null) return newPos;
  }
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
  PlayerColor: PlayerColor,
): boolean {
  for (let i = 0; i < sqs.length; i++) {
    if (
      checkIsAttacked(board, sqs[i], PlayerColor) ||
      !checkSquareEmpty(board, sqs[i])
    ) {
      return false;
    }
  }
  return true;
}

function areOpposingPlayerColors(
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

function checkIsAttacked(board: Board, pos: number, PlayerColor: PlayerColor) {
  //check for bishops (and half of queens)
  let moves = generateBishopMoves(board, pos, PlayerColor);
  for (let i = 0; i < moves.length; i++) {
    const pos = board[moves[i].to];
    if (
      pos &&
      areOpposingPlayerColors(pos.color, PlayerColor) &&
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
      areOpposingPlayerColors(pos.color, PlayerColor) &&
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
    if (
      pos &&
      areOpposingPlayerColors(pos.color, PlayerColor) &&
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
      areOpposingPlayerColors(pos.color, PlayerColor) &&
      pos.type == "knight"
    )
      return true;
  }
  //check for Pawns
  if (PlayerColor == "blue" || PlayerColor == "green") {
    const redPawnOffsets: Pos2[] = [
      { x: 1, y: 1 },
      { x: 1, y: -1 },
    ];
    const redMoves = generateOffsets(pos, redPawnOffsets);
    for (let i = 0; i < redMoves.length; i++) {
      const pos = board[redMoves[i]];
      if (pos && pos.color == "red" && pos.type == "pawn") return true;
    }
    const yellowPawnOffsets: Pos2[] = [
      { x: -1, y: 1 },
      { x: -1, y: -1 },
    ];
    const yellowMoves = generateOffsets(pos, yellowPawnOffsets);
    for (let i = 0; i < yellowMoves.length; i++) {
      const pos = board[yellowMoves[i]];
      if (pos && pos.color == "yellow" && pos.type == "pawn") return true;
    }
  } else {
    const bluePawnOffsets: Pos2[] = [
      { x: 1, y: -1 },
      { x: -1, y: -1 },
    ];
    const blueMoves = generateOffsets(pos, bluePawnOffsets);
    for (let i = 0; i < blueMoves.length; i++) {
      const pos = board[blueMoves[i]];
      if (pos && pos.color == "blue" && pos.type == "pawn") return true;
    }
    const greenPawnOffsets: Pos2[] = [
      { x: -1, y: 1 },
      { x: 1, y: 1 },
    ];
    const greenMoves = generateOffsets(pos, greenPawnOffsets);
    for (let i = 0; i < greenMoves.length; i++) {
      const pos = board[greenMoves[i]];
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
  const boardCopy = structuredClone(board);
  updateBoard(boardCopy, move, PlayerColor);
  if (checkKingInCheck(boardCopy, PlayerColor)) return true;
  return false;
}

export function checkKingInCheck(
  board: Board,
  PlayerColor: PlayerColor,
): boolean {
  let kingPos = -1;
  for (let sq = 0; sq < 160; sq++) {
    const piece = board[sq];
    if (piece == null) continue;
    if (piece.type == "king" && piece.color == PlayerColor) kingPos = sq;
  }
  if (checkIsAttacked(board, kingPos, PlayerColor)) return true;
  return false;
}

function checkBounds(i: number): boolean {
  if (i >= 0 && i < 160) return true;
  return false;
}

function checkSquare(
  board: Board,
  sq: number,
  PlayerColor: PlayerColor,
): boolean {
  const newPiece = board[sq];
  if (checkBounds(sq) == false) return false;
  if (
    newPiece == null ||
    (newPiece != null && areOpposingPlayerColors(newPiece.color, PlayerColor))
  ) {
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
