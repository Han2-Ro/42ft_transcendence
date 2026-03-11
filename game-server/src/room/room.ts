import { Move, PlayerColor, Games } from "shared";

import { Game } from "../games/game.js";
import { Chess } from "../games/chess/chess.js";
import { FourPlayerChess } from "../games/4pChess/4pChess.js";
import { GameSocket } from "../../server.js";

export type Game_status =
  | "checkmate"
  | "timeout"
  | "Stalemate"
  | "move_played"
  | null;

export class Room {
  Players: GameSocket[];
  AssignedColors: PlayerColor[];
  gameLogic: Game;
  positionUpdated: boolean = false;

  //time vars
  timed: boolean;
  PlayerTimes: number[];
  last_move: number = 0;

  constructor(players: GameSocket[], type: Games, gameId: string) {
  this.Players = players;
  	if (type == "chess" || type == "timedChess") {
      this.gameLogic = new Chess();
      this.AssignedColors = this.GenerateRandomColors2p();
      if (type == "timedChess") {
        this.timed = true;
        this.PlayerTimes = [10, 10];
      } else {
        this.timed = false;
        this.PlayerTimes = [-1, -1];
      }
    } else {
      this.gameLogic = new FourPlayerChess();
      this.AssignedColors = this.GenerateRandomColors4p();
      if (type == "4pTimedChess") {
        this.timed = true;
        this.PlayerTimes = [10, 10, 10, 10];
      } else {
        this.timed = false;
        this.PlayerTimes = [-1, -1, -1, -1];
      }
    }
    this.Players.forEach((value: GameSocket, index: number) => {
      value.emit("game_start", {
        gameId,
		type,
        color: this.AssignedColors[index],
        boardState: this.gameLogic.boardState,
      });
    });
  }
  public ClientMove(move: Move, client: GameSocket) {
    let colorPos = -1;
    for (let i = 0; i < this.Players.length; i++) {
      if (client.id == this.Players[i].id) colorPos = i;
    }
    if (colorPos == -1) return;
    if (this.gameLogic.playMove(move, this.AssignedColors[colorPos])) {
      this.positionUpdated = true;
    }
  }

  public clientResign(client: GameSocket) {
    let colorPos = -1;
    for (let i = 0; i < this.Players.length; i++) {
      if (client.id == this.Players[i].id) colorPos = i;
    }
    if (colorPos == -1) return;
    this.gameLogic.playResign(this.AssignedColors[colorPos]);
  }

  public UpdateAndCheckOver(time_passed: number): boolean {
    if (this.positionUpdated == true) {
      this.positionUpdated = false;
      this.Players.forEach((value: GameSocket) => {
        value.emit("move_made", { boardState: this.gameLogic.boardState });
      });
    }
	this.CheckTimeout(time_passed)
    if (this.CheckGameOver() == true) return true
    return false;
  }

  private CheckTimeout(time_passed : number) {
    if (this.timed == true) {
      const turnIndex = this.AssignedColors.indexOf(
        this.gameLogic.boardState.turn,
      );
      this.PlayerTimes[turnIndex] = this.PlayerTimes[turnIndex] - time_passed;
      if (this.PlayerTimes[turnIndex] < 0) {
		this.gameLogic.timeout(this.GetColor(turnIndex))
      }
    }
  }

  private CheckGameOver(): boolean {
	if (this.gameLogic.gameStatus.isOver) {
      const result = this.gameLogic.gameStatus;
      const winners = result.winners;
      if (winners != null) {
        let winnerIndexes : number[] = []
		winners.forEach((value: PlayerColor) => {
			const index = this.AssignedColors.indexOf(value)
			if (index >= 0)
				winnerIndexes.push(index);
		}
		)
		console.log("winners: ", winnerIndexes)
        this.Players.forEach((value: GameSocket, index: number) => {
			console.log(index)
          if (winnerIndexes.includes(index))
            value.emit("game_over", { result: "win", reason: result.reason });
          else
            value.emit("game_over", { result: "lose", reason: result.reason });
        });
      } else {
        this.Players.forEach((value: GameSocket) => {
          value.emit("game_over", { result: "draw", reason: result.reason });
        });
      }
      return true;
    }
	return false;
  }

  public GetColor(index: number): PlayerColor {
    return this.AssignedColors[index];
  }

  private shuffleArray<T>(array: T[]): T[] {
    const length = array.length;
    for (let i = length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  private GenerateRandomColors2p(): PlayerColor[] {
    const colors: PlayerColor[] = ["white", "black"];
    return this.shuffleArray(colors);
  }

  private GenerateRandomColors4p(): PlayerColor[] {
    const colors: PlayerColor[] = ["green", "blue", "red", "yellow"];
    return this.shuffleArray(colors);
  }
}
