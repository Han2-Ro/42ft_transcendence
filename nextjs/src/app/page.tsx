import LeaderBoard from "@/componets/LeaderBoard";
import Footer from "./Footer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-full flex flex-col">
      <main className="flex-1 p-8 flex flex-col items-center">
        <h1 className="mb-8 text-6xl">Chess 42</h1>
        <p className="text-4xl">Better than chess.com!</p>
        <section className=" py-10">
          <Link href="/stats">
            <h2 className="text-4xl pb-4 hover:text-gray-400">Leaderboard</h2>
          </Link>
          <LeaderBoard maxEntries={3} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
