import { Games } from "shared";

import Button from "../../componets/Button";

export type ConnectionStatus =
  | "connected"
  | "unauthorized"
  | "error"
  | "waiting";

export default function Lobby({
  onFindMatchPressed,
  isSearching,
  serverConnectionStatus,
}: {
  onFindMatchPressed: (type: Games) => void;
  isSearching: boolean;
  serverConnectionStatus: ConnectionStatus;
}) {
  return (
    <div className="flex flex-col items-center gap-5">
      <h1 className="text-4xl font-bold text-slate-800">Chess Lobby</h1>

      <Button
        onClick={() => onFindMatchPressed("chess")}
        loading={isSearching}
        disabled={isSearching || serverConnectionStatus != "connected"}
        className="text-lg px-7 py-3 rounded-xl shadow-lg"
        loadingText="Finding game…"
      >
        find chess match (no time limit)
      </Button>
      <Button
        onClick={() => onFindMatchPressed("4pChess")}
        loading={isSearching}
        disabled={isSearching || serverConnectionStatus != "connected"}
        className="text-lg px-7 py-3 rounded-xl shadow-lg"
        loadingText="Finding game…"
      >
        find 4 player chess match (no time limit)
      </Button>

      <Button
        onClick={() => onFindMatchPressed("timedChess")}
        loading={isSearching}
        disabled={isSearching || serverConnectionStatus != "connected"}
        className="text-lg px-7 py-3 rounded-xl shadow-lg"
        loadingText="Finding game…"
      >
        find chess match (10 minutes)
      </Button>
      <Button
        onClick={() => onFindMatchPressed("4pTimedChess")}
        loading={isSearching}
        disabled={isSearching || serverConnectionStatus != "connected"}
        className="text-lg px-7 py-3 rounded-xl shadow-lg"
        loadingText="Finding game…"
      >
        find 4 player chess match (10 minutes)
      </Button>

      <div className="text-lg">
        {serverConnectionStatus === "unauthorized" && (
          <p className=" text-red-500">You need to log in!</p>
        )}
        {serverConnectionStatus === "waiting" && <p>Loading...</p>}
        {serverConnectionStatus === "error" && (
          <p className=" text-red-500">
            There was an Error while connecting to the game server
          </p>
        )}
      </div>

      <div className="text-sm text-slate-600">
        {isSearching ? (
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
