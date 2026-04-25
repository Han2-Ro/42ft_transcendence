import { Games } from "shared";

import Button from "../../componets/Button";

export type ConnectionStatus =
  | "connected"
  | "unauthorized"
  | "error"
  | "TooManySocketsConnected"
  | "waiting";

export default function Lobby({
  onFindMatchTogglePressed,
  searching,
  serverConnectionStatus,
}: {
  onFindMatchTogglePressed: (type: Games) => void;
  searching: Games[];
  serverConnectionStatus: ConnectionStatus;
}) {
  return (
    <div className="flex flex-col items-center gap-5">
      <h1 className="text-4xl font-bold text-slate-800">Chess Lobby</h1>

      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        <Button
          onClick={() => onFindMatchTogglePressed("chess")}
          loadingNoDisabled={searching.includes("chess")}
          disabled={serverConnectionStatus != "connected"}
          loadingText="Finding game…"
        >
          <div className="text-md">♟️ Chess</div>
        </Button>

        <Button
          onClick={() => onFindMatchTogglePressed("timedChess")}
          loadingNoDisabled={searching.includes("timedChess")}
          disabled={serverConnectionStatus != "connected"}
          loadingText="Finding game…"
        >
          <div className="text-md">⏳ Chess (10 min)</div>
        </Button>

        <Button
          onClick={() => onFindMatchTogglePressed("4pChess")}
          loadingNoDisabled={searching.includes("4pChess")}
          disabled={serverConnectionStatus != "connected"}
          loadingText="Finding game…"
        >
          <div className="text-md">♟️ Chess: 4 players</div>
        </Button>

        <Button
          onClick={() => onFindMatchTogglePressed("4pTimedChess")}
          loadingNoDisabled={searching.includes("4pTimedChess")}
          disabled={serverConnectionStatus != "connected"}
          loadingText="Finding game…"
        >
          <div className="text-md"> ⏳ Chess: 4 players (10 min)</div>
        </Button>

        <Button
          onClick={() => onFindMatchTogglePressed("connect4")}
          loadingNoDisabled={searching.includes("connect4")}
          disabled={serverConnectionStatus != "connected"}
          loadingText="Finding game…"
          className={`${serverConnectionStatus != "connected" ? "bg-blue-800/10" : "bg-blue-800 hover:bg-blue-800/50"}`}
        >
          <div className="text-md"> 🟡🔴 Connect 4</div>
        </Button>

        <Button
          onClick={() => onFindMatchTogglePressed("timedConnect4")}
          loadingNoDisabled={searching.includes("timedConnect4")}
          disabled={serverConnectionStatus != "connected"}
          loadingText="Finding game…"
          className={`${serverConnectionStatus != "connected" ? "bg-blue-800/10" : "bg-blue-800 hover:bg-blue-800/50"}`}
        >
          <div className="text-md"> ⏳ Connect 4 (10 min)</div>
        </Button>
      </div>

      <div className="text-lg">
        {serverConnectionStatus === "unauthorized" && (
          <p className=" text-red-500">You need to log in!</p>
        )}
        {serverConnectionStatus === "TooManySocketsConnected" && (
          <p className=" text-red-500">User already connected to many times</p>
        )}
        {serverConnectionStatus === "waiting" && <p>Loading...</p>}
        {serverConnectionStatus === "error" && (
          <p className=" text-red-500">
            There was an Error while connecting to the game server
          </p>
        )}
      </div>

      <div className="text-sm text-slate-600">
        {searching.length > 0 ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            Searching game lobby...
          </span>
        ) : (
          "Ready when you are"
        )}
      </div>
    </div>
  );
}
