"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Lobby from "../../componets/game/lobby"
import Game from "../../componets/game/game"

import {
  CToSEvents,
  SToCEvents
} from "../../../../shared/socketEvents"

// Connect to the exposed backend port
const socket : Socket<
  SToCEvents,
  CToSEvents
> = io("http://localhost:4000");

export default function Home() {
	const [gameData, setGameData] = useState(null);

  useEffect(() => {
    // Listen for updates from the server
    socket.on("game_start", (data) => {
		setGameData(data);
    });

	socket.on("move_made", (data) => {
		gameData.board = data.board
    });

    return () => {
      socket.off("game_start");
	  socket.off("move_made");
    };

  }, []);

  const EmitFindMatch = () => {
    socket.emit("find_match");
  };

  const EmitPlayerMove = (move) => {
    socket.emit("move", {gameId: gameData.gameId , move: move});
  };
  const EmitPlayerResign = (gameId : string) => {
    socket.emit("resign", (gameId));
  };

	return gameData ? 
	<Game gameData={gameData} onPlayerMove={EmitPlayerMove} onPlayerResign={EmitPlayerResign} /> : 
	<Lobby onFindMatchPressed={EmitFindMatch} />;
}
