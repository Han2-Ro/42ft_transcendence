import { result as GameResult } from "shared";

const sampleEntries: GameHistoryEntry[] = [
  { date: new Date("2026-03-19T18:30:00Z"), opponent: "alice", result: "win" },
  { date: new Date("2026-03-18T21:10:00Z"), opponent: "bob", result: "draw" },
  { date: new Date("2026-03-17T16:45:00Z"), opponent: "carla", result: "lose" },
  { date: new Date("2026-03-13T17:25:00Z"), opponent: "grace", result: "draw" },
  { date: new Date("2026-03-16T20:00:00Z"), opponent: "david", result: "win" },
  { date: new Date("2026-03-15T14:15:00Z"), opponent: "eva", result: "win" },
  { date: new Date("2026-03-14T19:55:00Z"), opponent: "frank", result: "lose" },
];

export type GameHistoryEntry = {
  date: Date;
  opponent: string;
  result: GameResult;
};

export default function GameHistory({
  maxEntries = Infinity,
  className,
}: {
  className?: string;
  maxEntries?: number;
}) {
  const entries = sampleEntries.sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
  return (
    <table className={className}>
      <thead className=" hidden">
        <tr>
          <th>Date</th>
          <th>Opponent</th>
          <th>Result</th>
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
            <td className="px-6 py-4">{entry.opponent}</td>
            <td className="px-6 py-4">{entry.result}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
