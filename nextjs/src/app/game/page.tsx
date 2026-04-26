"use client";

import { useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Lobby, { ConnectionStatus } from "./Lobby";
import Game from "./Game";
import EndScreen from "./EndScreen";

import { CToSEvents, startingBoardState, SToCEvents } from "shared";
import { BoardState, PlayerColor, Move, Games } from "shared";
import { Result as GameResult } from "shared";
import { useSidebarActions } from "@/components/sidebar/SidebarActionsProvider";
import { DeadKing } from "@/components/icons/DeadKing";
import { useAuthConetxt } from "@/components/AuthProvider";
import { getUsername } from "@/lib/auth/actions";

function getGameServerUrl() {
  if (process.env.NEXT_PUBLIC_GAMESERVER_URL) {
    return process.env.NEXT_PUBLIC_GAMESERVER_URL;
  }
  if (typeof window !== "undefined") {
    return window.location.hostname;
  }
  return "https://localhost";
}

// Connect to the exposed backend port
const socket: Socket<SToCEvents, CToSEvents> = io(getGameServerUrl(), {
  withCredentials: true,
  autoConnect: false,
  transports: ["websocket"],
});

export default function Page() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameType, setGameType] = useState<Games | null>(null);
  const [color, setColor] = useState<PlayerColor>("white");
  const [boardState, setBoardState] = useState<BoardState>(startingBoardState);
  const [times, setTimes] = useState<Record<PlayerColor, number> | null>(null);
  const [players, setPlayerIDs] = useState<Record<PlayerColor, number> | null>(
    null,
  );
  const [usernames, setUsernames] = useState<
    Partial<Record<PlayerColor, string>>
  >({});
  const [result, setResult] = useState<GameResult | null>(null);
  const [resultReason, setResultReason] = useState<string | null>(null);
  const [searching, setSearching] = useState<Games[]>([]);
  const [serverConnectionStatus, setServerConnectionStatus] =
    useState<ConnectionStatus>("waiting");
  const { setActions, clearActions } = useSidebarActions();

  const { user, refreshUser } = useAuthConetxt();

  useEffect(() => {
    console.log("trying to connect socket");
    socket.connect();

    socket.on("connect", () => {
      console.log("connected to game-server");
      setServerConnectionStatus("connected");
    });

    socket.on("connect_error", (err) => {
      if (err.message === "Authentication error: Unauthorized") {
        console.log("You need to log in");
        setServerConnectionStatus("unauthorized");
      } else if (
        err.message === "Authentication error: Error: To many sockets"
      ) {
        console.log("You are connected to the game server to many times");
        setServerConnectionStatus("TooManySocketsConnected");
      } else {
        console.log(
          `Couldn't connect to game server at '${getGameServerUrl()}':`,
          err.message,
        );
        setServerConnectionStatus("error");
      }
    });

    socket.on("gameStart", (data) => {
      setGameId(data.gameId);
      setGameType(data.type);
      setBoardState(data.boardState);
      setColor(data.color);
      setTimes(data.times);
      setPlayerIDs(data.players);
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
      setGameId(null);
      setGameType(null);
      setColor("white");
      setBoardState(startingBoardState);
      setTimes(null);
      setPlayerIDs(null);
      setResult(null);
      setResultReason(null);
      setSearching([]);
      setServerConnectionStatus("waiting");
      socket.disconnect();
    };
  }, [user?.userId]);

  useEffect(() => {
    if (!players) return;
    Promise.all(
      (Object.entries(players) as [PlayerColor, number][]).map(
        async ([color, id]) => {
          const result = await getUsername(id);
          return [color, "username" in result ? result.username : color] as [
            PlayerColor,
            string,
          ];
        },
      ),
    ).then((entries) => setUsernames(Object.fromEntries(entries)));
  }, [players]);

  const closeResultScreen = () => {
    setResult(null);
    setResultReason(null);
    setGameType(null);
    setTimes(null);
    setBoardState(startingBoardState);
    setColor("white");
    refreshUser();
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
        label: "😹 Resign",
        onClick: emitPlayerResign,
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
          times={times}
          isInGame={Boolean(gameId && !result)}
          usernames={usernames}
        />
      </main>
      <aside className="w-full flex flex-col items-center gap-6 px-4 py-6">
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
