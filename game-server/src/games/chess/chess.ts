import {
  BoardState,
  Color,
  GameStatus,
  Move,
} from "../../shared/src/gameTypes.js";
import {
  checkMates,
  updateBoardState,
  validateMove,
} from "../../shared/index.js";
import { startingBoardState } from "./constants.js";
import { Game } from "../game.js";

export class Chess extends Game {
  boardState: BoardState;
  gameStatus: GameStatus;
  constructor(state?: BoardState) {
    super();
    if (state !== undefined) this.boardState = state;
    else this.boardState = startingBoardState;
    this.GameStatus = { isOver: false, winner: null, reason: "" };
  }

  playMove(move: Move, played_by: Color): boolean {
    if (validateMove(move, this.boardState, played_by) == true) {
      updateBoardState(this.boardState, move);
      this.GameStatus = checkMates(this.boardState.board, this.boardState.turn);
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
