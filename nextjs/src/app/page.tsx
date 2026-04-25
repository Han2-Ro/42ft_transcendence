import LeaderBoard from "@/app/leaderboard/LeaderBoard";
import Link from "next/link";
import GameHistory from "./history/GameHistory";
import { getGameTwoHistory, getLeaderboard } from "@/lib/auth/actions";
import ErrorMessage from "@/componets/ErrorMessage";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const leaderboardEntries = await getLeaderboard();
  const gameHistoryEntries = await getGameTwoHistory();
  const { error } = await searchParams;
  return (
    <main className="p-2 md:p-8 flex flex-col items-center">
      <h1 className="md:mb-8 text-6xl">Chess 42</h1>
      {error === "42_already_linked" && (
        <ErrorMessage errorMsg="This 42 account is already linked to another 42Chess account."></ErrorMessage>
      )}
      {error === "42_no_acc_linked" && (
        <ErrorMessage errorMsg="No 42Chess account is linked to this 42 account."></ErrorMessage>
      )}
      <p className="text-4xl">Better than chess.com!</p>
      <section className="lg:grid lg:grid-cols-2 py-10 gap-10 w-full">
        <div className="bg-linear-110 from-gray-600/50 to bg-neutral-800 p-2 mb-8 lg:mb-0 rounded-xl">
          <Link href="/leaderboard">
            <h2 className="text-2xl w-full text-center pb-4 pt-2 hover:text-stone-400 after:ml-3 after:content-['›']">
              Leaderboard
            </h2>
          </Link>
          <LeaderBoard maxEntries={3} entries={leaderboardEntries} />
        </div>
        <div className="bg-linear-230 from-gray-600/50 to-neutral-800 p-4 rounded-xl">
          <Link href="/history">
            <h2 className="text-2xl text-center pb-4 hover:text-stone-400 after:ml-3 after:content-['›']">
              Your Recent Two Player Games
            </h2>
          </Link>
          <GameHistory
            className="w-full"
            maxEntries={3}
            data={gameHistoryEntries}
          />
        </div>
      </section>
    </main>
  );
}
