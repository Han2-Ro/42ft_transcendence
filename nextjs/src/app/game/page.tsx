"use client";

import { useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Lobby from "../../componets/game/lobby";
import Game from "../../componets/game/game";
import EndScreen from "../../componets/game/endScreen";

import { CToSEvents, startingBoardState, SToCEvents } from "shared";
import { BoardState, PlayerColor, Move, Games } from "shared";
import { Result as GameResult } from "shared";
import { useSidebarActions } from "@/componets/SidebarActionsProvider";
import { DeadKing } from "@/componets/icons/DeadKing";

// Connect to the exposed backend port
const socket: Socket<SToCEvents, CToSEvents> = io(
  process.env.NEXT_PUBLIC_GAMESERVER_URL || "http://localhost:4000",
);

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

  return (
    <div className="flex min-h-screen items-center gap-12 pl-20">
      <main className="flex-1">
        <Game
          boardState={boardState}
          gameType={gameType ?? "chess"}
          color={color ?? "white"}
          onPlayerMove={gameId && !result ? emitPlayerMove : () => {}}
        />
      </main>
      <aside className="flex-1">
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
