import { Server, Socket } from "socket.io";
import { Room } from "./src/room/room.js"
import { CToSEvents, SToCEvents, GameStartData} from "../shared/src/socketEvents.js"

export type GameSocket = Socket<CToSEvents, SToCEvents>;

const io = new Server<
  CToSEvents,
  SToCEvents
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

const matchmakingQueue: GameSocket[] = []
//const rooms : Room[] = []

//const rooms : Record<, Room> = []
const rooms: Map<string, Room> = new Map()

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

socket.on("find_match", () => {
	if (matchmakingQueue.includes(socket))
		return;
  console.log("Client searching for opponent:", socket.id);
  matchmakingQueue.push(socket)

  if (matchmakingQueue.length >= 2) {
    const player1 = matchmakingQueue.shift()
    const player2 = matchmakingQueue.shift()
    
	if (player1 && player2) 
	{
		let gameId = crypto.randomUUID()
		player1.join(gameId)
		player2.join(gameId)
	  	let players : GameSocket[] = []
	  	players.push(player1)
	  	players.push(player2)
	  	let new_room = new Room(players, "chess")
      	rooms.set(gameId, new_room)
        player1.emit("game_start", { gameId, color: new_room.GetColor(0), board: new_room.gameLogic.GetBoardState()})
	    player2.emit("game_start", { gameId, color: new_room.GetColor(1), board: new_room.gameLogic.GetBoardState()})
    }
  }
}
)

socket.on("move", ({gameId, move}) => {
	let room = rooms.get(gameId)
	if (room)
	{
		console.log("player attempted move")
		room.ClientMove(move, socket)
	}
}
)

});


const TICK_RATE = 20;                // ticks per second         
const DT = 1 / TICK_RATE; // fixed timestep in seconds
const MAX_CATCHUP_TICKS = 5;          // safety limit


let lastTime = process.hrtime.bigint();
let accumulator = 0;
let running = true;

function nowSeconds(): number {
  return Number(process.hrtime.bigint()) / 1e9;
}

function CheckRunningGames(time_passed : number) {
	rooms.forEach((value: Room, key: string) => {
		let status = value.CheckForUpdate(time_passed)
		console.log(status)
    	if (status == "checkmate" || status == "timeout")
		{
			//todo: save results
			io.to(key).emit("game_over", {result: "win", reason: "smth"})
			//rooms.delete(key)
		}
		if (status == "move_played")
		{
			io.to(key).emit("move_made", {board: value.gameLogic.GetBoardState()})
			console.log("move sent to:", key)
		}
			
});
}

async function serverLoop() {
  while (running) {
    const currentTime = nowSeconds();
    let frameTime = currentTime - Number(lastTime) / 1e9;
    lastTime = process.hrtime.bigint();

    accumulator += frameTime;

    let ticks = 0;
    while (accumulator >= DT && ticks < MAX_CATCHUP_TICKS) {
	  accumulator -= DT;
      ticks++;
	  CheckRunningGames(DT)
    }

    // Prevent spiral of death
    if (ticks === MAX_CATCHUP_TICKS) {
      accumulator = 0;
    }

    // Yield back to the event loop
    await new Promise(resolve => setImmediate(resolve));
  }
}

serverLoop().catch(console.error);



console.log("Game Server running on port 4000");
