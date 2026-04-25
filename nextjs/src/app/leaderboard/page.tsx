import { PlainLink } from "@/componets/PlainLink";
import LeaderBoard from "./LeaderBoard";
import { getLeaderboard } from "@/lib/auth/actions";
import Link from "next/link";

export default async function Page() {
  const entries = await getLeaderboard();

  return (
    <>
      <div className="bg-background-secondary/50 flex pt-2 flex-row justify-center gap-2">
        <div className="p-2">
          <PlainLink href="/user-stats" label="Personal Stats" />
        </div>
        <div className="py-2 px-8 bg-background-primary rounded-t-md">
          <PlainLink href="/leaderboard" label="Leaderboard" />
        </div>
        <div className="p-2">
          <PlainLink href="/history" label="Match History" />
        </div>
      </div>
      <main className="p-4 flex flex-col items-center">
        <h1 className="pt-4 text-center pb-8 text-3xl font-bold">
          Leaderboard
        </h1>
        <LeaderBoard entries={entries} />
      </main>
    </>
  );
}
