import type {
  getGameFourHistory,
  getGameTwoHistory,
} from "@/lib/auth/actions";

/* const sampleEntries: GameHistoryEntry[] = [
  { date: new Date("2026-03-19T18:30:00Z"), opponent: "alice", result: "win" },
  { date: new Date("2026-03-18T21:10:00Z"), opponent: "bob", result: "draw" },
  { date: new Date("2026-03-17T16:45:00Z"), opponent: "carla", result: "lose" },
  { date: new Date("2026-03-13T17:25:00Z"), opponent: "grace", result: "draw" },
  { date: new Date("2026-03-16T20:00:00Z"), opponent: "david", result: "win" },
  { date: new Date("2026-03-15T14:15:00Z"), opponent: "eva", result: "win" },
  { date: new Date("2026-03-14T19:55:00Z"), opponent: "frank", result: "lose" },
]; */

export type GameHistoryData =
  | Awaited<ReturnType<typeof getGameTwoHistory>>
  | Awaited<ReturnType<typeof getGameFourHistory>>;

export default function GameHistory({
  maxEntries = Infinity,
  className,
  data,
}: {
  className?: string;
  maxEntries?: number;
  data: GameHistoryData;
}) {
  if ("error" in data) {
    return <p className="px-6 py-4">{data.error}</p>;
  }

  const entries = data;
  const showTeamColumns = entries.length > 0 && "opponents" in entries[0];

  return (
    <table className={className}>
      <thead>
        <tr>
          <th className="px-6 text-start">Date</th>
          {showTeamColumns ? (
            <>
              <th className="px-6 text-start">Teammate</th>
              <th className="px-6 text-start">Opponents</th>
            </>
          ) : (
            <th className="px-6 text-start">Opponent</th>
          )}
          <th className="px-6 text-start">Result</th>
          <th className="px-6 text-start">Reason</th>
        </tr>
      </thead>
      <tbody>
        {entries.slice(0, maxEntries).map((entry, index) => (
          <tr
            className={
              "border-t " +
              (entry.result === "win"
                ? "bg-green-300/20"
                : entry.result === "lose"
                  ? "bg-red-300/20"
                  : "bg-stone-600/50")
            }
            key={index}
          >
            <td className="px-6 py-4">{entry.date.toDateString()}</td>
            {"opponents" in entry ? (
              <>
                <td className="px-6 py-4">{entry.teammate}</td>
                <td className="px-6 py-4">{entry.opponents.join(", ")}</td>
              </>
            ) : (
              <td className="px-6 py-4">{entry.opponent}</td>
            )}
            <td className="px-6 py-4">{entry.result}</td>
            <td className="px-6 py-4">{entry.reason}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
