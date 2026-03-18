import Button from "./Button";

export default function Lobby({
  onFindMatchPressed,
  isSearching,
}: {
  onFindMatchPressed: () => void;
  isSearching: boolean;
}) {
  return (
    <div className="mt-12 flex flex-col items-center gap-5">
      <h1 className="text-4xl font-bold text-slate-800">Chess Lobby</h1>

      <Button
        onClick={onFindMatchPressed}
        loading={isSearching}
        className="text-lg px-7 py-3 rounded-xl shadow-lg"
        loadingText="Finding game…"
      >
        Find Match
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
