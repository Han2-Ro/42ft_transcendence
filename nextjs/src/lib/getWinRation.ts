export function getWinRatio(entry: {
  wins: number;
  losses: number;
  draws: number;
}): number {
  const totalGames = entry.wins + entry.losses + entry.draws;

  if (totalGames === 0) {
    return 0;
  }

  return (0.5 * entry.draws + entry.wins) / totalGames;
}
