import { Socket } from "socket.io";
import { CToSEvents, SToCEvents} from "../../../shared/socketEvents.js"
import { Game, GameType } from "../../../shared/games/game.js";
import { Chess } from "../../../shared/games/chess/chess.js"
import { Move, Color} from "../../../shared/games/chess/types.js";
import { GameSocket } from "../../server.js";

export type Game_status = "checkmate" | "timeout" | "Stalemate" | "move_played" | null

export class Room {
	Players: GameSocket[]
	AssignedColors : Color[]
	gameLogic : Game
	positionUpdated : boolean = false
	
	//time vars
	timed : boolean
	PlayerTimes : number[]
	last_move : number = 0
	
	constructor(
	  players: GameSocket[], type : GameType)
	{

		this.Players = players
		//change when more gamemodes
		//if (GameType == Chess)
		this.gameLogic = new Chess
		this.AssignedColors = ["white", "black"]
		this.timed = false
		this.PlayerTimes = [-1, -1]

	}
	/**
	 * ClientMove
	 */
	public ClientMove(move : Move, client: GameSocket) {
		let colorPos = -1
		for (let i = 0; i < this.Players.length; i++)
		{
			if (client.id == this.Players[i].id)
				colorPos = i;
		}
		if (colorPos = -1)
			return null
		if (this.gameLogic.playMove(move, this.AssignedColors[colorPos]))
			this.positionUpdated = true
	}

	public CheckForUpdate(time_passed : number) : Game_status
	{
		if (this.timed = true)
		{
			let index = this.AssignedColors.indexOf(this.gameLogic.GetTurn())
			this.PlayerTimes[index] = this.PlayerTimes[index] - time_passed
			if (this.PlayerTimes[index] < 0)
			{
				return "timeout"
			}
			if (this.positionUpdated == true)
			{
				this.positionUpdated = false
				return "move_played"
			}
		}
		return null
	}

	public GetColor(index: number) : Color
	{
		return this.AssignedColors[index]
	}


	
}