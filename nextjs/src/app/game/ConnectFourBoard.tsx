import { Move, PlayerColor, BoardStateCon4, Square } from "shared";
import Image from "next/image";

//TODO: complete redsign
//TODO: add player cards
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
  const onButtonClicked = (square: number) => {
    onPlayerMove(square - 1);
  };

  return (
    <div className="grid grid-cols-7 p-3 bg-blue-900 rounded-xl">
      {boardState.board.map((square, index) => (
        <button
          key={index}
          className="size-16"
          onClick={() => {
            onPlayerMove(index % 7);
          }}
        >
          <div
            className={`size-4/5 m-auto rounded-full ${square === "empty" ? "bg-background-primary" : square === "yellow" ? "bg-yellow-400" : "bg-red-600"}`}
          ></div>
        </button>
      ))}
    </div>
  );
}
