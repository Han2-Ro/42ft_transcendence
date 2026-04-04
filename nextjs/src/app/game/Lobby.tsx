import { Games } from "shared";

import Button from "../../componets/Button";

export default function Lobby({
  onFindMatchPressed,
  isSearching,
}: {
  onFindMatchPressed: (type: Games) => void;
  isSearching: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-5">
      <h1 className="text-4xl font-bold text-slate-800">Chess Lobby</h1>

      <Button
        onClick={() => onFindMatchPressed("chess")}
        loading={isSearching}
        disabled={isSearching}
        className="text-lg px-7 py-3 rounded-xl shadow-lg"
        loadingText="Finding game…"
      >
        Find chess Match
      </Button>
      <Button
        onClick={() => onFindMatchPressed("4pChess")}
        loading={isSearching}
        disabled={isSearching}
        className="text-lg px-7 py-3 rounded-xl shadow-lg"
        loadingText="Finding game…"
      >
        Find 4 player Chess Match
      </Button>

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
