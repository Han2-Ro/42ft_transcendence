import { BoardState, Color, GameStatus, Move } from "shared";
import { checkMates, updateBoardState, validateMove } from "shared";
import { startingBoardState } from "./constants.js";
import { Game } from "../game.js";

export class Chess extends Game {
  boardState: BoardState;
  gameStatus: GameStatus;
  constructor(state?: BoardState) {
    super();
    if (state !== undefined) this.boardState = state;
    else this.boardState = startingBoardState;
    this.gameStatus = { isOver: false, winner: null, reason: "" };
  }

  playMove(move: Move, played_by: Color): boolean {
    if (validateMove(move, this.boardState, played_by)) {
      updateBoardState(this.boardState, move);
      this.gameStatus = checkMates(this.boardState.board, this.boardState.turn);
      return true;
    }
    return false;
  }
  playResign(played_by: Color): void {
    let winner: Color;
    if (played_by == "white") winner = "black";
    else winner = "white";
    this.gameStatus = { isOver: true, winner: winner, reason: "Resignation" };
  }
}
