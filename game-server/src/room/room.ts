import { Move, PlayerColor, Games } from "shared";

import { Game } from "../games/game.js";
import { Chess } from "../games/chess/chess.js";
import { FourPlayerChess } from "../games/4pChess/4pChess.js";
import { GameSocket, Player } from "../../server.js";

export type GameStatus =
  | "checkmate"
  | "timeout"
  | "Stalemate"
  | "move_played"
  | null;

export class Room {
  Players: Player[];
  uids: string[];
  AssignedColors: PlayerColor[];
  gameLogic: Game;
  gameType: Games;
  positionUpdated: boolean = false;

  //time vars
  timed: boolean;
  PlayerTimes: number[];
  last_move: number = 0;

  constructor(players: Player[], uids: string[], type: Games, gameId: string) {
    this.Players = players;
    this.uids = uids;
    this.gameType = type;
    if (type == "chess" || type == "timedChess") {
      this.gameLogic = new Chess();
      this.AssignedColors = this.generateRandomColors2p();
      if (type == "timedChess") {
        this.timed = true;
        this.PlayerTimes = [10, 10];
      } else {
        this.timed = false;
        this.PlayerTimes = [-1, -1];
      }
    } else {
      this.gameLogic = new FourPlayerChess();
      this.AssignedColors = this.generateRandomColors4p();
      if (type == "4pTimedChess") {
        this.timed = true;
        this.PlayerTimes = [10, 10, 10, 10];
      } else {
        this.timed = false;
        this.PlayerTimes = [-1, -1, -1, -1];
      }
    }
    this.Players.forEach((value: Player, index: number) => {
      value.sockets.forEach((value: GameSocket) => {
        value.emit("gameStart", {
          gameId,
          type,
          color: this.AssignedColors[index],
          boardState: this.gameLogic.boardState,
        });
      });
    });
  }
  public clientMove(move: Move, uid: string) {
    let colorPos = -1;
    for (let i = 0; i < this.Players.length; i++) {
      if (uid == this.uids[i]) colorPos = i;
    }
    if (colorPos == -1) return;
    if (this.gameLogic.playMove(move, this.AssignedColors[colorPos])) {
      this.positionUpdated = true;
    }
  }

  public syncState(socket: GameSocket, uid: string, gameId: string) {
    const playerIndex = this.uids.findIndex((u) => u === uid);
    if (playerIndex === -1) return;
    socket.emit("gameStart", {
      gameId,
      type: this.gameType,
      color: this.AssignedColors[playerIndex],
      boardState: this.gameLogic.boardState,
    });
  }

  public clientResign(uid: string) {
    let colorPos = -1;
    for (let i = 0; i < this.Players.length; i++) {
      if (uid == this.uids[i]) colorPos = i;
    }
    if (colorPos == -1) return;
    this.gameLogic.playResign(this.AssignedColors[colorPos]);
  }

  public clientDisconnect(uid: string) {
    let colorPos = -1;
    for (let i = 0; i < this.Players.length; i++) {
      if (uid == this.uids[i]) colorPos = i;
    }
    if (colorPos == -1) return;
    this.gameLogic.disconnect(this.AssignedColors[colorPos]);
  }

  public updateAndCheckOver(time_passed: number): boolean {
    if (this.positionUpdated == true) {
      this.positionUpdated = false;
      this.Players.forEach((value: Player) => {
        value.sockets.forEach((value: GameSocket) => {
          value.emit("moveMade", { boardState: this.gameLogic.boardState });
        });
      });
    }
    this.checkTimeout(time_passed);
    if (this.checkGameOver() == true) return true;
    return false;
  }

  private checkTimeout(time_passed: number) {
    if (this.timed == true) {
      const turnIndex = this.AssignedColors.indexOf(
        this.gameLogic.boardState.turn,
      );
      this.PlayerTimes[turnIndex] = this.PlayerTimes[turnIndex] - time_passed;
      if (this.PlayerTimes[turnIndex] < 0) {
        this.gameLogic.timeout(this.getColor(turnIndex));
      }
    }
  }

  private checkGameOver(): boolean {
    if (this.gameLogic.gameStatus.isOver) {
      const result = this.gameLogic.gameStatus;
      const winners = result.winners;
      if (winners != null) {
        const winnerIndexes: number[] = [];
        winners.forEach((value: PlayerColor) => {
          const index = this.AssignedColors.indexOf(value);
          if (index >= 0) winnerIndexes.push(index);
        });
        this.Players.forEach((value: Player, index: number) => {
          value.sockets.forEach((value: GameSocket) => {
            if (winnerIndexes.includes(index))
              value.emit("gameOver", { result: "win", reason: result.reason });
            else
              value.emit("gameOver", { result: "lose", reason: result.reason });
          });
        });
      } else {
        this.Players.forEach((value: Player) => {
          value.sockets.forEach((value: GameSocket) => {
            value.emit("gameOver", { result: "draw", reason: result.reason });
          });
        });
      }
      return true;
    }
    return false;
  }

  public getColor(index: number): PlayerColor {
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
  private generateRandomColors2p(): PlayerColor[] {
    const colors: PlayerColor[] = ["white", "black"];
    return this.shuffleArray(colors);
  }

  private generateRandomColors4p(): PlayerColor[] {
    const colors: PlayerColor[] = ["green", "blue", "red", "yellow"];
    return this.shuffleArray(colors);
  }
}
