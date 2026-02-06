"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Lobby from "../../componets/game/lobby"
import Game from "../../componets/game/game";

import {
  CToSEvents,
  SToCEvents
} from "shared"

// Connect to the exposed backend port
const socket : Socket<
  SToCEvents,
  CToSEvents
> = io("http://localhost:4000");

export default function Page() {
	const [gameId, setGameId] = useState(null);
	const [color, setColor] = useState(null);
	const [board, setBoard] = useState(null);

  useEffect(() => {
    socket.on("game_start", (data) => {
		setGameId(data.gameId)
		setBoard(data.board)
		setColor(data.color);
    });

	socket.on("move_made", (data) => {
		console.log("move_recieved", board)
		setBoard(data.board)
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
    socket.emit("move", {gameId: gameId , move: move});
  };
  const EmitPlayerResign = () => {
    socket.emit("resign", (gameId));
  };

	return board ? 
	<Game board={board} color={color} onPlayerMove={EmitPlayerMove} onPlayerResign={EmitPlayerResign} /> : 
	<Lobby onFindMatchPressed={EmitFindMatch} />;
}
