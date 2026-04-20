import { useEffect, useState } from "react";

import {
  fourPlayer,
  Move,
  BoardState,
  PlayerColor,
  PromotablePieceType,
  BoardStateCon4,
  square,
} from "shared";
import Image from "next/image";
import { PromotionDialog } from "./PromotionDialog";

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
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.round(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };
  return (
    <div className="flex flex-col justify-center items-center h-full gap-4">
      {times[0] !== -1 && (
        <div className="text-lg font-semibold">
          <div>
            Times: red: {formatTime(times[0])}, blue: {formatTime(times[1])},
            yellow: {formatTime(times[2])}, green: {formatTime(times[3])}
          </div>
        </div>
      )}
      <div
        className={`w-[min(100vw,50vh)] h-[min(100vw,50vh)] md:w-[min(50vw,70vh)] md:h-[min(50vw,70vh)] grid grid-rows-7 grid-cols-6`}
      >
      {boardState.board.map((sq: square) => (
        <Image
          width="45"
          height="45"
          src={`/con4/${sq}.svg`}
          alt={ `${sq} Circle on blue Background`}
        />
      ))}
	  </div>
    </div>
  );
}
