import { Move, PlayerColor, Games } from "shared";

import { Game } from "../games/game.js";
import { Chess } from "../games/chess/chess.js";
import { FourPlayerChess } from "../games/4pChess/4pChess.js";
import { GameSocket, Player } from "../../server.js";
import { ConnectFour } from "../games/connectFour/connectFour.js";

const DEFAULT_TIMED_MODE_SECONDS = 600;

function getTimedModeSeconds(): number {
  const override = process.env.GAME_TIMED_MODE_SECONDS;
  if (override === undefined || override.trim() === "") {
    return DEFAULT_TIMED_MODE_SECONDS;
  }

  const parsed = Number(override);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    console.log(
      `Invalid GAME_TIMED_MODE_SECONDS="${override}", falling back to ${DEFAULT_TIMED_MODE_SECONDS}`,
    );
    return DEFAULT_TIMED_MODE_SECONDS;
  }

  return parsed;
}

export type GameStatus =
  | "checkmate"
  | "timeout"
  | "Stalemate"
  | "move_played"
  | null;

export class Room {
  players: Player[];
  uids: string[];
  assignedColors: PlayerColor[];
  gameLogic: Game;
  gameType: Games;
  positionUpdated: boolean = false;
  order: PlayerColor[];

  //time vars
  timed: boolean;
  playerTimes: number[];
  last_move: number = 0;

  constructor(players: Player[], uids: string[], type: Games, gameId: string) {
    this.players = players;
    this.uids = uids;
    this.gameType = type;
    if (type == "chess" || type == "timedChess") {
      this.gameLogic = new Chess();
      this.assignedColors = this.generateRandomColors2pBW();
      this.order = ["white", "black"];
      if (type == "timedChess") {
        this.timed = true;
        const timedModeSeconds = getTimedModeSeconds();
        this.playerTimes = [timedModeSeconds, timedModeSeconds];
      } else {
        this.timed = false;
        this.playerTimes = [-1, -1];
      }
    } else if (type == "4pChess" || type == "4pTimedChess") {
      this.gameLogic = new FourPlayerChess();
      this.assignedColors = this.generateRandomColors4p();
      this.order = ["red", "blue", "yellow", "green"];
      if (type == "4pTimedChess") {
        this.timed = true;
        const timedModeSeconds = getTimedModeSeconds();
        this.playerTimes = [
          timedModeSeconds,
          timedModeSeconds,
          timedModeSeconds,
          timedModeSeconds,
        ];
      } else {
        this.timed = false;
        this.playerTimes = [-1, -1, -1, -1];
      }
    } else {
      this.gameLogic = new ConnectFour();
      this.assignedColors = this.generateRandomColors2pRY();
      this.order = ["yellow", "red"];
      if (type == "timedConnect4") {
        this.timed = true;
        const timedModeSeconds = getTimedModeSeconds();
        this.playerTimes = [timedModeSeconds, timedModeSeconds];
      } else {
        this.timed = false;
        this.playerTimes = [-1, -1];
      }
    }

    this.players.forEach((value: Player, index: number) => {
      value.sockets.forEach((value: GameSocket) => {
        value.emit("gameStart", {
          gameId,
          type,
          color: this.assignedColors[index],
          boardState: this.gameLogic.boardState,
          times: this.getTimes(),
          players: this.getPlayerIDs(),
        });
      });
    });
  }
  public clientMove(move: Move, uid: string) {
    let colorPos = -1;
    for (let i = 0; i < this.players.length; i++) {
      if (uid == this.uids[i]) colorPos = i;
    }
    if (colorPos == -1) return;
    if (this.gameLogic.playMove(move, this.assignedColors[colorPos])) {
      this.positionUpdated = true;
    }
  }

