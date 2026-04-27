import LeaderBoard from "@/app/leaderboard/LeaderBoard";
import Link from "next/link";
import GameHistory from "./history/GameHistory";
import { getGameTwoHistory, getLeaderboard } from "@/lib/auth/actions";
import ErrorMessage from "@/components/ErrorMessage";
import { Anton } from "next/font/google";

const anton = Anton({ subsets: ["latin"], weight: "400" });

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
      {error === "42_already_linked" && (
        <ErrorMessage errorMsg="This 42 account is already linked to another 42Chess account."></ErrorMessage>
      )}
      {error === "42_no_acc_linked" && (
        <ErrorMessage errorMsg="No 42Chess account is linked to this 42 account."></ErrorMessage>
      )}
      <h1
        className={`${anton.className} md:mb-8 text-7xl flex flex-col items-center`}
        style={{ fontFamily: "Impact, Anton, sans-serif" }}
      >
        <div className="text-accent-primary text-[10rem]">42</div>
        <div>Chess</div>
      </h1>
      <p className="text-3xl italic text-gray-400">Better than chess.com!</p>
      <hr className="w-full my-8 border-t border-gray-300" />
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
