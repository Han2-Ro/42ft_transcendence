"use client";

import { useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Lobby from "../../componets/game/lobby";
import Game from "../../componets/game/game";
import EndScreen from "../../componets/game/endScreen";

import { CToSEvents, SToCEvents } from "shared";
import { BoardState, PlayerColor, Move, Games } from "shared";
import { Result as GameResult } from "shared";
import { useSidebarActions } from "@/componets/SidebarActionsProvider";
import { DeadKing } from "@/componets/icons/DeadKing";

// Connect to the exposed backend port
const socket: Socket<SToCEvents, CToSEvents> = io("http://localhost:4000");
socket.on("connection", () => {
  const uid = crypto.randomUUID();
  socket.emit("uid", uid); // Todo: send whatever data is requiered for server to verify user in database

  socket.on("dropCheck", () => {
    // responds to the checker
    socket.emit("dropCheck");
  });
});

export default function Page() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameType, setGameType] = useState<Games | null>(null);
  const [color, setColor] = useState<PlayerColor | null>(null);
  const [boardState, setBoardState] = useState<BoardState | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [resultReason, setResultReason] = useState<string | null>(null);
  const { setActions, clearActions } = useSidebarActions();

  useEffect(() => {
    socket.on("gameStart", (data) => {
      setGameId(data.gameId);
      setGameType(data.type);
      setBoardState(data.boardState);
      setColor(data.color);
    });

    socket.on("moveMade", (data) => {
      console.log("move_recieved", boardState);
      setBoardState(data.boardState);
    });

    socket.on("gameOver", (data) => {
      setResult(data.result);
      setResultReason(data.reason);
      setGameId(null);
      setGameType(null);
      setBoardState(null);
      setColor(null);
    });

    return () => {
      socket.off("gameStart");
      socket.off("moveMade");
      socket.off("gameOver");
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
      {
        label: "Resign",
        onClick: emitPlayerResign,
        icon: <DeadKing className=" text-red-600" />,
      },
      {
        label: "🤝 Offer Draw",
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
      gameType={gameType!}
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
    <Lobby onFindMatchPressed={(type) => socket.emit("findMatch", type)} />
  );
}
