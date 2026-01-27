import { BoardState, Move} from "./types"
import { startingBoardState } from "./constants"
import { validateMove } from "./moves"

export class Chess
{
	board : BoardState
	constructor()
	{
		this.board = startingBoardState
	}

}
