import { getGameTwoHistory } from "@/lib/auth/actions";
import GameHistory from "./GameHistory";

export default async function Page() {
  const history = await getGameTwoHistory();

  return (
    <main className="flex flex-col items-center">
      <h1 className="p-8 text-3xl font-bold">Your Game History</h1>
      <GameHistory className="w-full max-w-200" data={history} />
    </main>
  );
}
