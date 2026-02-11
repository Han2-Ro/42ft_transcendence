import { Board, BoardState, Color, Move, PieceOrNull, PieceType, Pos2} from "../../gameTypes";

export function validateMove(move : Move, boardState : BoardState, played_by : Color) : boolean
{
	const piece = boardState.board[move.from];
	let moves = generateMoves(boardState.board, move.from)
	const moveExists = moves.some(m => m.from === move.from && m.to === move.to);
	if (
	checkBounds(move.from) 
	&& checkBounds(move.to) 
	&& piece !== null 
	&& piece.color == boardState.turn
	&& boardState.turn == played_by
	&& moveExists
	)
	{
		return true
	}
	return false
}

export function updateBoard(board : Board, move : Move)
{
	let piece = this.boardState.board[move.from]
	if (piece) piece.hasMoved = true
	if (move.special = false)
	{
		this.boardState.board[move.to] = this.boardState.board[move.from]
		this.boardState.board[move.from] = null
	}
	else
	{

	}
}

export function generateMovesNumber(board : Board, sq : number) : Array<number>
{
	let moves = generateMoves(board, sq)
	return moves.map(move => move.to)
}

export function generateAllMoves(board : Board, color: Color) : Array<Move>
{
	let moves: Move[] = [];
	for (let sq = 0; sq < 64; sq++) {
		const piece = board[sq];
		if (!piece || piece.color !== color) continue;
		let pieceMoves = generateMoves(board, sq)
		moves.push(...pieceMoves);
	}
	return moves;
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
	moves = moves.filter(move => !checkKingInCheckAfterMove(board, move, piece.color))
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
			moves.push({ from: sq, to: newPos, special: false})
	//Move
	newPos = generateOffset(sq, {x: 0, y: dir})
	if (newPos != null && checkSqareEmpty(board, newPos))
	{
		if ((color == "white" && newPos > 0 && newPos < 8) || (color == "black" && newPos > 55 && newPos < 64))
			moves.push({ from: sq, to: newPos, special: true})
		else
			moves.push({ from: sq, to: newPos, special: false})
	}
	//Attacks
	newPos = generateOffset(sq, {x: 1, y: dir})
	if (newPos != null && checkSqare(board, newPos, color) && !checkSqareEmpty(board, newPos))
		moves.push({ from: sq, to: newPos, special: false})
	newPos = generateOffset(sq, {x: -1, y: dir})
	if (newPos != null && checkSqare(board, newPos, color) && !checkSqareEmpty(board, newPos))
		moves.push({ from: sq, to: newPos, special: false})
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
			moves.push({ from: sq, to: newPos, special: false})
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

function checkSqaresEmptyAndNotAttacked(board: Board, sqs : Array<number>, color : Color) : boolean
{
	for (let i = 0; i < sqs.length; i++)
	{
		if (CheckIsAttacked(board, sqs[i], color) || !checkSqareEmpty(board, 60))
			return false
	}
	return true
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
			moves.push({ from: sq, to: newPos, special: false})
	}
	//Add Castle
	if (board[sq].hasMoved == false)
	{
		if (board[sq].color == "white")
		{
			const left_rook = board[56]
			const left_king_movements : Array<number> = [60, 59, 58]
			if (left_rook != null 
			&& left_rook.type == "rook" 
			&& left_rook.hasMoved == false
			&& checkSqaresEmptyAndNotAttacked(board, left_king_movements, "white"))
			{
				moves.push({ from: sq, to: 58, special: true})
			}
			let right_rook = board[63]
			let right_king_movements : Array<number> = [60, 61, 62]
			if (right_rook != null 
			&& right_rook.type == "rook" 
			&& right_rook.hasMoved == false
			&& checkSqaresEmptyAndNotAttacked(board, right_king_movements, "white"))
			{
				moves.push({ from: sq, to: 62, special: true})
			}
		}
		else
		{
			const left_rook = board[0]
			const left_king_movements : Array<number> = [4, 3, 2]
			if (left_rook != null 
			&& left_rook.type == "rook" 
			&& left_rook.hasMoved == false
			&& checkSqaresEmptyAndNotAttacked(board, left_king_movements, "black"))
			{
				moves.push({ from: sq, to: 58, special: true})
			}
			const right_rook = board[7]
			const right_king_movements : Array<number> = [4, 5, 6]
			if (right_rook != null 
			&& right_rook.type == "rook" 
			&& right_rook.hasMoved == false
			&& checkSqaresEmptyAndNotAttacked(board, right_king_movements, "black"))
			{
				moves.push({ from: sq, to: 62, special: true})
			}
		}
	}
	return moves
}

//helpers
function generateOffsetLine(board: Board, sq: number, color: Color, offset: Pos2) : Array<Move>
{
	let moves: Move[] = [];
	//let newPos = sq + offset
	let newPos = generateOffset(sq, offset)
	while (newPos != null && checkSqareEmpty(board, newPos))
	{
		moves.push({ from: sq, to: newPos, special: false})
		newPos = generateOffset(newPos, offset)
	}
	if (newPos != null && checkSqare(board, newPos, color))
	{
		moves.push({ from: sq, to: newPos, special: false})
	}
	return moves
}

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

function checkKingInCheckAfterMove(board: Board, move: Move, color: Color) : boolean
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
		return true
	return false
}

export function checkKingInCheck(board: Board, color: Color) : boolean
{
	let king_pos = -1
	for (let sq = 0; sq < 64; sq++) {
		let piece = board[sq];
		if (piece == null)
			continue
		if (piece.type == "king" && piece.color == color)
			king_pos = sq
	}
	if (CheckIsAttacked(board, king_pos, color))
		return true
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