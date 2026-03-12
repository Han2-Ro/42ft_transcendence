import { BoardState, PlayerColor, GameStatus, Move, fourPlayer } from "shared";

import { startingBoardState } from "./constants.js";
import { Game } from "../game.js";

export class FourPlayerChess extends Game {
  boardState: BoardState;
  gameStatus: GameStatus;
  constructor(state?: BoardState) {
    super();
    if (state !== undefined) this.boardState = state;
    else this.boardState = JSON.parse(JSON.stringify(startingBoardState));
    this.gameStatus = { isOver: false, winners: null, reason: "" };
  }

  playMove(move: Move, played_by: PlayerColor): boolean {
    if (fourPlayer.validateMove(move, this.boardState, played_by) == true) {
      fourPlayer.updateBoardState(this.boardState, move);
      this.gameStatus = fourPlayer.checkMates(
        this.boardState.board,
        this.boardState.turn,
      );
      return true;
    }
    return false;
  }
  playResign(played_by: PlayerColor): void {
    let winners: PlayerColor[];
    if (played_by == "red" || played_by == "yellow")
      winners = ["blue", "green"];
    else winners = ["red", "yellow"];
    this.gameStatus = { isOver: true, winners: winners, reason: "resignation" };
  }

  timeout(player: PlayerColor): void {
    let winners: PlayerColor[];
    if (player == "red" || player == "yellow") winners = ["blue", "green"];
    else winners = ["red", "yellow"];
    this.gameStatus = { isOver: true, winners: winners, reason: "timeout" };
  }
}
