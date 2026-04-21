import { Move, PlayerColor, BoardStateCon4, Square } from "shared";
import Image from "next/image";

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

  const onButtonClicked = (square: number) => {
    onPlayerMove(square - 1);
  };

  return (
    <div className="flex flex-col justify-center items-center h-full gap-4">
      {times[0] !== -1 && (
        <div className="text-lg font-semibold">
          <div>
            Times: Yellow: {formatTime(times[0])}, Red: {formatTime(times[1])},
          </div>
        </div>
      )}
      <div
        className={`w-[min(100vw,50vh)] h-[min(100vw,50vh)] md:w-[min(50vw,70vh)] md:h-[min(50vw,70vh)] grid grid-rows-7 grid-cols-7`}
      >
        {[1, 2, 3, 4, 5, 6, 7].map((col) => (
          <button
            key={col}
            onClick={() => onButtonClicked(col)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {col}
          </button>
        ))}
        {boardState.board.map((sq: Square, index) => (
          <Image
            key={index}
            width="45"
            height="45"
            src={`/con4/${sq}.svg`}
            alt={`${sq} Circle on blue Background`}
          />
        ))}
      </div>
    </div>
  );
}
