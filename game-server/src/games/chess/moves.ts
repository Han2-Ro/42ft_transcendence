import { Board, BoardState, Color, Move} from "../../../../shared/src/gameTypes.js";
import { Chess } from "./chess.js";


export function PlayMove(this: Chess, move : Move, played_by: Color) : boolean
{
	if (validateMove(move, this.board, played_by) == true)
	{
		this.board.board[move.to] = this.board.board[move.from]
		this.board.board[move.from] = null
		return true
	}
	return false
}


function validateMove(move : Move, board : BoardState, played_by : Color) : boolean
{
	const piece = board.board[move.from];
	if (
	checkBounds(move.from) 
	&& checkBounds(move.to) 
	&& piece !== null 
	&& piece.color == board.turn
	&& board.turn == played_by
	&& generateMoves(board, move.from).includes(move))
	{
		return true
	}
	return false
}

/* export function generateAllMoves(Board : BoardState) : Array<Move>
{
	const moves: Move[] = [];
	for (let sq = 0; sq < 64; sq++) {
		const piece = Board.board[sq];
		if (!piece || piece.color !== Board.turn) continue;
		const pieceMoves = 
			piece.type === 'pawn' ? generatePawnMoves(Board.board, sq, piece.color, piece.hasMoved) :
			piece.type === 'knight' ? generateKnightMoves(Board.board, sq, piece.color) :
			piece.type === 'bishop' ? generateBishopMoves(Board.board, sq, piece.color) :
			piece.type === 'rook' ? generateRookMoves(Board.board, sq, piece.color) :
			piece.type === 'queen' ? generateQueenMoves(Board.board, sq, piece.color) :
			piece.type === 'king' ? generateKingMoves(Board.board, sq, piece.color) :
		[];
		moves.push(...pieceMoves);
	}
	return moves;
} */

export function generateMoves(Board : BoardState, sq : number) : Array<Move>
{
	const moves: Move[] = [];
	const piece = Board.board[sq];
	if (!piece) return moves;
	const pieceMoves = 
		piece.type === 'pawn' ? generatePawnMoves(Board.board, sq, piece.color, piece.hasMoved) :
		piece.type === 'knight' ? generateKnightMoves(Board.board, sq, piece.color) :
		piece.type === 'bishop' ? generateBishopMoves(Board.board, sq, piece.color) :
		piece.type === 'rook' ? generateRookMoves(Board.board, sq, piece.color) :
		piece.type === 'queen' ? generateQueenMoves(Board.board, sq, piece.color) :
		piece.type === 'king' ? generateKingMoves(Board.board, sq, piece.color) :
	[];
	moves.push(...pieceMoves);
	return moves;
}

function checkBounds(i : number) : boolean
{
	if (i >= 0 && i <= 63)
		return true
	return false
}

function checkSqare(board: Board, sq: number, color: Color) : boolean
{
	let newPos = sq
	let new_piece = board[newPos]
	if (checkBounds(newPos) == false)
		return false
	if (new_piece == null || new_piece != null && new_piece.color != color)
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

function generatePawnMoves(board: Board, sq : number, color : Color, hasMoved : boolean) : Array<Move>
{
	const moves: Move[] = [];
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
	const move_offsets : Array<number> = [-10, -17, -15, -6, 10, 17, 15, 6]
	const moves: Move[] = [];
	for (let i = 0; i < move_offsets.length; i++)
	{
		let newPos = sq + move_offsets[i]
		if (checkSqare(board, newPos, color))
			moves.push({ from: sq, to: newPos})
	}
	return moves
}

function generateOffsetLine(board: Board, sq: number, color: Color, offset: number) : Array<Move>
{
	const moves: Move[] = [];
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

function generateBishopMoves(board: Board, sq : number, color : Color) : Array<Move>
{
	const moves: Move[] = [];
	moves.push(...generateOffsetLine(board, sq, color, 7))
	moves.push(...generateOffsetLine(board, sq, color, -7))
	moves.push(...generateOffsetLine(board, sq, color, 9))
	moves.push(...generateOffsetLine(board, sq, color, -9))
	return moves
}

function generateRookMoves(board: Board, sq : number, color : Color) : Array<Move>
{
	const moves: Move[] = [];
	moves.push(...generateOffsetLine(board, sq, color, 8))
	moves.push(...generateOffsetLine(board, sq, color, -8))
	moves.push(...generateOffsetLine(board, sq, color, 1))
	moves.push(...generateOffsetLine(board, sq, color, -1))
	return moves
}

function generateQueenMoves(board: Board, sq : number, color : Color) : Array<Move>
{
	const moves: Move[] = [];
	moves.push(...generateBishopMoves(board, sq, color))
	moves.push(...generateRookMoves(board, sq, color))
	return moves
}

function generateKingMoves(board: Board, sq : number, color : Color) : Array<Move>
{
	const move_offsets : Array<number> = [8, -8, 1, -1, 7, -7, 9, -9]
	const moves: Move[] = [];
	for (let i = 0; i < move_offsets.length; i++)
	{
		let newPos = sq + move_offsets[i]
		if (checkSqare(board, newPos, color))
			moves.push({ from: sq, to: newPos})
	}
	return moves
	//Add Castle
}













