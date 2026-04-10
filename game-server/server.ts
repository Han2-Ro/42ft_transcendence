import { Server, Socket } from "socket.io";
import { Room } from "./src/room/room.js";
import { CToSEvents, SToCEvents, Games } from "shared";
//import jwt from "jsonwebtoken";

export type GameSocket = Socket<CToSEvents, SToCEvents>;
let running = false;

const io = new Server<CToSEvents, SToCEvents>(4000, {
  cors: {
    // Allow connections from any localhost port for development and from next_js url in deployment
    origin: (origin, callback) => {
      if (
        !origin ||
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

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.log("Authentication error: Token required");
    return next(new Error("Authentication error: Token required"));
  }
  const JWT_SECRET = process.env.JWT_SECRET;
  if (JWT_SECRET === undefined) {
    console.log(
      "Authentication error: JWT_SECRET Not provided to SocketServer",
    );
    return next(
      new Error(
        "Authentication error: JWT_SECRET Not provided to SocketServer",
      ),
    );
  }
  /*   try {	// once jwt gets send by client: Uncomment this and remove everything below it
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.data.user = decoded; // Attach user info to the socket object
    next();
  } catch (error) {
    return next(new Error('Authentication error: Invalid token'));
  } */
  const uid = crypto.randomUUID();
  socket.data.user = uid;
  next();
});

export type Player = {
  sockets: GameSocket[];
  //uid: string
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

const disconnectSocket = (socket: GameSocket) => {
  console.log("disconnect called on socket: ", socket.id);
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
};

io.on("connection", (socket) => {
  socket.emit("connection");
  console.log("Client connected:", socket.id);
  const player = players.get(socket.data.user);
  if (player === undefined) {
    players.set(socket.data.user, {
      sockets: [socket],
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
    }
  }
  //Check for Disconnect
  let drop: NodeJS.Timeout;
  let setDropTimeout: NodeJS.Timeout;
  const dropCheck = () => {
    if (!socket) return;
    drop = setTimeout(() => disconnectSocket(socket), 5000);
    socket.emit("dropCheck");
  };

  const setDrop = () => {
    clearTimeout(setDropTimeout);
    setDropTimeout = setTimeout(() => dropCheck(), 10000);
  }; // 10 secs to restart (so clients need to do handshake every 10 secs)

  socket.on("dropCheck", () => {
    //console.log("dropCheck called on: ", socket.id);
    clearTimeout(drop);
    setDrop();
  });

  setDrop();

  socket.on("findMatch", (type) => {
    const player = players.get(socket.data.user);
    if (
      player === undefined ||
      player.status !== "lobby" ||
      player.searching.includes(type)
    )
      return;
    player.searching.push(type);
    console.log(
      "Client searching for opponent:",
      socket.id,
      ", for type:",
      type,
    );
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
