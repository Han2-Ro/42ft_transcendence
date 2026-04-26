import { useEffect, useRef, useState } from "react";
import { PlayerColor } from "shared";

export function useGameClock(
  times: Record<PlayerColor, number> | null,
  activePlayer: PlayerColor,
  isRunning: boolean,
) {
  const lastSync = useRef<number | null>(null);
  const [, forceRender] = useState(0);

  useEffect(() => {
    lastSync.current = Date.now();
  }, [times]);

  useEffect(() => {
    if (!isRunning || !times) return;

    const interval = setInterval(() => {
      forceRender((x) => x + 1);
    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, times]);

  const getDisplayTime = (player: PlayerColor) => {
    if (!times) return null;

    const baseTime = times[player];

    if (player !== activePlayer) return baseTime;

    const elapsed = lastSync.current !== null ? (Date.now() - lastSync.current) / 1000 : 0;
    return Math.max(0, baseTime - elapsed);
  };

  return { getDisplayTime };
}
