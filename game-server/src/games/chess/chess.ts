import { BoardState, Color} from "../../../../shared/src/gameTypes.js"
import { startingBoardState } from "./constants.js"
import { PlayMove } from "./moves.js"
import { Game } from "../game.js"

export class Chess extends Game
{
	board : BoardState
	constructor(state? : BoardState)
	{
		super();
		if (state !== undefined)
      		this.board = state
		else
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
