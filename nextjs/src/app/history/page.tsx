import {
  connectGameHistory,
  getGameFourHistory,
  getGameTwoHistory,
} from "@/lib/auth/actions";
import GameHistory from "./GameHistory";

export default async function Page() {
  const history2p = await getGameTwoHistory();
  const history4p = await getGameFourHistory();
  const historyConnect4 = await connectGameHistory();

  return (
    <main className="flex flex-col items-center">
      <h1 className="p-8 text-3xl font-bold">Your Game History</h1>
      <h2 className="p-4 text-xl font-bold">Two Player Chess</h2>
      <GameHistory className="w-full max-w-200" data={history2p} />
      <h2 className="p-4 mt-4 text-xl font-bold">Four Player Chess</h2>
      <GameHistory className="w-full max-w-200" data={history4p} />
      <h2 className="p-4 mt-4 text-xl font-bold">Four Player Chess</h2>
      <GameHistory className="w-full max-w-200" data={historyConnect4} />
    </main>
  );
}
