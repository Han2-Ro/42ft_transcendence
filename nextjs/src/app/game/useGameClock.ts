import { useEffect, useState } from "react";

export function useGameClock(
  times: number[],
  activePlayerIndex: number
) {
  const [localTimes, setLocalTimes] = useState<number[]>(times);
  const [lastSync, setLastSync] = useState<number>(Date.now());
  const [, forceRender] = useState(0);

  // Sync when server sends new times
  useEffect(() => {
    setLocalTimes(times);
    setLastSync(Date.now());
  }, [times]);

  // Force UI updates (does NOT change logic)
  useEffect(() => {
    const interval = setInterval(() => {
      forceRender((x) => x + 1);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const getDisplayTime = (index: number) => {
    const baseTime = localTimes[index];

    // Only active player loses time
    if (index !== activePlayerIndex) return baseTime;

    const elapsed = (Date.now() - lastSync) / 1000;
    return Math.max(0, baseTime - elapsed);
  };

  return { getDisplayTime };
}