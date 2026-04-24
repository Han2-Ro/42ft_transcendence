import { getUserStats } from "@/lib/auth/actions";
import StatCards from "./StatCards";
import ErrorMessage from "@/componets/ErrorMessage";
import { getWinRatio } from "@/lib/getWinRation";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const stats = await getUserStats(username);
  return (
    <main className="px-4 py-8 size-fit mx-auto">
      <h1 className="text-4xl pb-4 font-bold">
        Stats for <span className="text-accent-primary">{username}</span>
      </h1>
      {"error" in stats ? (
        <ErrorMessage errorMsg={stats.error} />
      ) : (
        <>
          <h2 className="text-xl font-bold pb-2">Chess:</h2>
          <StatCards
            stats={[
              { label: "Wins", value: stats.userLookup.wins },
              { label: "Losses", value: stats.userLookup.losses },
              { label: "Draws", value: stats.userLookup.draws },
              { label: "Win Ration", value: getWinRatio(stats.userLookup) },
            ]}
          />
          <h2 className="pb-2 pt-8 font-bold text-xl">Connect 4:</h2>
          <StatCards
            stats={[
              { label: "Wins", value: stats.userLookup.connectWins },
              { label: "Losses", value: stats.userLookup.connectLosses },
              { label: "Draws", value: stats.userLookup.connectDraws },
              {
                label: "Win Ratio",
                value: getWinRatio({
                  wins: stats.userLookup.connectWins,
                  losses: stats.userLookup.connectLosses,
                  draws: stats.userLookup.connectDraws,
                }),
              },
            ]}
          />
        </>
      )}
    </main>
  );
}
