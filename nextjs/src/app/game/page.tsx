"use client";

import { useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Lobby from "./Lobby";
import Game from "./Game";
import EndScreen from "./EndScreen";

import { CToSEvents, startingBoardState, SToCEvents } from "shared";
import { BoardState, PlayerColor, Move, Games } from "shared";
import { Result as GameResult } from "shared";
import { useSidebarActions } from "@/componets/sidebar/SidebarActionsProvider";
import { DeadKing } from "@/componets/icons/DeadKing";

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
  process.env.NEXT_PUBLIC_GAMESERVER_URL || "http://localhost:4000",
  {
    withCredentials: true,
  },
);
socket.on("connection", () => {
  socket.on("dropCheck", () => {
    // responds to the checker
    socket.emit("dropCheck");
  });
});

export default function Page() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameType, setGameType] = useState<Games | null>(null);
  const [color, setColor] = useState<PlayerColor>("white");
  const [boardState, setBoardState] = useState<BoardState>(startingBoardState);
  const [result, setResult] = useState<GameResult | null>(null);
  const [resultReason, setResultReason] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { setActions, clearActions } = useSidebarActions();

  useEffect(() => {
    socket.on("gameStart", (data) => {
      setGameId(data.gameId);
      setGameType(data.type);
      setBoardState(data.boardState);
      setColor(data.color);
      setIsSearching(false);
    });

    socket.on("moveMade", (data) => {
      console.log("move_recieved", boardState);
      setBoardState(data.boardState);
    });

    socket.on("gameOver", (data) => {
      setResult(data.result);
      setResultReason(data.reason);
      setGameId(null);
      setIsSearching(false);
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
    setGameType(null);
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
  }, [boardState, clearActions, emitPlayerResign, gameId, result, setActions]);

  return (
    <div className="flex flex-col md:flex-row items-center md:justify-around lg:px-10 min-h-full">
      <main className="h-full flex items-center justify-center">
        <Game
          boardState={boardState}
          gameType={gameType ?? "chess"}
          color={color ?? "white"}
          onPlayerMove={gameId && !result ? emitPlayerMove : () => {}}
        />
      </main>
      <aside className="w-full md:w-[360px] flex flex-col items-center gap-6 px-4 py-6">
        {gameId && !result && (
          //<div className="w-full rounded-3xl border border-slate-200 bg-slate-50/90 p-5 shadow-sm shadow-slate-200/50">
          <div className="mt-4 flex flex-col gap-3">
            <div className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-3 text-sm font-medium shadow-sm ring-1 ring-slate-200">
              <span
                className={`inline-flex h-3.5 w-3.5 rounded-full ${turnDotStyles[boardState.turn]}`}
              />
              <span
                className={`rounded-full px-3 py-1 ${turnBadgeStyles[boardState.turn]}`}
              >
                {boardState.turn} to move
              </span>
            </div>
            <p className="text-sm text-slate-600">
              {boardState.turn === color
                ? "It’s your turn."
                : "Waiting for opponent..."}
            </p>
          </div>
          //</div>
        )}

        {result && (
          <EndScreen
            result={result}
            reason={resultReason || ""}
            onClose={closeResultScreen}
          />
        )}

        {!gameId && !result && (
          <Lobby
            onFindMatchPressed={(type) => {
              setIsSearching(true);
              socket.emit("findMatch", type);
            }}
            isSearching={isSearching}
          />
        )}
      </aside>
    </div>
  );
}
