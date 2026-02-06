import { Board, BoardState, Color, Move, PieceOrNull, PieceType} from "../../gameTypes";

export function validateMove(move : Move, board : BoardState, played_by : Color) : boolean
{
	const piece = board.board[move.from];
	if (
	checkBounds(move.from) 
	&& checkBounds(move.to) 
	&& piece !== null 
	&& piece.color == board.turn
	&& board.turn == played_by
	&& generateMoves(board.board, move.from).includes(move))
	{
		return true
	}
	return false
}

export function generateMovesNumber(board : Board, sq : number) : Array<number>
{
	let moves = generateMoves(board, sq)
	return moves.map(move => move.to)
}

export function generateMoves(board : Board, sq : number) : Array<Move>
{
	let moves: Move[] = [];

	let piece : PieceOrNull = board[sq];
	if (!piece) return moves;
	let pieceMoves = 
		piece.type === 'pawn' ? generatePawnMoves(board, sq, piece.color, piece.hasMoved) :
		piece.type === 'knight' ? generateKnightMoves(board, sq, piece.color) :
		piece.type === 'bishop' ? generateBishopMoves(board, sq, piece.color) :
		piece.type === 'rook' ? generateRookMoves(board, sq, piece.color) :
		piece.type === 'queen' ? generateQueenMoves(board, sq, piece.color) :
		piece.type === 'king' ? generateKingMoves(board, sq, piece.color) :
		[];
	moves.push(...pieceMoves);
/* 	for (let i = 0; i < moves.length; i++)
	{
		if (checkKingInCheck(board, moves[i], piece.color))
			moves.splice(i, 1)
	} */
	return moves;
}

//Piece Move Generation
function generatePawnMoves(board: Board, sq : number, color : Color, hasMoved : boolean) : Array<Move>
{
	let moves: Move[] = [];
	let dir = 1
	if (color == "white")
		dir = -1
	//2 Move
	let newPos = sq + (16 * dir)
	if (hasMoved == false)
		if (checkSqareEmpty(board, newPos))
			moves.push({ from: sq, to: newPos})
	//Move
	newPos = sq + (8 * dir)
	if (checkSqareEmpty(board, newPos))
		moves.push({ from: sq, to: newPos })
	//Attacks
	newPos = sq + (9 * dir)
	if (checkSqare(board, newPos, color) && !checkSqareEmpty(board, newPos))
		moves.push({ from: sq, to: newPos })
	newPos = sq + (7 * dir)
	if (checkSqare(board, newPos, color) && !checkSqareEmpty(board, newPos))
		moves.push({ from: sq, to: newPos })
	return moves
}

function generateKnightMoves(board: Board, sq : number, color : Color) : Array<Move>
{
	let move_offsets : Array<number> = [-10, -17, -15, -6, 10, 17, 15, 6]
	let moves: Move[] = [];
	for (let i = 0; i < move_offsets.length; i++)
	{
		let newPos = sq + move_offsets[i]
		if (checkSqare(board, newPos, color))
			moves.push({ from: sq, to: newPos})
	}
	return moves
}

function generateBishopMoves(board: Board, sq : number, color : Color) : Array<Move>
{
	let moves: Move[] = [];
	moves.push(...generateOffsetLine(board, sq, color, 7))
	moves.push(...generateOffsetLine(board, sq, color, -7))
	moves.push(...generateOffsetLine(board, sq, color, 9))
	moves.push(...generateOffsetLine(board, sq, color, -9))
	return moves
}

function generateRookMoves(board: Board, sq : number, color : Color) : Array<Move>
{
	let moves: Move[] = [];
	moves.push(...generateOffsetLine(board, sq, color, 8))
	moves.push(...generateOffsetLine(board, sq, color, -8))
	moves.push(...generateOffsetLine(board, sq, color, 1))
	moves.push(...generateOffsetLine(board, sq, color, -1))
	return moves
}

function generateQueenMoves(board: Board, sq : number, color : Color) : Array<Move>
{
	let moves: Move[] = [];
	moves.push(...generateBishopMoves(board, sq, color))
	moves.push(...generateRookMoves(board, sq, color))
	return moves
}

