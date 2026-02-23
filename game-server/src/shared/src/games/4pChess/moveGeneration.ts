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
  updateBoard(boardState.board, move, boardState.turn)
  if (boardState.turn == "red") boardState.turn = "blue";
  if (boardState.turn == "blue") boardState.turn = "yellow";
  if (boardState.turn == "yellow") boardState.turn = "green";
  if (boardState.turn == "green") boardState.turn = "red";
}

function updateBoard(board: Board, move: Move, turn: Color)
{
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

export function checkMates(board: Board, turn: Color): GameStatus {
  const moves = generateAllMoves(board, turn);
  if (moves.length == 0) {
	if (checkKingInCheck(board, turn)) {
	  let winner: Color;
	  if (turn == "red" || turn == "yellow") winner = "green";
	  else winner = "red";
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

function isPromotingSqare(sq: number, color: Color): boolean
{
  if (color == "red")
	{
		if(sq > 23 && sq < 38)
			return true
	}
  if (color == "yellow")
	{
		if(sq > 121 && sq < 136)
			return true
	}
	if (color == "green")
	{
		const green_sqares = [0, 8, 16, 27, 41, 55, 69, 83, 97, 111, 125, 136, 144, 152]
		if (green_sqares.includes(sq))
			return true

	}
	if (color == "blue")
	{
		const blue_sqares = [7, 15, 23, 34, 48, 62, 76, 90, 104, 118, 132, 143, 151, 159]
		if (blue_sqares.includes(sq))
		return true

	}
	return false	
}

//Piece Move Generation
function generatePawnMoves(
  board: Board,
  sq: number,
  color: Color,
  hasMoved: boolean,
): Array<Move> {
  const moves: Move[] = [];
  let dirx = 0;
  let diry = 0;
  if (color == "red") dirx = 1;
  if (color == "yellow") dirx = -1;
  if (color == "green") diry = 1;
  if (color == "blue") diry = -1;
  //2 Move
  let newPos = generateOffset(sq, { x: 2 *dirx, y: 2 * diry});
  const newPos2 = generateOffset(sq, { x: dirx, y: diry});
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
	if (isPromotingSqare(newPos, color))
	  moves.push({ from: sq, to: newPos, special: "promotion" });
	else moves.push({ from: sq, to: newPos, special: null });
  }
  //Attacks
  //right
  if (dirx === 0) newPos = generateOffset(sq, { x: 1, y: diry});
  else newPos = generateOffset(sq, { x: dirx, y: 1});
  if (
	newPos != null &&
	checkSqare(board, newPos, color) &&
	!checkSqareEmpty(board, newPos)
  )
  {
	if (isPromotingSqare(newPos, color))
	  moves.push({ from: sq, to: newPos, special: "promotion" });
	else moves.push({ from: sq, to: newPos, special: null });
  }
  //left
  if (dirx === 0) newPos = generateOffset(sq, { x: -1, y: diry});
  else newPos = generateOffset(sq, { x: dirx, y: -1});
  if (
	newPos != null &&
	checkSqare(board, newPos, color) &&
	!checkSqareEmpty(board, newPos)
  )
  {
	if (isPromotingSqare(newPos, color))
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
  color: Color,
  offset: Pos2,
): Array<Move> {
  const moves: Move[] = [];
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

function indexToRowCol(index: number): Pos2 | null
{
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
  return null
}

function RowColToIndex(row: number, col: number): number | null{
  if (row < 0 || row > 13 || col < 0 || col > 13) {
    return null
  }
  if (row <= 2) {
    if (col < 3 || col > 10) {
      return null
    }
    return row * 8 + (col - 3);
  }
  if (row <= 10) {
    return 24 + (row - 3) * 14 + col;
  }
  if (col < 3 || col > 10) {
    return null
  }
  return 136 + (row - 11) * 8 + (col - 3);
}

function generateOffset(pos: number, offset: Pos2): number | null {
  const pos2 = indexToRowCol(pos)
  if (pos2 !== null)
  {
	const new_pos2: Pos2 = { x: pos2.x + offset.x, y: pos2.y + offset.y };
	const new_pos = RowColToIndex(new_pos2.x, new_pos2.y)
	if (new_pos !== null)
		return new_pos;
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

function AreOpposingColors(first: Color, second: Color): boolean
{
	if (first === "green" || first === "blue")
	{
		if (second === "red" || second === "yellow")
			return true
	}
	if (first === "red" || first === "yellow")
	{
		if (second === "green" || second === "blue")
			return true
	}
	return false
}

function CheckIsAttacked(board: Board, pos: number, color: Color) {
  //check for bishops (and half of queens)
  let moves = generateBishopMoves(board, pos, color);
  for (let i = 0; i < moves.length; i++) {
	const pos = board[moves[i].to];
	if (
	  pos &&
	  AreOpposingColors(pos.color, color) &&
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
	  AreOpposingColors(pos.color, color) &&
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
	if (pos && AreOpposingColors(pos.color, color) && pos.type == "king") return true;
  }
  //check for knights
  moves = generateKnightMoves(board, pos, color);
  for (let i = 0; i < moves.length; i++) {
	const pos = board[moves[i].to];
	if (pos && AreOpposingColors(pos.color, color) && pos.type == "knight") return true;
  }
  //check for Pawns
  let pawn_offsets: Array<Pos2> = [
		{ x: 1, y: 1 },
		{ x: -1, y: 1 },
		{ x: 1, y: -1 },
		{ x: -1, y: -1 },
  	]; 
  const pawn_pos = generateOffsets(pos, pawn_offsets);
  for (let i = 0; i < pawn_pos.length; i++) {
	const pos = board[pawn_pos[i]];
	if (pos && AreOpposingColors(pos.color, color) && pos.type == "pawn") return true;
  }
  return false;
}

function checkKingInCheckAfterMove(
  board: Board,
  move: Move,
  color: Color,
): boolean {
  const board_copy = [...board];

  board_copy[move.to] = board_copy[move.from];
  board_copy[move.from] = null;
  let king_pos = -1;
  for (let sq = 0; sq < 64; sq++) {
	const piece = board_copy[sq];
	if (piece == null) continue;
	if (piece.type == "king" && piece.color == color) king_pos = sq;
  }
  if (CheckIsAttacked(board_copy, king_pos, color)) return true;
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