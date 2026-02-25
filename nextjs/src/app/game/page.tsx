"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Lobby from "../../componets/game/lobby";
import Game from "../../componets/game/game";
import EndScreen from "../../componets/game/endScreen";

import { CToSEvents, SToCEvents } from "../../shared";

// Connect to the exposed backend port
const socket: Socket<SToCEvents, CToSEvents> = io("http://localhost:4000");

export default function Page() {
  const [gameId, setGameId] = useState(null);
  const [color, setColor] = useState(null);
  const [boardState, setBoardState] = useState(null);
  const [result, setResult] = useState(null);
  const [resultReason, setResultReason] = useState(null);

  useEffect(() => {
    socket.on("game_start", (data) => {
      setGameId(data.gameId);
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

  const EmitFindMatch = () => {
    socket.emit("find_match");
  };

  const EmitPlayerMove = (move) => {
    socket.emit("move", { gameId: gameId, move: move });
  };
  const EmitPlayerResign = () => {
    socket.emit("resign", gameId);
  };

  return boardState ? (
    <Game
      boardState={boardState}
      color={color}
      onPlayerMove={EmitPlayerMove}
      onPlayerResign={EmitPlayerResign}
    />
  ) : result ? (
    <EndScreen
      result={result}
      reason={resultReason}
      onClose={CloseResultScreen}
    />
  ) : (
    <Lobby onFindMatchPressed={EmitFindMatch} />
  );
}
