"use client";

import { useEffect, useState } from "react";
import { Move, PlayerColor, BoardStateCon4 } from "shared";

const COLS = 7;
const ROWS = 6;

export default function ConnectFourBoard({
  boardState,
  onPlayerMove,
  playerColor,
  times,
}: {
  boardState: BoardStateCon4;
  onPlayerMove: (move: Move) => void;
  playerColor: PlayerColor;
  times: number[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="relative w-[min(100vw,56vh)] md:w-[min(50vw,70vh)] aspect-7/6 p-3 overflow-hidden">
      <div className="absolute inset-3 grid grid-cols-7 grid-rows-6 gap-0">
        {boardState.board.map((square, index) => (
          <div key={index} className="relative">
            <div
              className={`absolute inset-[12%] rounded-full transition-all duration-500 ease-in ${
                square === "empty"
                  ? "opacity-0 -translate-y-[700%]"
                  : `${square === "yellow" ? "bg-yellow-400" : "bg-red-600"} opacity-100 ${mounted ? "translate-y-0" : "-translate-y-[700%]"}`
              }`}
            />
          </div>
        ))}
      </div>

      <svg
        className="absolute inset-3 w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)] pointer-events-none"
        viewBox="0 0 700 600"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <mask id="connect4-holes-mask">
            <rect x="0" y="0" width="700" height="600" fill="white" />
            {Array.from({ length: ROWS * COLS }, (_, i) => {
              const col = i % COLS;
              const row = Math.floor(i / COLS);
              return (
                <circle
                  key={i}
                  cx={col * 100 + 50}
                  cy={row * 100 + 50}
                  r={36}
                  fill="black"
                />
              );
            })}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="700"
          height="600"
          rx="28"
          ry="28"
          fill="#1d4ed8"
          mask="url(#connect4-holes-mask)"
        />
      </svg>

      <div className="absolute inset-3 grid grid-cols-7 grid-rows-6 gap-0">
        {boardState.board.map((_, index) => (
          <button
            key={index}
            className="w-full h-full"
            onClick={() => onPlayerMove(index % 7)}
            aria-label={`Drop chip in column ${(index % 7) + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
