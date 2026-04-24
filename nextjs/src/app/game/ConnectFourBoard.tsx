"use client";

import { useEffect, useState } from "react";
import { Move, PlayerColor, BoardStateCon4 } from "shared";
import { PlayerCard } from "./PlayerCard";
import { useGameClock } from "./useGameClock";

const COLS = 7;
const ROWS = 6;

const SVG_W = 700;
const SVG_H = 600;

const BOARD_STROKE = 3;
const BOARD_INSET = BOARD_STROKE / 2;

const GRID_PAD_X = 20;
const GRID_PAD_Y = 20;
const CELL_W = (SVG_W - GRID_PAD_X * 2) / COLS;
const CELL_H = (SVG_H - GRID_PAD_Y * 2) / ROWS;
const HOLE_R = Math.min(CELL_W, CELL_H) * 0.38;

function getCellLayout(index: number) {
  const col = index % COLS;
  const row = Math.floor(index / COLS);

  const x = GRID_PAD_X + col * CELL_W;
  const y = GRID_PAD_Y + row * CELL_H;

  return {
    x,
    y,
    w: CELL_W,
    h: CELL_H,
    cx: x + CELL_W / 2,
    cy: y + CELL_H / 2,
  };
}

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


const activePlayerIndex = boardState.turn === "yellow" ? 0 : 1;
const { getDisplayTime } = useGameClock(times, activePlayerIndex);

  return (
    <div className="flex items-center justify-center gap-4">
      <div className="relative w-[min(100vw,56vh)] md:w-[min(50vw,70vh)] aspect-7/6 overflow-hidden">
        <div className="absolute inset-3">
          {boardState.board.map((square, index) => {
            const cell = getCellLayout(index);
            return (
              <div
                key={index}
                className="absolute"
                style={{
                  left: `${(cell.x / SVG_W) * 100}%`,
                  top: `${(cell.y / SVG_H) * 100}%`,
                  width: `${(cell.w / SVG_W) * 100}%`,
                  height: `${(cell.h / SVG_H) * 100}%`,
                }}
              >
                <div
                  className={`absolute inset-[12%] rounded-full transition-all duration-500 ease-in ${
                    square === "empty"
                      ? "opacity-0 -translate-y-[700%]"
                      : `${square === "yellow" ? "bg-yellow-400" : "bg-red-600"} opacity-100 ${mounted ? "translate-y-0" : "-translate-y-[700%]"}`
                  }`}
                />
              </div>
            );
          })}
        </div>

        <svg
          className="absolute text-blue-800 inset-3 w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)] pointer-events-none"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <mask id="connect4-holes-mask">
              <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="white" />
              {Array.from({ length: ROWS * COLS }, (_, i) => {
                const cell = getCellLayout(i);
                return (
                  <circle
                    key={i}
                    cx={cell.cx}
                    cy={cell.cy}
                    r={HOLE_R}
                    fill="black"
                  />
                );
              })}
            </mask>
          </defs>
          <rect
            x={BOARD_INSET}
            y={BOARD_INSET}
            width={SVG_W - BOARD_STROKE}
            height={SVG_H - BOARD_STROKE}
            rx="25"
            ry="25"
            fill="currentColor"
            mask="url(#connect4-holes-mask)"
            stroke="#aaaadd"
            strokeWidth={BOARD_STROKE}
            strokeLinejoin="round"
          />
          {Array.from({ length: ROWS * COLS }, (_, i) => {
            const cell = getCellLayout(i);
            return (
              <circle
                key={`ring-${i}`}
                cx={cell.cx}
                cy={cell.cy}
                r={HOLE_R}
                fill="none"
                stroke="#aaaadd"
                strokeWidth="3"
              />
            );
          })}
        </svg>

        <div className="absolute inset-3">
          {boardState.board.map((_, index) => {
            const cell = getCellLayout(index);
            return (
              <button
                key={index}
                className="absolute opacity-25 rounded-md hover:bg-black"
                style={{
                  left: `${(cell.x / SVG_W) * 100}%`,
                  top: `${(cell.y / SVG_H) * 100}%`,
                  width: `${(cell.w / SVG_W) * 100}%`,
                  height: `${(cell.h / SVG_H) * 100}%`,
                }}
                onClick={() => onPlayerMove(index % 7)}
                aria-label={`Drop chip in column ${(index % 7) + 1}`}
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <PlayerCard
          testId="player-card-opponent"
          name={playerColor === "yellow" ? "Yellow Player" : "Red Player"}
          color={playerColor === "white" ? "black" : "white"}
          isTurn={boardState.turn != playerColor}
          time={times[playerColor === "white" ? 1 : 0]}
          isTimed={times[playerColor === "white" ? 1 : 0] !== -1}
        />
        <PlayerCard
          testId="player-card-self"
          name={playerColor === "yellow" ? "Yellow Player" : "Yellow Player"}
          color={playerColor}
          isTurn={boardState.turn === playerColor}
          time={times[playerColor === "white" ? 0 : 1]}
          isTimed={times[playerColor === "white" ? 0 : 1] !== -1}
        />
      </div>
    </div>
  );
}
