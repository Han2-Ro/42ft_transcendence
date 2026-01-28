import { BoardState, Color} from "./types.js"
import { startingBoardState } from "./constants.js"
import { PlayMove } from "./moves.js"
import { Game } from "../game.js"
import { GameStartData } from "../../socketEvents.js"

export class Chess extends Game
{
	board : BoardState
	constructor()
	{
		super();
		this.board = startingBoardState
	}
	public playMove = PlayMove.bind(this)
	GetBoardState(): BoardState {
		return this.board
	}
	GetTurn(): Color {
		return this.board.turn
	}
}
