"use client";

import { useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Lobby from "../../componets/game/lobby";
import Game from "../../componets/game/game";
import EndScreen from "../../componets/game/endScreen";

import { CToSEvents, SToCEvents } from "shared";
import { BoardState, PlayerColor, Move } from "shared";
import { result as GameResult } from "shared";
import { useSidebarActions } from "@/componets/SidebarActionsProvider";

// Connect to the exposed backend port
const socket: Socket<SToCEvents, CToSEvents> = io("http://localhost:4000");

export default function Page() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [color, setColor] = useState<PlayerColor | null>(null);
  const [boardState, setBoardState] = useState<BoardState | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [resultReason, setResultReason] = useState<string | null>(null);
  const { setActions, clearActions } = useSidebarActions();

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

  const emitPlayerMove = (move: Move) => {
    if (!gameId) return;
    socket.emit("move", { gameId: gameId, move: move });
  };
  const emitPlayerResign = useCallback(() => {
    if (!gameId) return;
    socket.emit("resign", gameId);
  }, [gameId]);

  useEffect(() => {
    const isInActiveMatch = Boolean(gameId && boardState && !result);
    if (!isInActiveMatch) {
      clearActions();
      return;
    }

    setActions([
      { label: "Resign", onClick: emitPlayerResign },
      {
        label: "Offer Draw",
        onClick: () => console.error("TODO: Not implemented yet"),
      },
    ]);

    return () => {
      clearActions();
    };
  }, [boardState, clearActions, emitPlayerResign, gameId, result, setActions]);

  return boardState ? (
    <Game
      boardState={boardState}
      color={color!}
      onPlayerMove={emitPlayerMove}
    />
  ) : result ? (
    <EndScreen
      result={result}
      reason={resultReason || ""}
      onClose={closeResultScreen}
    />
  ) : (
    <Lobby onFindMatchPressed={() => socket.emit("find_match")} />
  );
}
