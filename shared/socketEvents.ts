import { BoardState } from "./chess/types"


// shared/socketEvents.ts
export interface ClientToServerEvents {
  find_match: () => void

  move: (data: {
    gameId: string
    from: string
    to: string
  }) => void

  resign: (gameId: string) => void
}

export interface ServerToClientEvents {
  game_start: (data: {
    gameId: string
    color: "white" | "black"
	board: BoardState
  }) => void

  move_made: (data: {
    board: BoardState
  }) => void

  opponent_disconnected: () => void
}