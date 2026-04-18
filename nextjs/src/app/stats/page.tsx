import LeaderBoard from "./LeaderBoard";
import { getLeaderboard } from "@/lib/auth/actions";

export default async function Page() {
  const entries = await getLeaderboard();

  return (
    <main className="p-4 flex flex-col items-center">
      <h1 className="pt-4 text-center pb-8 text-3xl font-bold">Leaderboard</h1>
      <LeaderBoard entries={entries} />
    </main>
  );
}
