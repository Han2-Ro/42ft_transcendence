"use client";

import { useAuthConetxt } from "@/components/AuthProvider";
import { getWinRatio } from "@/lib/getWinRation";
import Link from "next/link";
import { useMemo, useState } from "react";

/* const sampleEntries: LeaderBoardEntry[] = [
  { username: "hannes", wins: 18, losses: 7, draws: 3 },
  { username: "alice", wins: 24, losses: 4, draws: 2 },
  { username: "bob", wins: 12, losses: 10, draws: 6 },
  { username: "carla", wins: 15, losses: 9, draws: 4 },
  { username: "david", wins: 9, losses: 11, draws: 8 },
  { username: "david", wins: 1, losses: 1, draws: 1 },
  { username: "Really_Long_Username1234567", wins: 20, losses: 1, draws: 1 },
]; */

export type LeaderBoardEntry = {
  username: string;
  wins: number;
  losses: number;
  draws: number;
};

type SortKey = "username" | "wins" | "losses" | "draws" | "winRatio";
type SortDirection = "asc" | "desc";

export default function LeaderBoard({
  maxEntries = Infinity,
  entries,
}: {
  maxEntries?: number;
  entries: LeaderBoardEntry[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("wins");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const { user } = useAuthConetxt();

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

    return sortDirection === "asc" ? "↑" : "↓";
  };

  const renderSortLabel = (label: string, key: SortKey) => {
    const arrow = sortArrow(key);

    return (
      <span className="inline-flex items-center gap-1">
        <span>{label}</span>
        <span aria-hidden="true" className="inline-block w-[1ch] text-left">
          {arrow}
        </span>
      </span>
    );
  };

  return (
    <div className="w-full max-w-240 min-w-0 overflow-x-auto rounded-lg border border-gray-300">
      <table className="w-full min-w-lg table-fixed border-collapse text-left">
        <thead className="bg-accent-primary">
          <tr>
            <th className="w-[25%] p-1 lg:p-3">
              <button
                className="font-semibold hover:text-neutral-400"
                onClick={() => handleSort("username")}
                type="button"
              >
                {renderSortLabel("Player", "username")}
              </button>
            </th>
            <th className="w-[18%] p-1 lg:p-3">
              <button
                className="font-semibold hover:text-neutral-400"
                onClick={() => handleSort("wins")}
                type="button"
              >
                {renderSortLabel("Wins", "wins")}
              </button>
            </th>
            <th className="w-[18%] p-1 lg:p-3">
              <button
                className="font-semibold hover:text-neutral-400"
                onClick={() => handleSort("losses")}
                type="button"
              >
                {renderSortLabel("Losses", "losses")}
              </button>
            </th>
            <th className="w-[18%] p-1 lg:p-3">
              <button
                className="font-semibold hover:text-neutral-400"
                onClick={() => handleSort("draws")}
                type="button"
              >
                {renderSortLabel("Draws", "draws")}
              </button>
            </th>
            <th className="w-[21%] p-1 lg:p-3">
              <button
                className="font-semibold hover:text-neutral-400"
                onClick={() => handleSort("winRatio")}
                type="button"
              >
                {renderSortLabel("Win Ratio", "winRatio")}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedEntries.slice(0, maxEntries).map((entry, index) => (
            <tr
              className={`border-t border-gray-200 ${user?.username === entry.username ? "bg-accent-primary/50" : ""}`}
              key={index}
            >
              <td className="p-1 lg:p-3 overflow-hidden text-ellipsis">
                <Link
                  className="hover:underline"
                  href={`/user-stats/${entry.username}`}
                >
                  {entry.username}
                </Link>
              </td>
              <td className="p-1 lg:p-3">{entry.wins}</td>
              <td className="p-1 lg:p-3">{entry.losses}</td>
              <td className="p-1 lg:p-3">{entry.draws}</td>
              <td className="p-1 lg:p-3">
                {(getWinRatio(entry) * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