  public syncState(socket: GameSocket, uid: string, gameId: string) {
    const playerIndex = this.uids.findIndex((u) => u === uid);
    if (playerIndex === -1) return;
    socket.emit("gameStart", {
      gameId,
      type: this.gameType,
      color: this.assignedColors[playerIndex],
      boardState: this.gameLogic.boardState,
      times: this.getTimes(),
      players: this.getPlayerIDs(),
    });
  }

  public clientResign(uid: string) {
    let colorPos = -1;
    for (let i = 0; i < this.players.length; i++) {
      if (uid == this.uids[i]) colorPos = i;
    }
    if (colorPos == -1) return;
    this.gameLogic.playResign(this.assignedColors[colorPos]);
  }

  public clientDisconnect(uid: string) {
    let colorPos = -1;
    for (let i = 0; i < this.players.length; i++) {
      if (uid == this.uids[i]) colorPos = i;
    }
    if (colorPos == -1) return;
    this.gameLogic.disconnect(this.assignedColors[colorPos]);
  }

  public updateAndCheckOver(time_passed: number): boolean {
    if (this.positionUpdated == true) {
      this.positionUpdated = false;
      this.players.forEach((value: Player) => {
        value.sockets.forEach((value: GameSocket) => {
          value.emit("moveMade", {
            boardState: this.gameLogic.boardState,
            times: this.getTimes(),
          });
        });
      });
    }
    this.checkTimeout(time_passed);
    if (this.checkGameOver() == true) {
      this.sendResults();
      return true;
    }
    return false;
  }

  private getTimes(): Record<PlayerColor, number> | null {
	if (!this.timed) return null;
    const times = {} as Record<PlayerColor, number>;
    this.order.forEach((value: PlayerColor) => {
      const colorIndex = this.assignedColors.indexOf(value);
      if (colorIndex >= 0) {
        times[value] = this.playerTimes[colorIndex];
      }
    });
    return times;
  }
  private getPlayerIDs(): Record<PlayerColor, number> {
    const gamePlayers = {} as Record<PlayerColor, number>;
    this.order.forEach((value: PlayerColor) => {
      const colorIndex = this.assignedColors.indexOf(value);
      if (colorIndex >= 0) {
        gamePlayers[value] = this.players[colorIndex].playerid;
      }
    });
    return gamePlayers;
  }

  private checkTimeout(time_passed: number) {
    if (this.timed == true) {
      const turnIndex = this.assignedColors.indexOf(
        this.gameLogic.boardState.turn,
      );
      this.playerTimes[turnIndex] = this.playerTimes[turnIndex] - time_passed;
      if (this.playerTimes[turnIndex] < 0) {
        this.gameLogic.timeout(this.getColor(turnIndex));
      }
    }
  }

