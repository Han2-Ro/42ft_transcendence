import GameHistory from "./GameHistory";

export default function Page() {
  return (
    <main className="p-4">
      <h1 className="mb-4 text-3xl font-bold">Your Game History</h1>
      <GameHistory className="w-full max-w-200" />
    </main>
  );
}
