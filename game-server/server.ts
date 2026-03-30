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


export type Player = {
  sockets: GameSocket[];
  //uid: string
  status: "lobby" | "in_game";
  game_id: string | null;
  searching: Games[];
};

//const playerStates: Player[] = [];

const players: Map<string, Player> = new Map();
const rooms: Map<string, Room> = new Map();

const disconnect=(socket: GameSocket)=>{
	console.log("disconnect called on player: ", socket.id)
	let uid : string = ""
	players.forEach((value: Player, key: string) => {
		value.sockets.forEach((value: GameSocket) => {
			if (socket === value)
			{
				uid = key
			}
		});
	});
	const player = players.get(uid);
	if (player === undefined)
      return;
	const index = player.sockets.indexOf(socket, 0)
	if (index > -1)
		player.sockets.splice(index, 1);
	if (player.sockets.length == 0)
	{
		//todo: give a chance to reconnect
		const game_id = player.game_id
		if (player.status === "in_game" && game_id !== null)
		{
			const room = rooms.get(game_id);
			if (room) room.clientDisconnect(uid)
		}
		players.delete(uid)
	}
/* 	const game_id = player.game_id

	if (player.status === "in_game" && game_id !== null)
	{
		const room = rooms.get(game_id);
		if (room) room.clientDisconnect(uid)
	}
	const index = playerStates.indexOf(player, 0);
	if (index > -1) {
		playerStates.splice(index, 1);
	} */
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
	setDrop();
	const player = players.get(uid)
	if (player === undefined)
	{
		players.set(uid, {
		sockets: [socket],
		status: "lobby",
		game_id: null,
		searching: [],
		})
	}
	else
	{
		player.sockets.push(socket)
	}
	//Todo: if player is already there, sync the client to the player state
  	socket.on("findMatch", (type) => {
  	  const player = players.get(uid);
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
  	  //const players: Player[] = [];
  	  players.forEach((value: Player, key:string) => {
  	    if (value.searching.includes(type)) {
  	      //players.push(value);
  	      searchingPlayers.push(value);
		  uids.push(key);
  	    }
  	  });
  	  if (
  	    ((type === "4pChess" || type === "4pTimedChess") &&
  	      searchingPlayers.length === 4) ||
  	    ((type === "chess" || type === "timedChess") && searchingPlayers.length === 2)
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
  	  if (room) room.clientMove(move, uid);
  	});

  	socket.on("resign", (gameId) => {
  	  const room = rooms.get(gameId);
  	  if (room) room.clientResign(uid);
  	});
  })

});

/* function getPlayer(socket: GameSocket): Player | null {
  return (
    playerStates.find((value: Player) => value.socket.id === socket.id) || null
  );
} */

/* function checkPlayerLoggedIn(socket: GameSocket): boolean {
	const player = getPlayer(socket);
    if (player === null)
      return false;
	return true;
} */




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
      value.Players.forEach((value: Player) => {
        if (value !== null) {
          value.status = "lobby";
          value.game_id = null;
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
