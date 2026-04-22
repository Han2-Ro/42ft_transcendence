"use client";

import { useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Lobby, { ConnectionStatus } from "./Lobby";
import Game from "./Game";
import EndScreen from "./EndScreen";

import { CToSEvents, startingBoardState, SToCEvents } from "shared";
import { BoardState, PlayerColor, Move, Games } from "shared";
import { Result as GameResult } from "shared";
import { useSidebarActions } from "@/componets/sidebar/SidebarActionsProvider";
import { DeadKing } from "@/componets/icons/DeadKing";
import { useAuthConetxt } from "@/componets/AuthProvider";

const turnBadgeStyles: Record<PlayerColor, string> = {
  white: "border border-slate-300 bg-slate-100 text-slate-900",
  black: "border border-slate-700 bg-slate-900 text-white",
  red: "border border-red-500 bg-red-500/10 text-red-400",
  yellow: "border border-yellow-400 bg-yellow-300/10 text-yellow-950",
  green: "border border-emerald-500 bg-emerald-500/10 text-emerald-900",
  blue: "border border-sky-500 bg-sky-500/10 text-sky-900",
};

const turnDotStyles: Record<PlayerColor, string> = {
  white: "bg-slate-300",
  black: "bg-slate-900",
  red: "bg-red-500",
  yellow: "bg-yellow-400",
  green: "bg-emerald-500",
  blue: "bg-sky-500",
};

// Connect to the exposed backend port
const socket: Socket<SToCEvents, CToSEvents> = io(
  typeof window !== "undefined"
    ? `https://${window.location.hostname}`
    : "https://localhost",
  {
    withCredentials: true,
    autoConnect: false,
  },
);

export default function Page() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameType, setGameType] = useState<Games | null>(null);
  const [color, setColor] = useState<PlayerColor>("white");
  const [boardState, setBoardState] = useState<BoardState>(startingBoardState);
  const [times, setTimes] = useState<number[] | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [resultReason, setResultReason] = useState<string | null>(null);
  const [searching, setSearching] = useState<Games[]>([]);
  const [serverConnectionStatus, setServerConnectionStatus] =
    useState<ConnectionStatus>("waiting");
  const { setActions, clearActions } = useSidebarActions();

  const { user } = useAuthConetxt();

  useEffect(() => {
    console.log("trying to connect socket");
    socket.connect();

    socket.on("connect", () => {
      console.log("connected to game-server");
      setServerConnectionStatus("connected");
    });

    socket.on("connect_error", (err) => {
      console.log("connect_error", err.message);
      if (err.message === "Unauthorized") {
        console.log("You need to log in");
        setServerConnectionStatus("unauthorized");
      } else if (
        err.message === "Authentication error: Error: To many sockets"
      ) {
        console.log("You are connected to the game server to many times");
        setServerConnectionStatus("TooManySocketsConnected");
      } else {
        console.error("Couldn't connect to game server:", err.message);
        setServerConnectionStatus("error");
      }
    });

    socket.on("gameStart", (data) => {
      setGameId(data.gameId);
      setGameType(data.type);
      setBoardState(data.boardState);
      setColor(data.color);
      setTimes(data.times);
      setSearching([]);
    });

    socket.on("moveMade", (data) => {
      setBoardState(data.boardState);
      setTimes(data.times);
    });

    socket.on("gameOver", (data) => {
      setResult(data.result);
      setResultReason(data.reason);
      setGameId(null);
      setSearching([]);
    });

    socket.on("setSearching", (data) => {
      setSearching(data);
    });

    return () => {
      console.log("disconnecting socket");
      socket.off("connect");
      socket.off("connect_error");
      socket.off("gameStart");
      socket.off("moveMade");
      socket.off("gameOver");
      socket.off("setSearching");
      socket.disconnect();
    };
  }, [user]);

  const closeResultScreen = () => {
    setResult(null);
    setResultReason(null);
    setGameType(null);
    setTimes(null);
    setBoardState(startingBoardState);
    setColor("white");
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
        icon: <DeadKing size={20} className=" text-red-600" />,
      },
      {
        label: "🤝 Offer Draw",
        onClick: () => console.error("TODO: Not implemented yet"),
      },
    ]);

    return () => {
      clearActions();
    };
  }, [
    boardState,
    clearActions,
    emitPlayerResign,
    gameId,
    result,
    setActions,
    searching,
  ]);

  return (
    <div className="flex flex-col md:flex-row items-center md:justify-around lg:px-10 min-h-full">
      <main className="h-full flex items-center justify-center">
        <Game
          boardState={boardState}
          gameType={gameType ?? "chess"}
          color={color ?? "white"}
          onPlayerMove={gameId && !result ? emitPlayerMove : () => {}}
          times={times ?? [-1]}
          isInGame={Boolean(gameId && !result)}
        />
      </main>
      <aside className="w-full md:w-[360px] flex flex-col items-center gap-6 px-4 py-6">
        {result && (
          <EndScreen
            result={result}
            reason={resultReason || ""}
            onClose={closeResultScreen}
          />
        )}

        {!gameId && !result && (
          <Lobby
            onFindMatchTogglePressed={(type) => {
              socket.emit("findMatchToggle", type);
            }}
            searching={searching}
            serverConnectionStatus={serverConnectionStatus}
          />
        )}
      </aside>
    </div>
  );
}