function generateKingMoves(board: Board, sq : number, color : Color) : Array<Move>
{
	let move_offsets : Array<number> = [8, -8, 1, -1, 7, -7, 9, -9]
	let moves: Move[] = [];
	for (let i = 0; i < move_offsets.length; i++)
	{
		let newPos = sq + move_offsets[i]
		if (checkSqare(board, newPos, color))
			moves.push({ from: sq, to: newPos})
	}
	return moves
	//Add Castle
}

//helpers
function generateOffsetLine(board: Board, sq: number, color: Color, offset: number) : Array<Move>
{
	let moves: Move[] = [];
	let newPos = sq + offset
	while (checkSqareEmpty(board, newPos))
	{
		moves.push({ from: sq, to: newPos})
		newPos = newPos + offset
	}
	if (checkSqare(board, newPos, color))
	{
		moves.push({ from: sq, to: newPos})
	}
	return moves
}

function CheckOffsetLinePiece(board: Board, sq: number, color: Color, offset: number, type : PieceType) : boolean
{
	let newPos = sq + offset
	while (checkSqareEmpty(board, newPos))
	{
		newPos = newPos + offset
	}
	if (checkSqarePiece(board, newPos, color, type))
	{
		return false
	}
	return true
}

function checkKingInCheck(board: Board, move: Move, color: Color) : boolean
{
	board[move.to] = board[move.from]
	board[move.from] = null
	let king_pos = -1
	for (let sq = 0; sq < 64; sq++) {
		let piece = board[sq];
		if (piece == null)
			continue
		if (piece.type == "king" && piece.color == color)
			king_pos = sq
	}
	//check for knights
	const knight_offsets : Array<number> = [-10, -17, -15, -6, 10, 17, 15, 6]
	for (let i = 0; i < knight_offsets.length; i++)
	{
		let newPos = king_pos + knight_offsets[i]
		if (checkSqarePiece(board, newPos, color, "knight"))
			return false
	}
	//check for kings
	const king_offsets : Array<number> = [8, -8, 1, -1, 7, -7, 9, -9]
	for (let i = 0; i < king_offsets.length; i++)
	{
		let newPos = king_pos + king_offsets[i]
		if (checkSqarePiece(board, newPos, color, "king"))
			return false
	}
	//check for Pawns
	let dir = 1
	if (color == "black")
		dir = -1
	const pawn_offsets : Array<number> = [(9 * dir), (7* dir)]
	for (let i = 0; i < pawn_offsets.length; i++)
	{
		let newPos = king_pos + pawn_offsets[i]
		if (checkSqarePiece(board, newPos, color, "pawn"))
			return false
	}
	//check for bishops
	const bishop_offset_lines : Array<number> = [7, -7, 9, -9]
	for (let i = 0; i < bishop_offset_lines.length; i++)
	{
		if (CheckOffsetLinePiece(board, king_pos, color, bishop_offset_lines[i], "bishop"))
			return false
	}
	//check for rooks
	const rook_offset_lines :  Array<number> = [8, -8, 1, -1]
	for (let i = 0; i < rook_offset_lines.length; i++)
	{
		if (CheckOffsetLinePiece(board, king_pos, color, rook_offset_lines[i], "rook"))
			return false
	}
	//check for queens
	const Queen_offset_lines : Array<number> = [8, -8, 1, -1, 7, -7, 9, -9]
	for (let i = 0; i < Queen_offset_lines.length; i++)
	{
		if (CheckOffsetLinePiece(board, king_pos, color, Queen_offset_lines[i], "queen"))
			return false
	}
	return true
}


function checkBounds(i : number) : boolean
{
	if (i >= 0 && i <= 63)
		return true
	return false
}

function checkSqare(board: Board, sq: number, color: Color) : boolean
{
	let new_piece = board[sq]
	if (checkBounds(sq) == false)
		return false
	if (new_piece == null || new_piece != null && new_piece.color != color)
	{
		return true
	}
	return false
}

function checkSqarePiece(board: Board, sq: number, color: Color, type : PieceType) : boolean
{
	let new_piece = board[sq]
	if (checkBounds(sq) == false)
		return false
	if (new_piece != null && new_piece.color != color && new_piece.type == type)
	{
		return true
	}
	return false
}


function checkSqareEmpty(board: Board, sq: number) : boolean
{
	let newPos = sq
	let new_piece = board[newPos]
	if (checkBounds(newPos) == false)
		return false
	if (new_piece == null)
	{
		return true
	}
	return false
}