import { Server, Socket } from "socket.io";
import { Room } from "./src/room/room.js";
import { CToSEvents, SToCEvents, Games } from "shared";

export type GameSocket = Socket<CToSEvents, SToCEvents>;
let running = false;

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

type Player = {
  socket: GameSocket;
  status: "lobby" | "in_game";
  game_id: string | null;
  searching: Games[];
};

const playerStates: Player[] = [];

const rooms: Map<string, Room> = new Map();

const disconnect=(socket: GameSocket)=>{
	console.log("disconnect called on player: ", socket)
	const player = getPlayer(socket);
	if (player === null)
      return;
	const game_id = player.game_id
	if (player.status === "in_game" && game_id !== null)
	{
		const room = rooms.get(game_id);
		if (room) room.clientDisconnect(socket)
	}
	const index = playerStates.indexOf(player, 0);
	if (index > -1) {
		playerStates.splice(index, 1);
	}
}

io.on("connection", (socket) => {
  socket.emit('connection')
  console.log("Client connected:", socket.id);

  //Check for Disconnect
  let drop : NodeJS.Timeout
  const dropCheck=()=>{
    if(!socket) return;
    socket.emit('dropCheck')
    drop = setTimeout(()=>disconnect(socket),5000)
  }

  const setDrop=()=>setTimeout(()=>dropCheck(),10000) // 10 secs to restart the process

  socket.on('dropCheck',()=>{
    clearTimeout(drop)
    setDrop()
  })

   socket.on('uid',uid=>{
	console.log("Client sent login verification:", socket.id);
	//Todo: validate login (with uid that was sent)
	console.log("Client verified.")
	playerStates.push({
    socket: socket,
    status: "lobby",
    game_id: null,
    searching: [],
  	});
    setDrop()
  })

  socket.on("findMatch", (type) => {
	if (checkPlayerLoggedIn(socket) == false)
		return;
    //add type to searching
    const player = getPlayer(socket);
    if (
      player === null ||
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
    const players: Player[] = [];
    const sockets: GameSocket[] = [];
    playerStates.forEach((value: Player) => {
      if (value.searching.includes(type)) {
        sockets.push(value.socket);
        players.push(value);
      }
    });
    if (
      ((type === "4pChess" || type === "4pTimedChess") &&
        players.length === 4) ||
      ((type === "chess" || type === "timedChess") && players.length === 2)
    ) {
      const gameId = crypto.randomUUID();
      players.forEach((value: Player) => {
        value.game_id = gameId;
        value.status = "in_game";
        value.searching = [];
      });
      const newRoom = new Room(sockets, type, gameId);
      rooms.set(gameId, newRoom);
      if (running == false) {
        running = true;
        serverLoop();
        console.log("Real time loop started");
      }
    }
  });

  socket.on("move", ({ gameId, move }) => {
	if (checkPlayerLoggedIn(socket) == false)
		return;
    const room = rooms.get(gameId);
    if (room) room.clientMove(move, socket);
  });

  socket.on("resign", (gameId) => {
	if (checkPlayerLoggedIn(socket) == false)
		return;
    const room = rooms.get(gameId);
    if (room) room.clientResign(socket);
  });
});

function getPlayer(socket: GameSocket): Player | null {
  return (
    playerStates.find((value: Player) => value.socket.id === socket.id) || null
  );
}

function checkPlayerLoggedIn(socket: GameSocket): boolean {
	const player = getPlayer(socket);
    if (player === null)
      return false;
	return true;
}


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
      value.Players.forEach((value: GameSocket) => {
        const player = getPlayer(value);
        if (player !== null) {
          player.status = "lobby";
          player.game_id = null;
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
