import { Games } from "shared";

import Button from "../../componets/Button";

export type ConnectionStatus =
  | "connected"
  | "unauthorized"
  | "error"
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

      <Button
        onClick={() => onFindMatchTogglePressed("chess")}
        loadingNoDisabled={searching.includes("chess")}
        disabled={serverConnectionStatus != "connected"}
        className="text-lg px-7 py-3 rounded-xl shadow-lg"
        loadingText="Finding game…"
      >
        find chess match (no time limit)
      </Button>
      <Button
        onClick={() => onFindMatchTogglePressed("4pChess")}
        loadingNoDisabled={searching.includes("4pChess")}
        disabled={serverConnectionStatus != "connected"}
        className="text-lg px-7 py-3 rounded-xl shadow-lg"
        loadingText="Finding game…"
      >
        find 4 player chess match (no time limit)
      </Button>

      <Button
        onClick={() => onFindMatchTogglePressed("timedChess")}
        loadingNoDisabled={searching.includes("timedChess")}
        disabled={serverConnectionStatus != "connected"}
        className="text-lg px-7 py-3 rounded-xl shadow-lg"
        loadingText="Finding game…"
      >
        find chess match (10 minutes)
      </Button>
      <Button
        onClick={() => onFindMatchTogglePressed("4pTimedChess")}
        loadingNoDisabled={searching.includes("4pTimedChess")}
        disabled={serverConnectionStatus != "connected"}
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
