import { Server, Socket } from "socket.io";
import { Room } from "./src/room/room.js";
import { CToSEvents, SToCEvents, Games } from "shared";
import { parse as parseCookie } from "cookie";

//import jwt from "jsonwebtoken";

export type GameSocket = Socket<CToSEvents, SToCEvents>;
let running = false;

const io = new Server<CToSEvents, SToCEvents>(4000, {
  cors: {
    // Allow connections from any localhost port for development and from next_js url in deployment
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.startsWith("https://localhost") ||
        origin.startsWith("http://localhost:") ||
        origin == process.env.SERVICE_URL_NEXTJS
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  },
});

io.engine.opts.pingTimeout = 5000;
io.engine.opts.pingInterval = 10000;

io.use((socket, next) => {
  const cookieString = socket.handshake.headers.cookie ?? "";
  const cookies = parseCookie(cookieString);
  const token = cookies.token;

  if (!token) {
    console.log("Authentication error: Token required");
    return next(new Error("Unauthorized"));
  }

  const nextjsUrl =
    process.env.INTERNAL_NEXTJS_URL || process.env.SERVICE_URL_NEXTJS;
  if (!nextjsUrl) {
    console.log("Authentication error: INTERNAL_NEXTJS_URL not set");
    return next(new Error("Authentication error: Server misconfiguration"));
  }
  fetch(`${nextjsUrl}/api/internal/user/authenticate`, {
    method: "GET",
    headers: {
      Cookie: `token=${token}`,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Unauthorized");
      }
      const session = (await response.json()) as { userId: number };
      socket.data.user = String(session.userId);
      next();
    })
    .catch((error: unknown) => {
      console.log("Authentication error:", error);
      next(new Error(`Authentication error: ${error}`));
    });
});

export type Player = {
  sockets: GameSocket[];
  playerid: number;
  status: "lobby" | "in_game";
  game_id: string | null;
  searching: Games[];
};

const players: Map<string, Player> = new Map();
const rooms: Map<string, Room> = new Map();

const disconnectPlayer = (uid: string) => {
  console.log("disconnect called on player: ", uid);
  const player = players.get(uid);
  if (player !== undefined) {
    if (player.sockets.length == 0) {
      const gameId = player.game_id;
      if (player.status === "in_game" && gameId !== null) {
        const room = rooms.get(gameId);
        if (room) room.clientDisconnect(uid);
      }
      players.delete(uid);
    }
  }
};

io.on("connection", (socket) => {
  console.log(
    "Client connected: socketid: ",
    socket.id,
    "playerid: ",
    socket.data.user,
  );
  const player = players.get(socket.data.user);
  if (player === undefined) {
    players.set(socket.data.user, {
      sockets: [socket],
      playerid: socket.data.user,
      status: "lobby",
      game_id: null,
      searching: [],
    });
  } else {
    player.sockets.push(socket);
    if (player.status === "in_game") {
      const gameId = player.game_id;
      if (gameId !== null) {
        rooms.get(gameId)?.syncState(socket, socket.data.user, gameId);
      }
    } else if (player.searching.length !== 0) {
      socket.emit("setSearching", player.searching);
    }
  }

  socket.on("disconnect", function (reason) {
    console.log(
      "disconnect called on socket: ",
      socket.id,
      "\nreason: ",
      reason,
    );
    const player = players.get(socket.data.user);
    if (player === undefined) return;
    const index = player.sockets.indexOf(socket, 0);
    if (index > -1) player.sockets.splice(index, 1);
    if (
      player.sockets.length == 0
    ) //If there are no sockets connected to the player
    {
      setTimeout(() => disconnectPlayer(socket.data.user), 10000);
    }
  });

  socket.on("findMatchToggle", (type) => {
    const player = players.get(socket.data.user);
    if (player === undefined || player.status !== "lobby") return;
    if (player.searching.includes(type)) {
      const index = player.searching.indexOf(type);
      if (index > -1) {
        player.searching.splice(index, 1);
        player.sockets.forEach((value: GameSocket) => {
          value.emit("setSearching", player.searching);
        });
      }
      console.log(
        "Player: ",
        socket.data.user,
        "stopped searching for opponent for type:",
        type,
      );
      return;
    }
    player.searching.push(type);
    console.log(
      "Player: ",
      socket.data.user,
      "started searching for opponent for type:",
      type,
    );
    player.sockets.forEach((value: GameSocket) => {
      value.emit("setSearching", player.searching);
    });
    //check if Room can be created
    const searchingPlayers: Player[] = [];
    const uids: string[] = [];
    players.forEach((value: Player, key: string) => {
      if (value.searching.includes(type)) {
        searchingPlayers.push(value);
        uids.push(key);
      }
    });
    if (
      ((type === "4pChess" || type === "4pTimedChess") &&
        searchingPlayers.length === 4) ||
      ((type === "chess" || type === "timedChess") &&
        searchingPlayers.length === 2)
    ) {
      const gameId = crypto.randomUUID();
      players.forEach((value: Player) => {
        value.game_id = gameId;
        value.status = "in_game";
        value.searching = [];
      });
      const newRoom = new Room(searchingPlayers, uids, type, gameId);
      rooms.set(gameId, newRoom);
      if (running == false) {
        running = true;
        serverLoop();
        console.log("Real time loop started");
      }
    }
  });

  socket.on("move", ({ gameId, move }) => {
    const room = rooms.get(gameId);
    if (room) room.clientMove(move, socket.data.user);
  });

  socket.on("resign", (gameId) => {
    const room = rooms.get(gameId);
    if (room) room.clientResign(socket.data.user);
  });
});

const TICK_RATE = 20;
const DT = 1 / TICK_RATE;
const MAX_CATCHUP_TICKS = 5;

let lastTime = nowSeconds();
let accumulator = 0;

function nowSeconds(): number {
  return Number(process.hrtime.bigint()) / 1e9;
}

function checkRunningGames(time_passed: number) {
  rooms.forEach((value: Room, key: string) => {
    if (value.updateAndCheckOver(time_passed) === true) {
      value.players.forEach((value: Player) => {
        if (value !== null) {
          value.status = "lobby";
          value.game_id = null;
          value.searching = [];
        }
      });
      rooms.delete(key);
    }
  });
}

async function serverLoop() {
  while (running) {
    const currentTime = nowSeconds();
    const frameTime = currentTime - lastTime;
    lastTime = currentTime;

    accumulator += frameTime;

    let ticks = 0;
    while (accumulator >= DT && ticks < MAX_CATCHUP_TICKS) {
      accumulator -= DT;
      ticks++;
      checkRunningGames(DT);
      if (rooms.size == 0) {
        running = false;
        console.log("Real time loop stopped, no games running");
      }
    }
    // Prevent spiral of death
    if (ticks === MAX_CATCHUP_TICKS) {
      accumulator = 0;
    }

    // Yield back to the event loop
    await new Promise((resolve) => setImmediate(resolve));
  }
}

//serverLoop().catch(console.error);

process.on("SIGINT", () => {
  running = false;
});

console.log("Game Server running on port 4000");
