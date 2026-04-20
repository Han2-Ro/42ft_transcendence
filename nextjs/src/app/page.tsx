import LeaderBoard from "@/app/stats/LeaderBoard";
import Link from "next/link";
import GameHistory from "./history/GameHistory";
import { getLeaderboard } from "@/lib/auth/actions";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const leaderboardEntries = await getLeaderboard();
  const { error } = await searchParams;
  return (
    <main className="p-2 md:p-8 flex flex-col items-center">
      <h1 className="md:mb-8 text-6xl">Chess 42</h1>
      {error === "42_already_linked" && (
        <p className="text-red-500 mb-4">
          This 42 account is already linked to another 42Chess account.
        </p>
      )}
      <p className="text-4xl">Better than chess.com!</p>
      <section className="lg:grid lg:grid-cols-2 py-10 gap-10 w-full">
        <div className="bg-linear-110 from-gray-600/50 to bg-neutral-800 p-2 mb-8 lg:mb-0 rounded-xl">
          <Link href="/stats">
            <h2 className="text-2xl w-full text-center pb-4 pt-2 hover:text-stone-400">
              Leaderboard
            </h2>
          </Link>
          <LeaderBoard maxEntries={3} entries={leaderboardEntries} />
        </div>
        <div className="bg-linear-230 from-gray-600/50 to-neutral-800 p-4 rounded-xl">
          <Link href="/history">
            <h2 className="text-2xl text-center pb-4 hover:text-stone-400">
              Your Recent Games
            </h2>
          </Link>
          <GameHistory className="w-full" maxEntries={3} />
        </div>
      </section>
    </main>
  );
}
