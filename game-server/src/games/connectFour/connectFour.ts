import {
  BoardStateCon4,
  PlayerColor,
  GameStatus,
  Move,
  Con4,
  MoveChess,
  PlayerColorCon4,
} from "shared";
import { startingBoardState } from "./constants.js";

import { Game } from "../game.js";

export class ConnectFour extends Game {
  boardState: BoardStateCon4;
  gameStatus: GameStatus;
  constructor(state?: BoardStateCon4) {
    super();
    if (state !== undefined) this.boardState = state;
    else this.boardState = structuredClone(startingBoardState);
    this.gameStatus = { isOver: false, winners: null, reason: "" };
  }

  isMoveChess(move: Move): move is MoveChess {
    return (<MoveChess>move).from !== undefined;
  }

  playMove(move: Move, played_by: PlayerColorCon4): boolean {
    if (!this.isMoveChess(move)) {
      if (Con4.validateMove(move, this.boardState, played_by)) {
        this.gameStatus = Con4.updateBoardState(this.boardState, move);
        return true;
      }
    }
    return false;
  }

  playResign(played_by: PlayerColor): void {
    let winners: PlayerColor[];
    if (played_by == "red") winners = ["yellow"];
    else winners = ["red"];
    this.gameStatus = { isOver: true, winners: winners, reason: "resignation" };
  }

  disconnect(player: PlayerColor): void {
    let winners: PlayerColor[];
    if (player == "red") winners = ["yellow"];
    else winners = ["red"];
    this.gameStatus = { isOver: true, winners: winners, reason: "disconnect" };
  }

  timeout(player: PlayerColor): void {
    let winners: PlayerColor[];
    if (player == "red") winners = ["yellow"];
    else winners = ["red"];
    this.gameStatus = { isOver: true, winners: winners, reason: "timeout" };
  }
}
