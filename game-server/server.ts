import { Server, Socket } from "socket.io";
import { createGame } from "./src/game/game.js"
import { ClientToServerEvents, ServerToClientEvents} from "../shared/socketEvents.js"

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents
>
(4000, {
  cors: {
    // Allow connections from any localhost port for development
    origin: (origin, callback) => {
      if (!origin || origin.startsWith("http://localhost:")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  },
});

const matchmakingQueue: Socket<
  ClientToServerEvents,
  ServerToClientEvents
>[] = []

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("find_match", () => {
	console.log("Client searching for opponent:", socket.id);
  matchmakingQueue.push(socket)

  if (matchmakingQueue.length >= 2) {
    const player1 = matchmakingQueue.shift()
    const player2 = matchmakingQueue.shift()

    if (player1 && player2) {
      createGame(player1, player2)
    }
  }
})

});

console.log("Game Server running on port 4000");
