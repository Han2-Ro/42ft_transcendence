import { BoardState, PlayerColor, GameStatus, Move, twoPlayer } from "shared";
import { startingBoardState } from "./constants.js";
import { Game } from "../game.js";

export class Chess extends Game {
  boardState: BoardState;
  gameStatus: GameStatus;
  constructor(state?: BoardState) {
    super();
    if (state !== undefined) this.boardState = state;
    else this.boardState = startingBoardState;
    this.gameStatus = { isOver: false, winners: null, reason: "" };
  }

  playMove(move: Move, played_by: PlayerColor): boolean {
    if (twoPlayer.validateMove(move, this.boardState, played_by)) {
      twoPlayer.updateBoardState(this.boardState, move);
      this.gameStatus = twoPlayer.checkMates(this.boardState.board, this.boardState.turn);
      return true;
    }
    return false;
  }
  playResign(played_by: PlayerColor): void {
    let winners: PlayerColor[];
    if (played_by == "white") winners = ["black"];
    else winners = ["white"];
    this.gameStatus = { isOver: true, winners: winners, reason: "resignation" };
  }

  timeout(player: PlayerColor): void {
    let winners: PlayerColor[];
    if (player == "white") winners = ["black"];
    else winners = ["white"];
    this.gameStatus = { isOver: true, winners: winners, reason: "timeout" };
  }

}
