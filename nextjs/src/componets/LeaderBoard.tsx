"use client";

import { useMemo, useState } from "react";

const sampleEntries: LeaderBoardEntry[] = [
  { username: "hannes", wins: 18, losses: 7, draws: 3 },
  { username: "alice", wins: 24, losses: 4, draws: 2 },
  { username: "bob", wins: 12, losses: 10, draws: 6 },
  { username: "carla", wins: 15, losses: 9, draws: 4 },
  { username: "david", wins: 9, losses: 11, draws: 8 },
];

export type LeaderBoardEntry = {
  username: string;
  wins: number;
  losses: number;
  draws: number;
};

type SortKey = "username" | "wins" | "losses" | "draws" | "winRatio";
type SortDirection = "asc" | "desc";

function getWinRatio(entry: LeaderBoardEntry): number {
  const totalGames = entry.wins + entry.losses + entry.draws;

  if (totalGames === 0) {
    return 0;
  }

  return (0.5 * entry.draws + entry.wins) / totalGames;
}

export default function LeaderBoard({
  maxEntries = Infinity,
}: {
  maxEntries?: number;
}) {
  const entries = sampleEntries;
  const [sortKey, setSortKey] = useState<SortKey>("wins");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedEntries = useMemo(() => {
    const sorted = [...entries].sort((a, b) => {
      if (sortKey === "username") {
        return a.username.localeCompare(b.username);
      }

      if (sortKey === "winRatio") {
        return getWinRatio(a) - getWinRatio(b);
      }

      return a[sortKey] - b[sortKey];
    });

    if (sortDirection === "desc") {
      sorted.reverse();
    }

    return sorted;
  }, [entries, sortDirection, sortKey]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection(key === "username" ? "asc" : "desc");
  };

  const sortArrow = (key: SortKey) => {
    if (sortKey !== key) {
      return "";
    }

    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300">
      <table className="w-full border-collapse text-left">
        <thead className="bg-accent-primary">
          <tr>
            <th className="p-3">
              <button
                className="font-semibold"
                onClick={() => handleSort("username")}
                type="button"
              >
                Player{sortArrow("username")}
              </button>
            </th>
            <th className="p-3">
              <button
                className="font-semibold"
                onClick={() => handleSort("wins")}
                type="button"
              >
                Wins{sortArrow("wins")}
              </button>
            </th>
            <th className="p-3">
              <button
                className="font-semibold"
                onClick={() => handleSort("losses")}
                type="button"
              >
                Losses{sortArrow("losses")}
              </button>
            </th>
            <th className="p-3">
              <button
                className="font-semibold"
                onClick={() => handleSort("draws")}
                type="button"
              >
                Draws{sortArrow("draws")}
              </button>
            </th>
            <th className="p-3">
              <button
                className="font-semibold"
                onClick={() => handleSort("winRatio")}
                type="button"
              >
                Win Ratio{sortArrow("winRatio")}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedEntries.slice(0, maxEntries).map((entry) => (
            <tr className="border-t border-gray-200" key={entry.username}>
              <td className="p-3">{entry.username}</td>
              <td className="p-3">{entry.wins}</td>
              <td className="p-3">{entry.losses}</td>
              <td className="p-3">{entry.draws}</td>
              <td className="p-3">{(getWinRatio(entry) * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
