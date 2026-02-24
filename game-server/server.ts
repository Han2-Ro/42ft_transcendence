import { Server, Socket } from "socket.io";
import { Room } from "./src/room/room.js";
import { CToSEvents, SToCEvents, Games } from "./src/shared/index.js";

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

type Player = {
	socket: GameSocket
	status: "lobby" | "in_game"
	game_id: String | null
	searching: Games[]
}; 

const PlayerStates: Player[] = [];
const rooms: Map<string, Room> = new Map();

io.on("connection", (socket) => {
  PlayerStates.push({socket: socket, status: "lobby", game_id: null, searching: []})
  console.log("Client connected:", socket.id);

/*   socket.on('disconnect', ()=> {
      console.log('Got disconnect!');
  }); */

  socket.on("find_match", (type) => {
	//add type to searching
	const player = GetPlayer(socket)
	if (player === null || player.status !== "lobby" || player.searching.includes(type))
		return
	player.searching.push(type)
    console.log("Client searching for opponent:", socket.id, ", for type:", type);
	//check if Room can be created
	let players: Player[] = [];
	let sockets: GameSocket[] = [];
	PlayerStates.forEach((value: Player) => {
		if (value.searching.includes(type))
		{
			sockets.push(value.socket)
			players.push(value)
		}
	})
	if (((type === "4pChess" || type === "4pTimedChess") && players.length === 4) 
		|| ((type === "chess" || type === "timedChess") && players.length === 2))
	{
		const gameId = crypto.randomUUID();
		players.forEach((value: Player) => {
			value.game_id = gameId
			value.status = "in_game"
			value.searching = []
		})
		const new_room = new Room(sockets, type, gameId);
        rooms.set(gameId, new_room);
	}
  });

  socket.on("move", ({ gameId, move }) => {
    const room = rooms.get(gameId);
    if (room) room.ClientMove(move, socket);
  });

  socket.on("resign", (gameId) => {
    const room = rooms.get(gameId);
    if (room) room.ClientResign(socket);
  });
});

function GetPlayer(socket: GameSocket): Player | null
{
	return PlayerStates.find((value: Player) => value.socket.id === socket.id) || null;
}

const TICK_RATE = 20;
const DT = 1 / TICK_RATE;
const MAX_CATCHUP_TICKS = 5;

let lastTime = process.hrtime.bigint();
let accumulator = 0;
//let running = true;

function nowSeconds(): number {
  return Number(process.hrtime.bigint()) / 1e9;
}

function CheckRunningGames(time_passed: number) {
  rooms.forEach((value: Room, key: string) => {
    if (value.UpdateAndCheckOver(time_passed) === true) 
	{	
		value.Players.forEach((value: GameSocket) => {
			const player = GetPlayer(value)
			if (player !== null)
			{
				player.status = "lobby"
				player.game_id = null
			}
		})
		rooms.delete(key);
	}
  });
}

async function serverLoop() {
  //while (running) {
  while (1) {
    const currentTime = nowSeconds();
    const frameTime = currentTime - Number(lastTime) / 1e9;
    lastTime = process.hrtime.bigint();

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
