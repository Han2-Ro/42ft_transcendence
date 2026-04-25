import { useEffect, useState } from "react";
import { PlayerColor } from "shared";

export function useGameClock(
  times: Record<PlayerColor, number> | null,
  activePlayer: PlayerColor,
  isRunning: boolean
) {
  const [localTimes, setLocalTimes] = useState(times);
  const [lastSync, setLastSync] = useState(Date.now());
  const [, forceRender] = useState(0);

  useEffect(() => {
    setLocalTimes(times);
    setLastSync(Date.now());
  }, [times]);

  useEffect(() => {
    if (!isRunning || !times) return;

    const interval = setInterval(() => {
      forceRender((x) => x + 1);
    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, times]);

  const getDisplayTime = (player: PlayerColor) => {
    if (!localTimes) return null; // 👈 key

    const baseTime = localTimes[player];

    if (!isRunning) return baseTime;
    if (player !== activePlayer) return baseTime;

    const elapsed = (Date.now() - lastSync) / 1000;
    return Math.max(0, baseTime - elapsed);
  };

  return { getDisplayTime };
}