  private sendResults() {
    const secret = process.env.INTERNAL_SECRET;
    if (!secret) {
      console.log("Error sending game results to db: INTERNAL_SECRET not set");
      return;
    }
    const nextjsUrl =
      process.env.INTERNAL_NEXTJS_URL || process.env.SERVICE_URL_NEXTJS;
    if (!nextjsUrl) {
      console.log(
        "Error sending game results to db: INTERNAL_NEXTJS_URL not set",
      );
      return;
    }
    if (this.gameType == "chess" || this.gameType == "timedChess") {
      const winner = this.gameLogic.gameStatus.winners
        ? this.gameLogic.gameStatus.winners[0] === "white"
          ? "white"
          : "black"
        : "draw";
      const whitePlayerId =
        this.players[this.assignedColors.indexOf("white")].playerid;
      const blackPlayerId =
        this.players[this.assignedColors.indexOf("black")].playerid;
      const reason = this.gameLogic.gameStatus.reason;
      fetch(`${nextjsUrl}/api/internal/game`, {
        method: "Post",
        headers: {
          "x-internal-secret": secret,
        },
        body: JSON.stringify({
          whitePlayerId: Number(whitePlayerId),
          blackPlayerId: Number(blackPlayerId),
          winner,
          reason,
        }),
      }).then(async (response) => {
        if (!response.ok) {
          console.log("Error sending game results to db");
          return;
        }
        console.log("database save successfull");
      });
    } else if (this.gameType == "4pTimedChess" || this.gameType == "4pChess") {
      const winner = this.gameLogic.gameStatus.winners
        ? this.gameLogic.gameStatus.winners[0] === "red" ||
          this.gameLogic.gameStatus.winners[0] === "yellow"
          ? "yellow"
          : "blue"
        : "draw";
      const yellowPlayerId =
        this.players[this.assignedColors.indexOf("yellow")].playerid;
      const redPlayerId =
        this.players[this.assignedColors.indexOf("red")].playerid;
      const bluePlayerId =
        this.players[this.assignedColors.indexOf("blue")].playerid;
      const greenPlayerId =
        this.players[this.assignedColors.indexOf("green")].playerid;
      const reason = this.gameLogic.gameStatus.reason;
      fetch(`${nextjsUrl}/api/internal/game-four`, {
        method: "Post",
        headers: {
          "x-internal-secret": secret,
        },
        body: JSON.stringify({
          bluePlayerId: Number(bluePlayerId),
          greenPlayerId: Number(greenPlayerId),
          yellowPlayerId: Number(yellowPlayerId),
          redPlayerId: Number(redPlayerId),
          winner,
          reason,
        }),
      }).then(async (response) => {
        if (!response.ok) {
          console.log("Error sending game results to db: ", response);
          return;
        }
        console.log("database save successfull");
      });
    } else if (
      this.gameType == "connect4" ||
      this.gameType == "timedConnect4"
    ) {
      const winner = this.gameLogic.gameStatus.winners
        ? this.gameLogic.gameStatus.winners[0] === "yellow"
          ? "yellow"
          : "red"
        : "draw";
      const yellowPlayerId =
        this.players[this.assignedColors.indexOf("yellow")].playerid;
      const redPlayerId =
        this.players[this.assignedColors.indexOf("red")].playerid;
      const reason = this.gameLogic.gameStatus.reason;
      fetch(`${nextjsUrl}/api/internal/connectGame`, {
        method: "Post",
        headers: {
          "x-internal-secret": secret,
        },
        body: JSON.stringify({
          connectYellowPlayerId: Number(yellowPlayerId),
          connectRedPlayerId: Number(redPlayerId),
          winner,
          reason,
        }),
      }).then(async (response) => {
        if (!response.ok) {
          console.log("Error sending game results to db");
          return;
        }
        console.log("database save successfull");
      });
    }
  }

  private checkGameOver(): boolean {
    if (this.gameLogic.gameStatus.isOver) {
      const result = this.gameLogic.gameStatus;
      const winners = result.winners;
      if (winners != null) {
        const winnerIndexes: number[] = [];
        winners.forEach((value: PlayerColor) => {
          const index = this.assignedColors.indexOf(value);
          if (index >= 0) winnerIndexes.push(index);
        });
        this.players.forEach((value: Player, index: number) => {
          value.sockets.forEach((value: GameSocket) => {
            if (winnerIndexes.includes(index))
              value.emit("gameOver", { result: "win", reason: result.reason });
            else
              value.emit("gameOver", { result: "lose", reason: result.reason });
          });
        });
      } else {
        this.players.forEach((value: Player) => {
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
    return this.assignedColors[index];
  }

  private shuffleArray<T>(array: T[]): T[] {
    const length = array.length;
    for (let i = length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  private generateRandomColors2pBW(): PlayerColor[] {
    const colors: PlayerColor[] = ["white", "black"];
    return this.shuffleArray(colors);
  }

  private generateRandomColors2pRY(): PlayerColor[] {
    const colors: PlayerColor[] = ["yellow", "red"];
    return this.shuffleArray(colors);
  }

  private generateRandomColors4p(): PlayerColor[] {
    const colors: PlayerColor[] = ["green", "blue", "red", "yellow"];
    return this.shuffleArray(colors);
  }
}
