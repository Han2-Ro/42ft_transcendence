import { Move, Color } from "shared/dist/src/gameTypes.js";

import { Game, GameType } from "../games/game.js";
import { Chess } from "../games/chess/chess.js";
import { GameSocket } from "../../server.js";

export type Game_status =
  | "checkmate"
  | "timeout"
  | "Stalemate"
  | "move_played"
  | null;

export class Room {
  Players: GameSocket[];
  AssignedColors: Color[];
  gameLogic: Game;
  positionUpdated: boolean = false;

  //time vars
  timed: boolean;
  PlayerTimes: number[];
  last_move: number = 0;

  constructor(players: GameSocket[], type: GameType, gameId: string) {
    this.Players = players;
    //change when more gamemodes
    //if (GameType == Chess)
    this.gameLogic = new Chess();
    this.AssignedColors = ["white", "black"];
    this.timed = false;
    this.PlayerTimes = [-1, -1];
    this.Players.forEach((value: GameSocket, index: number) => {
      value.emit("game_start", {
        gameId,
        color: this.AssignedColors[index],
        board: this.gameLogic.GetBoardState(),
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

  public ClientResign(client: GameSocket) {
    let colorPos = -1;
    for (let i = 0; i < this.Players.length; i++) {
      if (client.id == this.Players[i].id) colorPos = i;
    }
    if (colorPos == -1) return;
    this.gameLogic.playResign(this.AssignedColors[colorPos]);
  }

  public UpdateAndCheckOver(time_passed: number): boolean {
    //check for timeout
    if (this.timed == true) {
      const TurnIndex = this.AssignedColors.indexOf(this.gameLogic.GetTurn());
      this.PlayerTimes[TurnIndex] = this.PlayerTimes[TurnIndex] - time_passed;
      if (this.PlayerTimes[TurnIndex] < 0) {
        this.Players[TurnIndex].emit("game_over", {
          result: "lose",
          reason: "timeout",
        });
        this.Players.forEach((value: GameSocket, index: number) => {
          if (index !== TurnIndex)
            value.emit("game_over", { result: "win", reason: "timeout" });
        });
        return true;
      }
    }
    //Check if game is Over
    if (this.gameLogic.GetGameStatus().isOver === true) {
      const result = this.gameLogic.GetGameStatus();
      const winner = result.winner;
      if (winner != null) {
        const WinnerIndex = this.AssignedColors.indexOf(winner);
        this.Players.forEach((value: GameSocket, index: number) => {
          if (index == WinnerIndex)
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
    if (this.positionUpdated == true) {
      this.positionUpdated = false;
      this.Players.forEach((value: GameSocket) => {
        value.emit("move_made", { board: this.gameLogic.GetBoardState() });
      });
    }
    return false;
  }

  public GetColor(index: number): Color {
    return this.AssignedColors[index];
  }
}
