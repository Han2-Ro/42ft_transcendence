import { Board, BoardState, Color, Move, Square} from "./types";

export function validateMove(move : Move, board : BoardState) : boolean
{
	if (
	checkBounds(move.from) 
	&& checkBounds(move.to) 
	&& board.board[move.from] != null 
	&& board.board[move.from].color == board.turn
	&& generateMoves(board, move.from).includes(move)
		)
	{
		return true
	}
	return false
}

export function generateAllMoves(Board : BoardState) : Array<Move>
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
}

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

function generatePawnMoves(board: Board, sq : number, color : Color, hasMoved : boolean) : Array<Move>
{
	const moves: Move[] = [];
	let dir = 1
	if (color == "white")
		dir = -1
	//2 Move
	if (hasMoved == false)
		if (board[sq + (16 * dir)] == null)
			moves.push({ from: sq, to: sq + (16 * dir) })
	//Move
	if (checkBounds(sq + (8 * dir)) && board[sq + (8 * dir)] == null)
		moves.push({ from: sq, to: sq + (8 * dir) })
	//Attacks
	if (checkBounds(sq + (9 * dir)) && board[sq + (9 * dir)] !== null && board[sq + (9 * dir)].color != color)
		moves.push({ from: sq, to: sq + (9 * dir) })
	if (checkBounds(sq + (7 * dir)) && board[sq + (7 * dir)] !== null && board[sq + (7 * dir)].color != color)
		moves.push({ from: sq, to: sq + (7 * dir) })
	return moves
}

function generateKnightMoves(board: Board, sq : number, color : Color) : Array<Move>
{
	const move_offsets : Array<number> = [-10, -17, -15, -6, 10, 17, 15, 6]
	const moves: Move[] = [];
	for (let i = 0; i < move_offsets.length; i++)
	{
		let newPos = sq + move_offsets[i]
		if (checkBounds(newPos) && board[newPos] == null || board[newPos].color != color)
			moves.push({ from: sq, to: newPos})
	}
	return moves
}

function generateBishopMoves(board: Board, sq : number, color : Color) : Array<Move>
{
	const moves: Move[] = [];
	let newPos = sq
	while (checkBounds(newPos + 7) && board[newPos] == null || board[newPos].color != color)
		moves.push({ from: sq, to: newPos})
	newPos = sq
	while (checkBounds(newPos - 7) && board[newPos] == null || board[newPos].color != color)
		moves.push({ from: sq, to: newPos})
	newPos = sq
	while (checkBounds(newPos + 9) && board[newPos] == null || board[newPos].color != color)
		moves.push({ from: sq, to: newPos})
	newPos = sq
	while (checkBounds(newPos - 9) && board[newPos] == null || board[newPos].color != color)
		moves.push({ from: sq, to: newPos})
	return moves
}

function generateRookMoves(board: Board, sq : number, color : Color) : Array<Move>
{
	const moves: Move[] = [];
	let newPos = sq + 8
	while (checkBounds(newPos) && board[newPos] == null || board[newPos].color != color)
		moves.push({ from: sq, to: newPos})
		newPos = newPos + 8
	newPos = sq -8
	while (checkBounds(newPos) && board[newPos] == null || board[newPos].color != color)
		moves.push({ from: sq, to: newPos})
		newPos = newPos - 8
	newPos = sq + 1
	while (checkBounds(newPos) && board[newPos] == null || board[newPos].color != color)
		moves.push({ from: sq, to: newPos})
		newPos = newPos + 1
	newPos = sq -1
	while (checkBounds(newPos) && board[newPos] == null || board[newPos].color != color)
		moves.push({ from: sq, to: newPos})
		newPos = newPos - 1
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
	const moves: Move[] = [];
	if (checkBounds(sq + 8) && board[sq + 8] == null || board[sq + 8].color != color)
		moves.push({ from: sq, to: sq + 8})
	while (checkBounds(sq - 8) && board[sq - 8] == null || board[sq - 8].color != color)
		moves.push({ from: sq, to: sq - 8})
	while (checkBounds(sq + 1) && board[sq + 1] == null || board[sq + 1].color != color)
		moves.push({ from: sq, to: sq + 1})
	while (checkBounds(sq - 1) && board[sq - 1] == null || board[sq - 1].color != color)
		moves.push({ from: sq, to: sq - 1})
	return moves
	//Add Castle
}













