"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Lobby from "../../componets/game/lobby";
import Game from "../../componets/game/game";
import EndScreen from "../../componets/game/endScreen";

import { CToSEvents, SToCEvents } from "shared";
import { BoardState, PlayerColor, Move, Games } from "shared";
import { result as GameResult } from "shared";

// Connect to the exposed backend port
const socket: Socket<SToCEvents, CToSEvents> = io("http://localhost:4000");

export default function Page() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameType, setGameType] = useState<Games | null>(null);
  const [color, setColor] = useState<PlayerColor | null>(null);
  const [boardState, setBoardState] = useState<BoardState | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [resultReason, setResultReason] = useState<string | null>(null);

  useEffect(() => {
    socket.on("game_start", (data) => {
      setGameId(data.gameId);
      setGameType(data.type);
      setBoardState(data.boardState);
      setColor(data.color);
    });

    socket.on("move_made", (data) => {
      console.log("move_recieved", boardState);
      setBoardState(data.boardState);
    });

    socket.on("game_over", (data) => {
      setResult(data.result);
      setResultReason(data.reason);
      setGameId(null);
      setGameType(null);
      setBoardState(null);
      setColor(null);
    });

    return () => {
      socket.off("game_start");
      socket.off("move_made");
      socket.off("game_over");
    };
  });

  const closeResultScreen = () => {
    setResult(null);
    setResultReason(null);
  };

  const emitPlayerMove = (move: Move) => {
    if (!gameId) return;
    socket.emit("move", { gameId: gameId, move: move });
  };
  const emitPlayerResign = () => {
    if (!gameId) return;
    socket.emit("resign", gameId);
  };

  return boardState ? (
    <Game
      boardState={boardState}
      gameType={gameType!}
      color={color!}
      onPlayerMove={emitPlayerMove}
      onPlayerResign={emitPlayerResign}
    />
  ) : result ? (
    <EndScreen
      result={result}
      reason={resultReason || ""}
      onClose={closeResultScreen}
    />
  ) : (
    <Lobby onFindMatchPressed={(type) => socket.emit("find_match", type)} />
  );
}
