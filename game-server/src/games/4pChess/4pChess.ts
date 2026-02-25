import {
  BoardState,
  Color,
  GameStatus,
  Move,
  fourPlayer,
} from "../../shared/index.js";

import { startingBoardState } from "./constants.js";
import { Game } from "../game.js";

export class FourPlayerChess extends Game {
  boardState: BoardState;
  GameStatus: GameStatus;
  constructor(state?: BoardState) {
    super();
    if (state !== undefined) this.boardState = state;
    else this.boardState = startingBoardState;
    this.GameStatus = { isOver: false, winner: null, reason: "" };
  }

  playMove(move: Move, played_by: Color): boolean {
	console.log(played_by)
    if (fourPlayer.validateMove(move, this.boardState, played_by) == true) {
      fourPlayer.updateBoardState(this.boardState, move);
      this.GameStatus = fourPlayer.checkMates(
        this.boardState.board,
        this.boardState.turn,
      );
      return true;
    }
    return false;
  }
  playResign(played_by: Color): void {
    let winner: Color;
    if (played_by == "white") winner = "black";
    else winner = "white";
    this.GameStatus = { isOver: true, winner: winner, reason: "Resignation" };
  }

  GetBoardState(): BoardState {
    return this.boardState;
  }
  GetTurn(): Color {
    return this.boardState.turn;
  }
  GetGameStatus(): GameStatus {
    return this.GameStatus;
  }
}
