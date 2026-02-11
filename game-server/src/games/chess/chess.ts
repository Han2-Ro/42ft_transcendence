import { BoardState, Color, GameStatus, Move} from "shared/dist/src/gameTypes.js"
import {checkKingInCheck, generateAllMoves, validateMove} from "shared/dist/src/games/chess/moveGeneration.js";
import { startingBoardState } from "./constants.js"
import { Game } from "../game.js"

export class Chess extends Game
{
	boardState : BoardState
	GameStatus : GameStatus
	constructor(state? : BoardState)
	{
		super();
		if (state !== undefined)
      		this.boardState = state
		else
			this.boardState = startingBoardState
		this.GameStatus = {isOver : false, winner: null, reason: ""}
	}

	playMove(move : Move, played_by: Color) : boolean
	{
		if (validateMove(move, this.boardState, played_by) == true)
		{
			let piece = this.boardState.board[move.from]
			if (piece) piece.hasMoved = true
			this.boardState.board[move.to] = this.boardState.board[move.from]
			this.boardState.board[move.from] = null
			if (this.boardState.turn == "white")
				this.boardState.turn = "black"
			else
				this.boardState.turn = "white"
			let moves = generateAllMoves(this.boardState.board, this.boardState.turn)
			if (moves.length == 0)
			{
				if (checkKingInCheck(this.boardState.board, this.boardState.turn))
				{
					let winner : Color
					if (this.boardState.turn == "white")
						winner = "black"
					else
						winner = "white"
					this.GameStatus = {isOver : true, winner: winner, reason: "Checkmate"}
				}
				else
					this.GameStatus = {isOver : true, winner: null, reason: "Stalemate"}

			}
			return true
		}
		return false
	}
	playResign(played_by: Color): void {
		let winner : Color
		if (played_by == "white")
			winner = "black"
		else
			winner = "white"
		this.GameStatus = {isOver : true, winner: winner, reason: "Resignation"}
	}

	GetBoardState(): BoardState {
		return this.boardState
	}
	GetTurn(): Color {
		return this.boardState.turn
	}
	GetGameStatus(): GameStatus {
		return this.GameStatus
	}
}
