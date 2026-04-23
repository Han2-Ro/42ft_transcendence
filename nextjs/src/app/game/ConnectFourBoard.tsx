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

  return <></>;
}
