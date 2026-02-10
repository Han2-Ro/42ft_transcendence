import { Board, BoardState, Color, Move, PieceOrNull, PieceType, Pos2} from "../../gameTypes";

export function validateMove(move : Move, board : BoardState, played_by : Color) : boolean
{
	const piece = board.board[move.from];
	let moves = generateMoves(board.board, move.from)
	const moveExists = moves.some(m => m.from === move.from && m.to === move.to);
	if (
	checkBounds(move.from) 
	&& checkBounds(move.to) 
	&& piece !== null 
	&& piece.color == board.turn
	&& board.turn == played_by
	&& moveExists
	)
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
	moves = moves.filter(move => !checkKingInCheck(board, move, piece.color))
	return moves;
}

function generateOffset(pos : number, offset :Pos2) : number | null
{
	let pos2 : Pos2 = {x: -1, y: -1}
	pos2.x = (pos % 8) + 1
	pos2.y	 = Math.floor(pos / 8) + 1
	let new_pos : Pos2 = {x: (pos2.x + offset.x), y: (pos2.y + offset.y)}
	if (new_pos.x > 0 && new_pos.x <= 8 && new_pos.y > 0 && new_pos.y <= 8)
			return (((new_pos.y -1) * 8) + (new_pos.x -1))
	return null
}

function generateOffsets(pos : number, offsets :Array<Pos2>) : Array<number>
{
	let num_offsets: number[] = [];
	for (let i = 0; i < offsets.length; i++)
	{
		let num = generateOffset(pos, offsets[i])
		if (num !== null)
			num_offsets.push(num)
	}
	return num_offsets
}

//Piece Move Generation
function generatePawnMoves(board: Board, sq : number, color : Color, hasMoved : boolean) : Array<Move>
{
	let moves: Move[] = [];
	let dir = 1
	if (color == "white")
		dir = -1
	//2 Move
	let newPos = generateOffset(sq, {x: 0, y: 2 * dir})
	let newPos2 = generateOffset(sq, {x: 0, y: dir})
	if (hasMoved == false)
		if (newPos != null && newPos2 != null && checkSqareEmpty(board, newPos) && checkSqareEmpty(board, newPos2))
			moves.push({ from: sq, to: newPos})
	//Move
	newPos = generateOffset(sq, {x: 0, y: dir})
	if (newPos != null && checkSqareEmpty(board, newPos))
		moves.push({ from: sq, to: newPos })
	//Attacks
	newPos = generateOffset(sq, {x: 1, y: dir})
	if (newPos != null && checkSqare(board, newPos, color) && !checkSqareEmpty(board, newPos))
		moves.push({ from: sq, to: newPos })
	newPos = generateOffset(sq, {x: -1, y: dir})
	if (newPos != null && checkSqare(board, newPos, color) && !checkSqareEmpty(board, newPos))
		moves.push({ from: sq, to: newPos })
	return moves
}

function generateKnightMoves(board: Board, sq : number, color : Color) : Array<Move>
{
	let moves: Move[] = [];
	let move_offsets : Array<Pos2> = [{x: 1, y: 2}, {x: -1, y: 2}, {x: 1, y: -2}, {x: -1, y: -2}, {x: 2, y: 1}, {x: -2, y: 1}, {x: 2, y: -1}, {x: -2, y: -1}]
	let move_pos = generateOffsets(sq, move_offsets)
	for (let i = 0; i < move_pos.length; i++)
	{
		let newPos = move_pos[i]
		if (checkSqare(board, newPos, color))
			moves.push({ from: sq, to: newPos})
	}
	return moves
}

function generateBishopMoves(board: Board, sq : number, color : Color) : Array<Move>
{
	let moves: Move[] = [];
	moves.push(...generateOffsetLine(board, sq, color, {x: 1, y: 1}))
	moves.push(...generateOffsetLine(board, sq, color, {x: 1, y: -1}))
	moves.push(...generateOffsetLine(board, sq, color, {x: -1, y: 1}))
	moves.push(...generateOffsetLine(board, sq, color, {x: -1, y: -1}))
	return moves
}

function generateRookMoves(board: Board, sq : number, color : Color) : Array<Move>
{
	let moves: Move[] = [];
	moves.push(...generateOffsetLine(board, sq, color, {x: 1, y: 0}))
	moves.push(...generateOffsetLine(board, sq, color, {x: -1, y: 0}))
	moves.push(...generateOffsetLine(board, sq, color, {x: 0, y: 1}))
	moves.push(...generateOffsetLine(board, sq, color, {x: 0, y: -1}))
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
	let moves: Move[] = [];
	let move_offsets : Array<Pos2> = [{x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: -1, y: 0}, {x: 0, y: -1}, {x: -1, y: -1}, {x: -1, y: 1}, {x: 1, y: -1}]
	let move_pos = generateOffsets(sq, move_offsets)
	for (let i = 0; i < move_pos.length; i++)
	{
		let newPos = move_pos[i]
		if (checkSqare(board, newPos, color))
			moves.push({ from: sq, to: newPos})
	}
	return moves
	//Add Castle
}

