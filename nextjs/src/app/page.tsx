import LeaderBoard from "@/componets/LeaderBoard";
import Footer from "./Footer";
import Link from "next/link";
import GameHistory from "./history/GameHistory";

export default function Home() {
  return (
    <div className="h-full flex flex-col">
      <main className="flex-1 p-8 flex flex-col items-center">
        <h1 className="mb-8 text-6xl">Chess 42</h1>
        <p className="text-4xl">Better than chess.com!</p>
        <section className="grid lg:grid-cols-2 py-10 gap-10 w-full">
          <div className="bg-linear-110 from-gray-600/50 to bg-neutral-800 p-2 rounded-xl">
            <Link href="/stats">
              <h2 className="text-2xl w-full text-center pb-4 pt-2 hover:text-stone-400">
                Leaderboard
              </h2>
            </Link>
            <LeaderBoard maxEntries={3} />
          </div>
          <div className="bg-linear-230 from-gray-600/50 to-neutral-800 p-4 rounded-xl">
            <Link href="/history">
              <h2 className="text-2xl text-center pb-4 hover:text-stone-400">
                Recent Games
              </h2>
            </Link>
            <GameHistory className="w-full" maxEntries={3} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
