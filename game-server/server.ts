import { Server, Socket } from "socket.io";
import { Room } from "./src/room/room.js";
import { CToSEvents, SToCEvents } from "shared";

export type GameSocket = Socket<CToSEvents, SToCEvents>;

const io = new Server<CToSEvents, SToCEvents>(4000, {
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

const matchmakingQueue: GameSocket[] = [];
//const rooms : Room[] = []

//const rooms : Record<, Room> = []
const rooms: Map<string, Room> = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("find_match", () => {
    if (matchmakingQueue.includes(socket)) return;
    console.log("Client searching for opponent:", socket.id);
    matchmakingQueue.push(socket);

    if (matchmakingQueue.length >= 2) {
      const player1 = matchmakingQueue.shift();
      const player2 = matchmakingQueue.shift();

      if (player1 && player2) {
        const gameId = crypto.randomUUID();
        const players: GameSocket[] = [];
        players.push(player1);
        players.push(player2);
        const new_room = new Room(players, "chess", gameId);
        rooms.set(gameId, new_room);
      }
    }
  });

  socket.on("move", ({ gameId, move }) => {
    const room = rooms.get(gameId);
    if (room) room.ClientMove(move, socket);
  });

  socket.on("resign", (gameId) => {
    const room = rooms.get(gameId);
    if (room) room.clientResign(socket);
  });
});

const TICK_RATE = 20;
const DT = 1 / TICK_RATE;
const MAX_CATCHUP_TICKS = 5;

let lastTime = nowSeconds();
let accumulator = 0;
//let running = true;

function nowSeconds(): number {
  return Number(process.hrtime.bigint()) / 1e9;
}

function CheckRunningGames(time_passed: number) {
  rooms.forEach((value: Room, key: string) => {
    if (value.UpdateAndCheckOver(time_passed)) rooms.delete(key);
  });
}

async function serverLoop() {
  //while (running) {
  while (1) {
    const currentTime = nowSeconds();
    const frameTime = currentTime - lastTime;
    lastTime = currentTime;

    accumulator += frameTime;

    let ticks = 0;
    while (accumulator >= DT && ticks < MAX_CATCHUP_TICKS) {
      accumulator -= DT;
      ticks++;
      CheckRunningGames(DT);
    }

    // Prevent spiral of death
    if (ticks === MAX_CATCHUP_TICKS) {
      accumulator = 0;
    }

    // Yield back to the event loop
    await new Promise((resolve) => setImmediate(resolve));
  }
}

serverLoop().catch(console.error);

console.log("Game Server running on port 4000");