//helpers
function generateOffsetLine(board: Board, sq: number, color: Color, offset: Pos2) : Array<Move>
{
	let moves: Move[] = [];
	//let newPos = sq + offset
	let newPos = generateOffset(sq, offset)
	while (newPos != null && checkSqareEmpty(board, newPos))
	{
		moves.push({ from: sq, to: newPos})
		newPos = generateOffset(newPos, offset)
	}
	if (newPos != null && checkSqare(board, newPos, color))
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

/* function CheckIsAttacked(board: Board, pos : number, color: Color)
{
	//check for knights
	const knight_offsets : Array<number> = [-10, -17, -15, -6, 10, 17, 15, 6]
	for (let i = 0; i < knight_offsets.length; i++)
	{
		let newPos = pos + knight_offsets[i]
		if (checkSqarePiece(board, newPos, color, "knight"))
			return true
	}
	//check for kings
	const king_offsets : Array<number> = [8, -8, 1, -1, 7, -7, 9, -9]
	for (let i = 0; i < king_offsets.length; i++)
	{
		let newPos = pos + king_offsets[i]
		if (checkSqarePiece(board, newPos, color, "king"))
			return true
	}
	//check for Pawns
	let dir = 1
	if (color == "black")
		dir = -1
	const pawn_offsets : Array<number> = [(9 * dir), (7* dir)]
	for (let i = 0; i < pawn_offsets.length; i++)
	{
		let newPos = pos + pawn_offsets[i]
		if (checkSqarePiece(board, newPos, color, "pawn"))
			return true
	}
	//check for bishops
	const bishop_offset_lines : Array<number> = [7, -7, 9, -9]
	for (let i = 0; i < bishop_offset_lines.length; i++)
	{
		if (CheckOffsetLinePiece(board, pos, color, bishop_offset_lines[i], "bishop"))
			return true
	}
	//check for rooks
	const rook_offset_lines :  Array<number> = [8, -8, 1, -1]
	for (let i = 0; i < rook_offset_lines.length; i++)
	{
		if (CheckOffsetLinePiece(board, pos, color, rook_offset_lines[i], "rook"))
			return true
	}
	//check for queens
	const Queen_offset_lines : Array<number> = [8, -8, 1, -1, 7, -7, 9, -9]
	for (let i = 0; i < Queen_offset_lines.length; i++)
	{
		if (CheckOffsetLinePiece(board, pos, color, Queen_offset_lines[i], "queen"))
			return true
	}
	return false
} */

function CheckIsAttacked(board: Board, pos : number, color: Color)
{
	let moves = generateBishopMoves(board, pos, color)
	for (let i = 0; i < moves.length; i++)
	{
		let pos = board[moves[i].to]
		if (pos && pos.color != color && (pos.type == "bishop" || pos.type == "queen"))
			return true
	}
	moves = generateRookMoves(board, pos, color)
	for (let i = 0; i < moves.length; i++)
	{
		let pos = board[moves[i].to]
		if (pos && pos.color != color && (pos.type == "rook" || pos.type == "queen"))
			return true
	}
	moves = generateKingMoves(board, pos, color)
	for (let i = 0; i < moves.length; i++)
	{
		let pos = board[moves[i].to]
		if (pos && pos.color != color && pos.type == "king")
			return true
	}
	moves = generateKnightMoves(board, pos, color)
	for (let i = 0; i < moves.length; i++)
	{
		let pos = board[moves[i].to]
		if (pos && pos.color != color && pos.type == "knight")
			return true
	}
	//check for Pawns
	let dir = -1
	if (color == "black")
		dir = 1
	const pawn_offsets : Array<Pos2> = [{x: 1, y: dir}, {x: -1, y: dir}]
	let pawn_pos = generateOffsets(pos, pawn_offsets)
	for (let i = 0; i < pawn_pos.length; i++)
	{
		let newPos = pawn_pos[i]
		if (checkSqarePiece(board, newPos, color, "pawn"))
			return true
	}
	return false
}

function checkKingInCheck(board: Board, move: Move, color: Color) : boolean
{
	let board_copy = [...board]

	board_copy[move.to] = board_copy[move.from]
	board_copy[move.from] = null
	let king_pos = -1
	for (let sq = 0; sq < 64; sq++) {
		let piece = board_copy[sq];
		if (piece == null)
			continue
		if (piece.type == "king" && piece.color == color)
			king_pos = sq
	}
	if (CheckIsAttacked(board_copy, king_pos, color))
	{
		console.log("King is being attacked")
		console.log(board_copy)
		console.log(king_pos)
		return true
	}
	return false
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